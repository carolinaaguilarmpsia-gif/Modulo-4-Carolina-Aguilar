# ADR‑0002: Comunicación Híbrida REST + Eventos Asíncronos

## Metadatos

| Campo | Valor |
|-------|-------|
| Número | `0002` |
| Título | Comunicación Híbrida REST + Eventos Asíncronos |
| Fecha | `24/05/2026` |
| Autor(es) | Carolina Aguilar (Tech Lead / Arquitectura) |
| Estado | **Aceptada** |
| Alcance | Todo el sistema — comunicación inter-servicio entre microservicios FTGO y con el monolito legado |
| Stakeholders consultados | Product Manager, Equipo de Desarrollo, DevOps, QA, Arquitectura |

---

## 1. Contexto

### Problema

Al extraer capacidades del monolito hacia microservicios independientes (ADR-0001), surge inmediatamente la pregunta: **¿cómo se comunican los servicios entre sí?** Esta decisión tiene impacto directo en la resiliencia, la escalabilidad, la consistencia de datos y la complejidad operacional del sistema.

El dominio FTGO involucra flujos con requisitos de comunicación heterogéneos:

- **Flujos síncronos de cara al consumidor** [US-01]: cuando un consumidor crea un pedido, necesita una respuesta inmediata (confirmación o error) con latencia < 200 ms p95 [PRD-OP-03] [FSD-NFR-002]. Usar comunicación asíncrona para este flujo degradaría la experiencia de usuario.
- **Flujos de larga duración multi-servicio** [US-02] [US-03]: el ciclo de vida de un pedido atraviesa Order Taking → Order Fulfillment → Delivery → Billing → Notifications. Si un paso falla (restaurante rechaza, courier no disponible, Stripe down), el sistema debe compensar o reintentar sin que el consumidor experimente un error catastrófico.
- **Integraciones con sistemas externos** (Stripe, Google Maps, SendGrid, Twilio): estos sistemas tienen latencias variables y pueden no estar disponibles. Llamarlos síncronamente dentro de un flujo crítico crea dependencias frágiles [FSD §8] [PRD-NFR-006].
- **Desacoplamiento de notificaciones**: los eventos de estado de pedido (`OrderAccepted`, `CourierAssigned`, `OrderDelivered`) deben disparar notificaciones sin bloquear el flujo principal de negocio.

### Restricciones

- En v1.0, **Kafka no está disponible en producción** [PRD §3.2]: la cola de mensajes es ligera (RabbitMQ o AWS SQS) y el roadmap contempla migrar a Kafka en v1.2 [PRD §3.3].
- No se permite **2PC (Two-Phase Commit) cross-service** [FSD §2.4]: la consistencia distribuida debe lograrse mediante patrones de consistencia eventual.
- Timeouts máximos en integraciones externas: **3 segundos** [FSD §2.4] [FSD-NFR-006].
- El sistema debe mantener **disponibilidad 99.9 %** [PRD-OP-04] [FSD-NFR-003] incluso ante fallos parciales de servicios internos o externos.
- El `correlationId` es obligatorio en el **100 % de los caminos Must** para trazabilidad distribuida [FSD-NFR-005].

### Fuerzas en tensión

| Fuerza A | ↔ | Fuerza B |
|----------|----|----------|
| Latencia baja en checkout (síncrono) | ↔ | Resiliencia ante fallos de servicios dependientes |
| Consistencia fuerte (respuesta inmediata) | ↔ | Disponibilidad alta (eventual consistency aceptable) |
| Simplicidad de implementación (solo REST) | ↔ | Desacoplamiento real entre servicios |
| Preparación para Kafka en v1.2 | ↔ | No sobreingeniería en v1.0 |

---

## 2. Alternativas Consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|-------------|------|---------|------------------|
| **A. Solo REST síncrono** | Simple de implementar y depurar; contratos OpenAPI claros; respuesta inmediata en todos los flujos; tooling maduro | Cascada de fallos: si Billing o Notifications fallan, Order Taking falla con ellos; acoplamiento temporal entre servicios (disponibilidad del llamador depende de la disponibilidad del llamado); dificulta escalado independiente; no apto para flujos de larga duración (ciclo pedido completo puede tomar minutos) [Cap.2 Richardson]; viola el principio de aislamiento de fallos [PRD Principio 4] | Bajo en desarrollo inicial; alto en resiliencia y deuda técnica |
| **B. Solo mensajería asíncrona** | Desacoplamiento máximo; resiliencia natural ante fallos; escalado independiente por consumidor; facilita eventual consistency; preparado para Kafka desde el inicio | Impide respuestas inmediatas al consumidor en checkout (experiencia degradada); complejidad de tracing distribuido; manejo de dead-letter queues; dificultad para implementar sagas de compensación simples; curva de aprendizaje alta para el equipo; overkill para llamadas simples como validación de menú [FSD-UC-001] | Alto en infraestructura y operación desde v1.0 |
| **C. REST + Eventos asíncronos (híbrido)** | REST para flujos síncronos de cara al consumidor (latencia < 200 ms); eventos para desacoplamiento de servicios aguas abajo; cada servicio publica eventos de dominio al completar operaciones; permite consistencia eventual donde es aceptable; facilita integración con Kafka en v1.2 sin refactoring; correlationId propaga trazabilidad en ambos canales [Cap.2 Richardson] [FSD-NFR-004] | Requiere diseñar y documentar qué flujos son síncronos y cuáles asíncronos; doble patrón de comunicación incrementa la curva de aprendizaje inicial; riesgo de inconsistencias si no se implementa el patrón Outbox correctamente; la cola ligera (RabbitMQ/SQS) debe configurarse con alta disponibilidad | Medio: inversión en infraestructura de cola + definición de eventos de dominio |

---

## 3. Decisión

> **Elegimos la alternativa C: comunicación híbrida REST síncrono para flujos de cara al consumidor + eventos de dominio asíncronos para desacoplamiento inter-servicio y notificaciones.**

La lógica de la decisión es que los flujos de FTGO tienen naturaleza dual e irreconciliable bajo un solo paradigma:

**REST síncrono se aplica cuando:**
- El consumidor espera una respuesta directa (checkout, confirmación de pedido, tracking consultado).
- La operación tiene un SLA de latencia estricto (< 200 ms p95).
- El resultado debe ser confirmado antes de proceder (validación de menú, autorización de pago via Stripe).

**Eventos asíncronos se aplican cuando:**
- El resultado no es necesario inmediatamente para continuar (notificaciones email/SMS, actualización de estado en sistemas internos).
- El flujo atraviesa múltiples servicios con latencias variables (ciclo completo del pedido: Order → Fulfillment → Delivery → Billing).
- Un fallo del servicio consumidor del evento no debe afectar al productor.
- Se requiere audit trail de cambios de estado (catálogo de eventos: `OrderCreated`, `OrderAccepted`, `OrderRejected`, `CourierAssigned`, `OrderDelivered`, `PaymentCaptured`) [PRD §A.3].

El patrón **Outbox** garantiza que el microservicio persiste el evento en su propia base de datos como parte de la transacción local, eliminando la posibilidad de pérdida de eventos ante fallos de la cola [FSD §14]. La decisión también posiciona al sistema para migrar la cola ligera a Kafka en v1.2 sin cambios en los productores ni consumidores de eventos.

---

## 4. Consecuencias

### 4.1 Positivas

- El flujo de checkout [US-01] obtiene latencia p95 < 200 ms porque solo involucra REST síncrono hasta la confirmación inicial; las notificaciones y actualizaciones de estado viajan por eventos de forma paralela.
- Los servicios de Notifications, Billing y Order Fulfillment se desacoplan del flujo principal de Order Taking: si Notifications falla, el pedido sigue procesándose; la notificación se entregará cuando el servicio se recupere.
- El catálogo de eventos de dominio (`OrderCreated`, `CourierAssigned`, etc.) sirve como contrato explícito entre servicios, facilitando la generación de diagramas C4 de componentes y el onboarding de nuevos equipos.
- La resiliencia del sistema ante fallos de Stripe o Twilio mejora significativamente: los reintentos y dead-letter queues evitan pérdida de operaciones sin bloquear el flujo principal.
- La propagación del `correlationId` en ambos canales (headers HTTP + campos de evento) garantiza trazabilidad distribuida end-to-end [FSD-NFR-005].
- La cola ligera de v1.0 (RabbitMQ / SQS) puede migrarse a Kafka en v1.2 sin cambios en los contratos de eventos [PRD §3.3].

### 4.2 Negativas / Costos

- **Consistencia eventual visible**: entre el momento en que se publica `OrderAccepted` y el momento en que el consumidor ve el estado actualizado puede haber un lag < 5 s p95 [FSD-NFR-004]. La UI debe comunicar este estado ("actualizando…") para no generar desconfianza.
- **Complejidad de implementación del Outbox**: cada servicio que produce eventos debe implementar el patrón Outbox correctamente; omitirlo genera riesgo de pérdida de eventos ante caída de la cola [FSD §13].
- **Operación de la cola**: RabbitMQ / SQS requiere configuración de DLQ, alertas de backlog y monitoreo de mensajes no procesados. Añade carga operacional desde el primer día.
- **Debugging más complejo**: trazar un flujo asíncrono requiere correlacionar logs de múltiples servicios usando `correlationId`; sin buena infraestructura de observabilidad, los incidentes son más difíciles de diagnosticar [PRD-OP-05].
- **Riesgo de doble procesamiento**: los consumidores de eventos deben ser idempotentes para manejar el caso de re-entrega de mensajes [FSD BR-008].
- **Dos patrones en el codebase**: el equipo debe comprender cuándo usar REST y cuándo usar eventos, lo que requiere documentación clara y revisiones de arquitectura en cada PR.

### 4.3 Neutras / Observables

- Los servicios externos (Stripe, Maps, SendGrid, Twilio) siempre se llaman de forma síncrona desde el servicio correspondiente, pero con circuit breaker y timeout de 3 s, de modo que su fallo no propaga errores por el bus de eventos.
- El monolito puede emitir eventos a la cola a medida que se integra con los nuevos microservicios, facilitando la coexistencia durante la transición Strangler.
- La infraestructura de cola ligera de v1.0 puede coexistir con Kafka en v1.2 durante un período de transición dual.

---

## 5. Impacto en el Sistema

- **Código**: cada microservicio implementa dos interfaces: (a) API REST OpenAPI para operaciones síncronas, y (b) publicador/consumidor de eventos con el esquema de la cola. El patrón Outbox requiere una tabla `outbox_events` en la BD de cada servicio productor. Los módulos afectados son: `order-service`, `fulfillment-service`, `delivery-service`, `billing-service`, `notification-service` [FSD §2.4].
- **Operaciones**: se requiere desplegar y operar la cola de mensajes (RabbitMQ en contenedor o SQS en AWS) con alta disponibilidad, DLQ configurada, alertas de backlog > 1.000 mensajes y retención configurable. Los dashboards operacionales deben incluir métricas de la cola [FSD-UC-007].
- **Seguridad**: los mensajes en la cola no deben contener PAN ni CVV [PRD-NFR-008]. Los eventos de pago solo transportan identificadores de transacción Stripe. El acceso a la cola debe estar protegido por credenciales rotables.
- **Equipo**: se requiere capacitación en: diseño de eventos de dominio, patrón Outbox, idempotencia de consumidores, operación de RabbitMQ/SQS y estrategias de DLQ. Estimado: 1 semana de enablement antes de la primera ola.
- **Costo**: infraestructura de cola (RabbitMQ self-hosted en contenedor ≈ costo mínimo; SQS en AWS ≈ pay-per-use con costo prácticamente nulo en volúmenes v1.0). El costo operacional dominante es el tiempo de equipo en configuración y monitoreo.

---

## 6. Plan de Reversión

**Señales tempranas de que la decisión fue incorrecta:**
- La latencia de checkout p95 supera 200 ms de forma sostenida por overhead de la cola.
- Los eventos asíncronos generan estados inconsistentes visibles al consumidor por más de 5 s de forma recurrente.
- La tasa de mensajes en DLQ supera el 1 % del tráfico total de forma sostenida, indicando problemas estructurales en los consumidores.
- El equipo no logra implementar idempotencia correcta en los consumidores, generando dobles procesamientos con efectos en Billing.

**Costo estimado de revertir:**
- Revertir a solo REST implica eliminar la cola y refactorizar los servicios para hacer llamadas síncronas en cadena. Costo: alto (2–4 semanas de trabajo por ola migrada), con riesgo de introducir cascada de fallos en los flujos de larga duración.

**Plan B:**
- Si los eventos asíncronos generan problemas, se puede degradar temporalmente a REST síncrono en los flujos afectados, manteniendo la cola solo para Notifications (bajo riesgo). Esto reduce el alcance del patrón híbrido sin abandonarlo completamente.

---

## 7. Validación

| Criterio | Métrica | Meta | Plazo | Responsable |
|----------|---------|------|-------|-------------|
| Latencia checkout (REST) | p95 POST /orders | < 200 ms | Q3 2026 | Dev / QA |
| Lag de consistencia eventual | tiempo estado pedido visible consumidor | < 5 s p95 | Q3 2026 | QA |
| Tasa mensajes DLQ | % mensajes en DLQ / total | < 0.5 % | continuo | DevOps |
| Trazabilidad end-to-end | % flujos Must con correlationId | 100 % | Q3 2026 | Arquitectura |
| Notificaciones entregadas | % notificaciones exitosas | ≥ 99 % | Q3 2026 | Ops |
| Disponibilidad bajo fallo parcial | uptime con Stripe/Maps degradado | ≥ 99.9 % | continuo | DevOps |

---

## 8. Referencias

- [Cap.2 Richardson] — *Microservices Patterns* Ch.2: Communication Patterns, Sagas, Eventual Consistency.
- [Brief §A.4] — Brief FTGO: restricciones de comunicación inter-servicio y integraciones externas.
- [US-01] — PRD User Story: toma de pedidos (flujo REST síncrono).
- [US-02] — PRD User Story: gestión de tickets restaurante (flujo con eventos `OrderAccepted` / `OrderRejected`).
- [US-03] — PRD User Story: asignación courier (flujo con eventos `CourierAssigned` / `CourierRejected`).
- [PRD §A.3] — Catálogo de eventos de dominio v1.0 FTGO.
- [PRD §3.2] — Fuera de alcance v1.0: Kafka no en producción; en roadmap v1.2.
- [FSD §2.4] — Plan técnico: cola ligera RabbitMQ/SQS; sin 2PC cross-service.
- [FSD §8] — Integraciones externas con SLA, timeouts y auth.
- [FSD-NFR-004] — NFR: Eventual consistency lag < 5 s p95.
- [FSD-NFR-005] — NFR: Distributed tracing 100 % Must con correlationId.
- [FSD-NFR-006] — NFR: Tolerancia a fallos externos — timeout 3 s / 3 retries.
- [FSD BR-008] — Regla de negocio: idempotencia webhooks Stripe y eventos de cola.
- ADR-0001 (este repositorio) — Migración Incremental Strangler Fig (decisión que origina la necesidad de comunicación inter-servicio).

---

## 9. Historial

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| 1 | 24/05/2026 | Carolina Aguilar | Propuesta inicial — análisis de alternativas REST vs. async vs. híbrido |
| 2 | 24/05/2026 | Carolina Aguilar | Aceptada tras revisión con Tech Lead; refinado catálogo de eventos y criterios REST vs. async |
