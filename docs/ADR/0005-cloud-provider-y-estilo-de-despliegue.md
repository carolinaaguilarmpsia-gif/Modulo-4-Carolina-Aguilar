# ADR-0005: Proveedor cloud AWS y estilo de despliegue objetivo (v2.0+)

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0005 |
| Título | Cloud provider AWS y despliegue objetivo |
| Fecha | 18/05/2026 |
| Autor(es) | Carolina Aguilar (G01) |
| Estado | **Aceptada** (objetivo Release 2.0.0 — no reemplaza piloto on-prem hasta cutover) |
| Alcance | Infraestructura v2.0+, integración event-driven, DR |
| Stakeholders consultados | Unidad de TI, Director DPA |

### 1. Contexto

Tras validar el piloto on-premise (ADR-0004), el SGAI debe escalar a múltiples sedes CEUB, mejorar DR (RPO/RTO) y habilitar colas gestionadas sin operar Redis en VM. La rúbrica de Defensa Final exige mapeo C4 ↔ hexagonal ↔ event-driven ↔ **AWS**. Restricción: Ley N° 164 — datos personales y financieros con cifrado, auditoría y preferencia de residencia en región cercana (`sa-east-1` São Paulo).

**Fuerzas:** costo OPEX vs. elasticidad; soberanía vs. managed services; equipo pequeño vs. operación 24/7.

### 2. Alternativas consideradas

| Alternativa | Pros | Contras | Costo aprox. (mensual est.) |
|-------------|------|---------|------------------------------|
| A. **AWS** — ECS Fargate + RDS PostgreSQL + ElastiCache Redis + ALB + EventBridge/SQS | Ecosistema maduro; IAM; KMS; región SA | Curva IAM/VPC; factura si mal dimensionado | USD 350–900 (staging) |
| B. Azure (AKS + PostgreSQL Flexible) | Integración AD/LDAP común en edu | Menor familiaridad del equipo | Similar |
| C. Mantener solo on-prem | Cero lock-in cloud | No cumple meta multi-sede v2.0 | USD 0 cloud |
| D. GCP GKE | Buen Kubernetes | Menor presencia institucional Bolivia | Similar a A |

### 3. Decisión

> **Elegimos AWS (alternativa A)** como proveedor objetivo para Release 2.0.0, con despliegue **ECS Fargate** (sin EKS en fase inicial), **Amazon RDS for PostgreSQL 15**, **ElastiCache Redis 7**, **Application Load Balancer**, **Amazon EventBridge** + **SQS** para eventos de dominio (evolución de Bull interno), **Secrets Manager** para secretos, **CloudWatch** + **X-Ray** (opcional) para observabilidad.

**Criterios decisivos:** alineación con laboratorio del módulo; documentación DTI §8.5; KMS para PII (NFR-004); estrategia híbrida — piloto on-prem hasta gate de go-live CEUB.

### 4. Consecuencias

#### 4.1 Positivas

- Auto-scaling del servicio API en picos de fin de semestre.
- Backups RDS automáticos (RPO < 1 h configurable).
- EventBridge desacopla notificaciones e integraciones (ADR-0006).

#### 4.2 Negativas / costos

- Capacitación IAM/VPC/Terraform para Unidad de TI.
- OPEX recurrente; requiere aprobación presupuesto > USD 6.000/año piloto.
- Latencia LDAP on-prem → requiere VPN/Direct Connect o réplica de usuarios.

#### 4.3 Neutras

- Código de dominio sin cambios si se respetan puertos hexagonales (ADR-0001).

### 5. Impacto en el sistema

| Componente C4 (v1) | Mapeo AWS (v2.0) |
|--------------------|------------------|
| SPA React | S3 + CloudFront (o sigue Nginx en edge institucional) |
| API REST | ECS Fargate service `sgai-api` |
| Worker Notificaciones | ECS Fargate `sgai-worker` + SQS queue |
| PostgreSQL | RDS PostgreSQL Multi-AZ (staging: Single-AZ) |
| Redis / Bull | ElastiCache Redis; cola crítica → SQS estándar |
| Scheduler sync | EventBridge Scheduler → Lambda o ECS task |
| SMTP / LDAP | VPC peering / VPN a intranet universitaria |

- **Seguridad:** KMS CMK para RDS; Secrets Manager; TLS en ALB; WAF opcional en producción.
- **Ley 164:** cifrado en reposo y tránsito; logs sin PII; DPA con AWS según contrato institucional.

### 6. Plan de reversión

- Señales: costo > 150 % presupuesto 3 meses; latencia LDAP > 500 ms p95.
- Plan B: mantener ADR-0004 on-prem como primario; usar AWS solo para DR (RDS read replica).

### 7. Validación

- POC-02 métricas de carga guían sizing de task CPU/RAM.
- Checklist pre-go-live: penetration test, backup restore drill, IAM least privilege.

### 8. Trazabilidad

| ID | Enlace |
|----|--------|
| MRD-N-010 | Escalabilidad multi-sede |
| PRD roadmap v2.0 | Release 2.0.0 |
| DTI | §8.5 Mapeo AWS |
| ADR-0006 | Event-driven |
