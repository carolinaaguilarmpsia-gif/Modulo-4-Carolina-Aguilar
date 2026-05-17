# Skill: DJ Validator — Auditor de Declaraciones Juradas

> **Cuándo usar este skill:** Siempre que el agente genere, modifique o revise cualquier lógica relacionada con el ciclo de vida de las Declaraciones Juradas (DJ): máquina de estados, validaciones, endpoints, servicios de dominio o tests.

---

## Identidad del Skill

```yaml
skill_id: dj-validator
versión: v1.0
dominio: declaracion-jurada
bounded_context: backend/domain/declaracion-jurada/
reglas_aplicables: [RB-01, RB-03, RB-06]
```

---

## Contexto del Dominio

Una **Declaración Jurada (DJ)** es un documento institucional obligatorio que el docente debe presentar periódicamente. Tiene un ciclo de vida con las siguientes transiciones:

```
BORRADOR
  └──[enviar: Docente]──► EN_REVISION_FACULTAD
                              ├──[aprobar: Admin.Facultad]──► APROBADA (terminal)
                              └──[devolver: Admin.Facultad]──► DEVUELTA
                                                                 └──[reenviar: Docente]──► EN_REVISION_FACULTAD
                              └──[escalar: Admin.Facultad]──► EN_REVISION_DPA
                                                                 ├──[aprobar: TécnicoDPA]──► APROBADA (terminal)
                                                                 └──[rechazar: TécnicoDPA]──► RECHAZADA (terminal)
```

---

## MUST — Reglas Obligatorias

```
MUST verificar vinculacion_activa = true antes de permitir crear o enviar una DJ (RB-01)
MUST rechazar cualquier modificación a DJ en estado APROBADA o EN_REVISION_* con HTTP 403 (RB-03)
MUST insertar en HISTORIAL_DJ en la MISMA transacción que el cambio de estado (RB-06)
MUST encolar notificación SMTP al actor destino de forma asíncrona (Bull) — nunca síncrona
MUST registrar en log de auditoría: actor_id, dj_id, estado_anterior, estado_nuevo, timestamp
MUST incluir correlationId en todo log relacionado con DJ
```

## MUST NOT

```
MUST NOT permitir transición de estado sin verificar el rol del actor ejecutante
MUST NOT exponer campos de historial sin filtrar por dj_id del docente autenticado
MUST NOT permitir estado "APROBADA" si la DJ no pasó por Facultad primero
MUST NOT loggear campos_formulario completos (pueden contener PII)
```

---

## Transiciones Válidas (tabla de referencia)

| Estado actual | Comando | Actor válido | Condición de guarda | Estado nuevo |
|---------------|---------|--------------|---------------------|--------------|
| BORRADOR | ENVIAR | DOCENTE | vinculacion_activa = true | EN_REVISION_FACULTAD |
| EN_REVISION_FACULTAD | APROBAR | ADMIN_FACULTAD | misma facultad del docente | APROBADA |
| EN_REVISION_FACULTAD | DEVOLVER | ADMIN_FACULTAD | observaciones != null | DEVUELTA |
| EN_REVISION_FACULTAD | ESCALAR_DPA | ADMIN_FACULTAD | — | EN_REVISION_DPA |
| DEVUELTA | REENVIAR | DOCENTE | — | EN_REVISION_FACULTAD |
| EN_REVISION_DPA | APROBAR | TECNICO_DPA | — | APROBADA |
| EN_REVISION_DPA | RECHAZAR | TECNICO_DPA | observaciones != null | RECHAZADA |

---

## Firma del Servicio de Dominio

```typescript
// backend/domain/declaracion-jurada/DeclaracionJuradaService.ts
interface TransicionDJCommand {
  djId: string;          // UUID
  comando: ComandoDJ;    // 'ENVIAR' | 'APROBAR' | 'DEVOLVER' | 'ESCALAR_DPA' | 'REENVIAR' | 'RECHAZAR'
  actorId: string;       // UUID del usuario ejecutante
  actorRol: Rol;
  actorFacultadId?: string;
  observaciones?: string; // REQUERIDO si comando = DEVOLVER | RECHAZAR
}

interface TransicionDJResult {
  djId: string;
  estadoAnterior: EstadoDJ;
  estadoNuevo: EstadoDJ;
  historialId: string;
  notificacionEncolada: boolean;
}
```

---

## Failure Modes y Códigos HTTP

| Situación | Código HTTP | Mensaje de error |
|-----------|-------------|------------------|
| DJ no encontrada | 404 | `DJ_NOT_FOUND` |
| Actor sin permisos para el comando | 403 | `FORBIDDEN_TRANSITION` |
| Transición de estado inválida | 422 | `INVALID_STATE_TRANSITION` |
| Observaciones requeridas pero ausentes | 422 | `OBSERVATIONS_REQUIRED` |
| Docente sin vinculación activa | 403 | `INACTIVE_BINDING` |
| Error de BD (rollback total) | 500 | `PERSISTENCE_ERROR` |

---

## Ejemplo de Test Unitario Esperado

```typescript
describe('DeclaracionJuradaService.transicionar', () => {
  it('MUST reject ENVIAR if docente has vinculacion_activa = false', async () => {
    // Given
    const docente = buildDocente({ vinculacion_activa: false });
    // When / Then
    await expect(service.transicionar({
      djId: 'uuid', comando: 'ENVIAR', actorId: docente.id, actorRol: Rol.DOCENTE
    })).rejects.toThrow('INACTIVE_BINDING');
  });

  it('MUST insert HISTORIAL_DJ atomically with state change', async () => {
    // Verify that both updates happen in the same transaction
    const spy = jest.spyOn(prisma, '$transaction');
    await service.transicionar(validCommand);
    expect(spy).toHaveBeenCalledTimes(1);
    // Both state update and historial insert inside the transaction
  });
});
```
