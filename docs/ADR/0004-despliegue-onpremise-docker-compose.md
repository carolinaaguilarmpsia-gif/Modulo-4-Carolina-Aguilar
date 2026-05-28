# ADR-0004: Despliegue on-premise con Docker Compose (v1.0 piloto)

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0004 |
| Título | On-premise Docker Compose |
| Fecha | 10/05/2026 |
| Autor(es) | Carolina Aguilar (G01) |
| Estado | **Aceptada** (piloto v1.0) |
| Alcance | Entornos dev, staging, production |
| Nota | Complementada por ADR-0005 para evolución cloud v2.0+ |

### 1. Contexto

BRD RES-02: datos en servidores universitarios. Unidad de TI sin Kubernetes. Ley N° 164 soberanía de datos en piloto.

### 2. Alternativas consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| A. Docker Compose en VM Ubuntu 22.04 | Operable por TI; bajo costo | Escala vertical |
| B. Kubernetes on-prem | Alta disponibilidad | Curva operativa |
| C. AWS ECS/EKS inmediato | Elasticidad | Requiere ADR-0005 + aprobación CEUB |

### 3. Decisión

> **Elegimos A para v1.0 piloto** (Nginx + API + Worker + PostgreSQL + Redis).

### 4. Consecuencias

RPO ≤ 24 h, RTO ≤ 4 h con `pg_dump`. ADR-0005 define migración objetivo sin invalidar soberanía (región `sa-east-1`, cifrado KMS).

### 5. Impacto

`docker-compose.yml`, DTI §8, `docs/diagrams/deploy_onprem_v1.mmd`

### 6. Plan de reversión

Si CEUB aprueba cloud híbrido → ADR-0005 supersede despliegue primario en v2.0.

### 8. Trazabilidad

BRD RES-02, DTI §8, NFR-004, NFR-005
