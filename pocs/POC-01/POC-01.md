# POC-01: Integración con Sistemas Legados (Nómina y SII)

### 0. Metadatos

| Campo | Valor |
|-------|-------|
| ID | POC-01 |
| Título | Lectura de boletas y asignaciones desde legados |
| Grupo | G01 |
| Responsable(s) | Carolina Aguilar |
| Fecha de inicio | 12/05/2026 |
| Fecha de cierre | 16/05/2026 |
| Estado | **Completada — pass** |
| ADR relacionado | ADR-0002 |

### 1. Riesgo que mitiga

Sin mecanismo de lectura verificable, FSD-UC-004 y FSD-UC-005 no tienen datos; el SGAI no cumple el valor de self-service docente.

### 2. Hipótesis

> *Creemos que un adaptador `ILegacyNominaAdapter` con fuente CSV simulada (equivalente a batch institucional) permitirá recuperar ≥ 10 boletas con latencia p95 < 5 s bajo Docker local.*

### 3. Criterio de éxito medible (SMART)

| Métrica | Umbral éxito | Umbral fracaso |
|---------|--------------|----------------|
| Registros leídos | ≥ 10 boletas válidas | < 10 |
| Latencia p95 adaptador | < 5 s | ≥ 5 s |
| Errores de parseo | 0 % en dataset de prueba | > 5 % |

### 4. Alcance reducido (time-boxed)

- **Incluye:** adaptador lectura, script `run-poc.sh`, dataset sintético 15 filas.
- **Excluye:** UI SGAI, cifrado AES producción, VPN LDAP.
- **Duración máxima:** 5 días hábiles.

### 5. Diseño de la prueba

#### 5.1 Stack

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Runtime | Node.js | 20 LTS |
| Datos | CSV sintético | `fixtures/boletas_sample.csv` |

#### 5.2 Arquitectura POC

Ver `diagram.mmd` en esta carpeta.

### 6. Entorno

- **Local / Docker** — sin AWS (piloto ADR-0004).
- **Costo:** USD 0.

### 7. Resultado

| Métrica | Obtenido | Veredicto |
|---------|----------|-----------|
| Boletas leídas | 15/15 | pass |
| p95 latencia | 1,2 s | pass |
| Parse errors | 0 % | pass |

**Decisión desbloqueada:** ADR-0002 permanece **Aceptada**; proceder implementación `infrastructure/legacy/`.

Ver `log.md` y `README.md`.
