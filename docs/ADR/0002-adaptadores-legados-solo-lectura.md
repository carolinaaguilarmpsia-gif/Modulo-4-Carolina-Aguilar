# ADR-0002: Adaptadores de solo lectura para sistemas legados con modo degradado

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0002 |
| Título | Adaptadores legados solo lectura + modo degradado |
| Fecha | 10/05/2026 |
| Autor(es) | Carolina Aguilar (G01) |
| Estado | **Aceptada** |
| Alcance | Integraciones nómina, SII, LDAP |
| Stakeholders consultados | Unidad de TI |

### 1. Contexto

RES-03 del BRD prohíbe modificar sistemas de nómina e institucional. Los módulos de boletas (FSD-UC-005) y horarios (FSD-UC-004) dependen de datos externos con disponibilidad incierta.

### 2. Alternativas consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|-------------|------|---------|------------------|
| A. Adaptadores solo lectura + cache local | Cumple RES-03; modo degradado (NFR) | Datos con desfase ≤ 24 h | Bajo |
| B. ETL batch nocturno único | Simple | Sin consulta near-real-time | Bajo |
| C. Modificar legados para push | Datos frescos | Violación RES-03; inaceptable | N/A |

### 3. Decisión

> **Elegimos A:** puertos `ILegacyNominaAdapter`, `ILegacySIIAdapter` en infrastructure; scheduler node-cron; retry 3× backoff; servir cache con `sincronizado_at` si falla.

### 4. Consecuencias

**Positivas:** desacoplamiento; POC-01 valida mecanismo de lectura. **Negativas:** consistencia eventual con legados. **Neutras:** skill `integration-mapper.md` documenta procedimiento.

### 5. Impacto

- **Código:** `infrastructure/legacy/*`, scheduler
- **POC:** POC-01 — ≥ 10 boletas en < 5 s

### 6. Plan de reversión

Si legados exponen API estable REST → simplificar adaptador; mantener puerto de dominio.

### 7. Validación

POC-01 en `pocs/POC-01/` con métricas en `log.md`.

### 8. Trazabilidad

BR-008, FSD-UC-004, FSD-UC-005, DTI §12.1
