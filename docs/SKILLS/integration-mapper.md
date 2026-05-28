# Skill: Integration Mapper — Adaptadores de Sistemas Legados

> **Cuándo usar:** Al implementar o modificar cualquier adaptador de integración con el Sistema de Nómina o el Sistema de Información Institucional.

---

## Procedimiento de ejecución

1. Confirmar resultado POC-01 (mecanismo: REST / readonly DB / CSV).
2. Crear clase `*Adapter implements ILegacyAdapter` en `infrastructure/legacy-adapters/`.
3. Job cron/Bull: sync diaria; `upsert` con `fuente_externa_id` + `sincronizado_at`.
4. `healthCheck()` para monitoreo; 3 reintentos con backoff 1s, 2s, 4s.
5. En lectura UI: servir BD local; si sync falló, banner + último `sincronizado_at`.
6. Validar payload entrante con Zod antes de persistir.

---

## Identidad

```yaml
skill_id: integration-mapper
versión: v1.0
dominio: infrastructure/legacy-adapters/
ADR_referencia: ADR-0002
POC_referencia: POC-01
```

---

## Contexto del Dominio

El SGAI integra con 2 sistemas legados que **NO pueden ser modificados** (RES-03):

| Sistema legado | Datos que provee | Frecuencia sync | Mecanismo (por confirmar POC-01) |
|---|---|---|---|
| Sistema de Nómina | Boletas de pago (haber, descuentos, neto, periodo) | 1x/día (2:00 AM) | REST API / BD solo lectura / CSV batch |
| Sistema de Información Institucional | Materias, carreras, asignaciones docentes, carga horaria | 1x/día (2:30 AM) | REST API / BD solo lectura / CSV batch |

---

## MUST

```
MUST implementar ILegacyAdapter con healthCheck() + fetchData() — sin escritura
MUST usar credenciales de solo lectura (usuario de BD sin DML, o token de API de solo lectura)
MUST almacenar datos sincronizados en la BD local del SGAI — NO consultar el legado en tiempo real
MUST registrar sincronizado_at en cada registro importado
MUST implementar modo degradado: si falla la sync, servir los últimos datos con warning al usuario
MUST alertar a la Unidad de TI si la sincronización falla 3 veces consecutivas
MUST validar el schema de los datos recibidos antes de persistir (Zod o similar)
MUST usar transacciones upsert de Prisma para evitar duplicados en sync
```

## MUST NOT

```
MUST NOT escribir, actualizar ni borrar datos en los sistemas legados
MUST NOT exponer credenciales de acceso al sistema legado en logs
MUST NOT hacer retry ilimitado — máximo 3 reintentos con backoff exponencial
MUST NOT bloquear el startup del SGAI si el sistema legado no está disponible
```

---

## Interfaz Canónica

```typescript
// infrastructure/legacy-adapters/ILegacyAdapter.ts
export interface ILegacyAdapter<T> {
  /**
   * Verifica que el sistema legado está disponible.
   * @returns true si disponible, false si en modo degradado
   */
  healthCheck(): Promise<boolean>;

  /**
   * Obtiene datos del sistema legado.
   * @param params - parámetros de filtro (periodo, docenteId, etc.)
   * @returns lista de registros validados
   */
  fetchData(params: Record<string, unknown>): Promise<T[]>;
}

// Implementación base
export abstract class BaseLegacyAdapter<T> implements ILegacyAdapter<T> {
  protected readonly MAX_RETRIES = 3;
  protected readonly TIMEOUT_MS = 5000;

  abstract healthCheck(): Promise<boolean>;
  abstract fetchData(params: Record<string, unknown>): Promise<T[]>;

  protected async withRetry<R>(fn: () => Promise<R>): Promise<R> {
    let lastError: Error;
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err as Error;
        await this.delay(Math.pow(2, i) * 1000); // backoff exponencial
      }
    }
    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Estructura del Cron Job de Sincronización

```typescript
// infrastructure/scheduler/sync.scheduler.ts
// Cron: '0 2 * * *' (2:00 AM diario)
export async function runNominaSync(
  adapter: ILegacyAdapter<BoletaPagoRaw>,
  repo: BoletaPagoRepository,
  logger: Logger
): Promise<SyncResult> {
  const correlationId = uuidv4();
  logger.info('Starting nomina sync', { correlationId });

  const isHealthy = await adapter.healthCheck();
  if (!isHealthy) {
    logger.warn('Nomina system unavailable — serving cached data', { correlationId });
    return { success: false, mode: 'degraded', correlationId };
  }

  const rawData = await adapter.fetchData({ periodo: currentPeriod() });
  const validated = rawData.map(raw => BoletaPagoSchema.parse(raw)); // Zod validation

  await repo.upsertBatch(validated, correlationId);
  logger.info('Nomina sync completed', { correlationId, records: validated.length });
  return { success: true, mode: 'live', records: validated.length, correlationId };
}
```

---

## Failure Modes del Adaptador

| Situación | Comportamiento | Log level |
|---|---|---|
| Sistema legado no disponible | Retornar modo degradado; no lanzar excepción | WARN |
| Schema inválido en datos recibidos | Descartar registro inválido; continuar con los válidos; loggear el error | ERROR |
| Timeout de conexión | Retry 3x con backoff; si falla → modo degradado | WARN → ERROR |
| Credenciales incorrectas | No reintentar; alertar a Unidad de TI inmediatamente | CRITICAL |
| Error de escritura en BD local | Rollback; marcar sync como fallida; alertar | ERROR |

---

## Checklist de salida

- [ ] Solo lectura hacia legados (RES-03 / ADR-0002)
- [ ] `sincronizado_at` en cada registro importado
- [ ] UI muestra advertencia en modo degradado
- [ ] Diagrama `docs/DIAGRAMS/seq_sync_legados.mmd` actualizado si cambia flujo
- [ ] Sin credenciales en logs
