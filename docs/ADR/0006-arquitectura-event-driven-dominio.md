# ADR-0006: Arquitectura event-driven para efectos secundarios e integraciones (v2.0+)

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0006 |
| Título | Event-driven — dominio + colas gestionadas |
| Fecha | 18/05/2026 |
| Autor(es) | Carolina Aguilar (G01) |
| Estado | **Aceptada** (evolución desde Bull in-process v1.0) |
| Alcance | Notificaciones, sync legados, reportes pesados |
| Relacionado | ADR-0001 (monolito), ADR-0005 (AWS SQS/EventBridge) |

### 1. Contexto

En v1.0 los eventos `DJ_STATE_CHANGED` y `OFERTA_STATE_CHANGED` se publican vía Bull+Redis **dentro del monolito** (DTI §7). RB-06 exige commit de estado **antes** de encolar. Para v2.0 se requiere consistencia eventual controlada entre bounded contexts sin sagas distribuidas complejas en el primer corte.

### 2. Alternativas consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| A. Bull in-process (v1.0) | Simple; atómico con mismo proceso | No escala workers independiente |
| B. **Outbox + SQS/EventBridge** | Entrega at-least-once; workers escalables | Infra adicional; idempotencia obligatoria |
| C. Kafka + sagas choreografía | Máxima escala | Overkill para G01; operación pesada |
| D. RabbitMQ self-hosted | Flexible | Otra VM que operar (conflicto ADR-0004) |

### 3. Decisión

> **v1.0:** mantener Bull (ADR vigente en código piloto).  
> **v2.0:** **Outbox pattern** en PostgreSQL + publicador a **Amazon EventBridge**; consumidores en ECS (`sgai-worker-notif`, `sgai-worker-sync`). Sin saga distribuida para DJ — transición de estado sigue en transacción única (RB-06).

**Idempotencia:** `jobId = hash(djId, estadoNuevo, timestamp_bucket)`; consumidores con deduplicación en Redis o tabla `processed_events`.

### 4. Consecuencias

**Positivas:** NFR-001 — HTTP no espera SMTP; NFR-002 reportes async. **Negativas:** eventualidad visible al usuario (< 60 s email). **Neutras:** mismos eventos del catálogo DTI §7.1.

### 5. Impacto

- **Código:** `infrastructure/messaging/` — `IEventPublisher` port; adaptador Bull (v1) y EventBridge (v2).
- **Dominio:** sin importar AWS SDK en `domain/`.

### 6. Validación

POC-02 confirma que estado + historial no se corrompen bajo concurrencia antes de extraer cola.

### 8. Trazabilidad

FSD-UC-002, RB-06, DTI §6–§7, PR-FSD-UC-002
