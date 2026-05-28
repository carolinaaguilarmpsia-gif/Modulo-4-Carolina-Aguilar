# POC-02: Máquina de Estados DJ bajo Concurrencia (RB-06)

### 0. Metadatos

| Campo | Valor |
|-------|-------|
| ID | POC-02 |
| Título | Transición atómica DJ + historial bajo carga |
| Grupo | G01 |
| Responsable(s) | Carolina Aguilar |
| Fecha de inicio | 14/05/2026 |
| Fecha de cierre | 17/05/2026 |
| Estado | **Completada — pass** |
| ADR relacionado | ADR-0001 |

### 1. Riesgo que mitiga

Race conditions en `PATCH /declaraciones-juradas/:id/estado` podrían violar RB-06 (historial huérfano o doble estado).

### 2. Hipótesis

> *Creemos que `prisma.$transaction([UPDATE, INSERT historial])` con aislamiento READ COMMITTED mantendrá exactamente 1 estado final y N filas de historial = N transiciones exitosas bajo 50 VUs concurrentes.*

### 3. Criterio de éxito medible (SMART)

| Métrica | Umbral éxito | Umbral fracaso |
|---------|--------------|----------------|
| Estados finales únicos en BD | 1 | > 1 |
| Historial huérfano | 0 filas | ≥ 1 |
| p95 HTTP (simulado) | < 2000 ms | ≥ 2000 ms |

### 4. Alcance

- Script k6 simulado + verificador SQL mock en `scripts/verify-poc.sh`.
- **Time-box:** 3 días hábiles.

### 7. Resultado

| Métrica | Antes (sin transacción — baseline teórico) | Después ($transaction) |
|---------|---------------------------------------------|-------------------------|
| Estados inconsistentes / 50 VUs | ~12 % (modelo) | **0 %** |
| Historial huérfano | ~8 % | **0** |
| p95 latencia simulada | 890 ms | **420 ms** |

Ver `log.md`.
