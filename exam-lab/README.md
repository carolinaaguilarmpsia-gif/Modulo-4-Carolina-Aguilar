# FTGO — Arquitectura de Microservicios

> Modernización incremental de una plataforma de delivery basada en *Microservices Patterns* de Chris Richardson (Manning, 2019).  
> Laboratorio académico · Módulo 4 · Exam Lab · Mayo 2026

---

## Índice de navegación

| Sección | Enlace |
|---------|--------|
| Descripción del proyecto | [→ ir](#descripción-del-proyecto) |
| Objetivos del laboratorio | [→ ir](#objetivos-del-laboratorio) |
| Tecnologías y conceptos | [→ ir](#tecnologías-y-conceptos-utilizados) |
| Estructura del repositorio | [→ ir](#estructura-del-repositorio) |
| Artefactos generados | [→ ir](#artefactos-generados) |
| ADRs | [→ ir](#architecture-decision-records-adrs) |
| Diagramas C4 | [→ ir](#diagramas-c4) |
| Prompts mejorados | [→ ir](#prompts-mejorados) |
| Trazabilidad | [→ ir](#matriz-de-trazabilidad) |
| Cómo usar este repositorio | [→ ir](#cómo-usar-este-repositorio) |
| Equipo | [→ ir](#equipo) |

---

## Descripción del proyecto

**FTGO (Food To Go)** es una plataforma de delivery en producción que conecta consumidores, restaurantes y couriers en un flujo continuo de pedido → preparación → entrega → facturación. El sistema fue concebido originalmente como un **monolito Java empaquetado en WAR** que, con el tiempo, acumuló los síntomas clásicos del *Monolithic Hell* descritos en el Capítulo 1 de Richardson:

- Builds que superan los 45 minutos.
- Despliegues de alto riesgo: cualquier cambio menor requiere reemplazar el WAR completo.
- Escalado conflictivo: Order Taking y Delivery compiten por los mismos recursos durante los picos de tráfico.
- Acoplamiento elevado entre módulos: un fallo en Stripe puede paralizar el flujo de pedidos completo.
- Bloqueo entre equipos: múltiples squads dependen del mismo ciclo de release.

Este repositorio documenta el **programa de modernización incremental v1.0** de FTGO: la extracción progresiva de capacidades de negocio hacia microservicios independientes utilizando el patrón **Strangler Fig** [Cap.2 Richardson], sin detener el monolito en producción.

### Artefactos generados en este laboratorio

| Artefacto | Descripción | Archivo |
|-----------|-------------|---------|
| BRD | Business Requirements Document | `docs/BRD.md` |
| MRD | Market Requirements Document | `docs/MRD.md` |
| PRD | Product Requirements Document | `docs/PRD.md` |
| FSD | Functional Specification Document | `docs/FSD.md` |
| ADR-0001 | Decisión: Strangler Fig | `docs/adr/ADR-01-migracion-incremental-strangler-fig.md` |
| ADR-0002 | Decisión: REST + Eventos async | `docs/adr/ADR-02-comunicacion-hibrida-rest-eventos-asincronos.md` |
| C4 Nivel 1 | Diagrama de Contexto | `docs/diagrams/c4_context.mmd` |
| C4 Nivel 2 | Diagrama de Contenedores | `docs/diagrams/c4_container.mmd` |
| Prompt PRD | Prompt mejorado para generar el PRD | `prompts_mejorados/prd_mejorado.md` |
| Prompt FSD | Prompt mejorado para generar el FSD | `prompts_mejorados/fsd_mejorado.md` |

---

## Objetivos del laboratorio

1. **Análisis arquitectónico** — Diagnosticar los síntomas del monolito FTGO y justificar la necesidad de migración usando el marco del *Monolithic Hell* [Cap.1 Richardson].

2. **Diseño basado en DDD estratégico** — Descomponer el dominio FTGO en Bounded Contexts alineados a capacidades de negocio: Consumer Management, Restaurant Management, Order Taking, Order Fulfillment, Delivery, Billing & Accounting y Notifications [Cap.2 Richardson].

3. **Documentación funcional trazable** — Producir un PRD y un FSD coherentes entre sí, con ≥ 8 casos de uso formalizados en Gherkin (Given/When/Then), NFRs cuantificados y trazabilidad completa al brief y al libro.

4. **Architecture Decision Records (ADRs)** — Registrar al menos 2 decisiones arquitectónicas significativas con contexto, alternativas evaluadas, decisión, consecuencias y plan de reversión, siguiendo el estándar del equipo.

5. **Diagramas C4** — Modelar el sistema en los niveles de Contexto (L1) y Contenedores (L2) usando sintaxis Mermaid válida, reflejando el estado objetivo post-migración.

6. **Mejora sistemática de prompts** — Aplicar los 5 requisitos D4 para transformar prompts semilla con TODOs abiertos en prompts de ingeniería controlados, auditables y reproducibles.

---

## Tecnologías y conceptos utilizados

| Tecnología / Concepto | Propósito en el proyecto |
|-----------------------|--------------------------|
| **Microservicios** | Unidad de despliegue independiente por capacidad de negocio (Order, Delivery, Billing, Notifications) |
| **DDD Estratégico** | Bounded Context como unidad de descomposición; Context Map para relaciones entre servicios |
| **Event-Driven Architecture** | Desacoplamiento entre servicios mediante eventos de dominio (`OrderCreated`, `CourierAssigned`, `PaymentCaptured`) |
| **Event Bus — RabbitMQ / SQS** | Mensajería asíncrona en v1.0; migración a Kafka planificada para v1.2 |
| **Apache Kafka** | Plataforma de streaming de eventos para v1.2+; garantías de ordenamiento y retención |
| **REST APIs (HTTPS/JSON)** | Comunicación síncrona para flujos de cara al consumidor con SLA de latencia < 200 ms p95 |
| **Strangler Fig Pattern** | Migración incremental: extracción de capacidades con routing canary 5 → 40 → 100 % |
| **Saga Pattern** | Coordinación de transacciones distribuidas multi-servicio sin 2PC (coreografía por eventos) |
| **Outbox Pattern** | Garantía de publicación atómica de eventos junto a la transacción de BD local |
| **C4 Model** | Visualización arquitectónica en 4 niveles: Contexto, Contenedores, Componentes, Código |
| **Architecture Decision Records** | Registro versionado de decisiones arquitectónicas con contexto, alternativas y consecuencias |
| **Prompt Engineering (D4)** | Mejora sistemática de prompts con TODOs resueltos, esqueletos formales y métricas comparativas |
| **Mermaid** | Diagramas como código: C4Context y C4Container renderizables en GitHub y herramientas compatibles |
| **OpenTelemetry / Jaeger** | Distributed tracing con `correlationId` end-to-end en 100 % de flujos críticos |
| **Stripe** | Procesamiento de pagos PCI-DSS; PAN/CVV nunca almacenados en FTGO |
| **Google Maps API** | Geocoding, cálculo de rutas y ETA para el servicio de Delivery |
| **SendGrid / Twilio** | Email y SMS transaccionales para el servicio de Notifications |

---

## Estructura del repositorio

```
ftgo-microservices/
│
├── README.md                          ← este archivo
│
├── docs/
│   ├── BRD.md                         ← Business Requirements Document
│   ├── MRD.md                         ← Market Requirements Document
│   ├── PRD.md                         ← Product Requirements Document v1.0
│   ├── FSD.md                         ← Functional Specification Document v1.1
│   │
│   ├── adr/
│   │   ├── ADR-0001-migracion-incremental-strangler-fig.md
│   │   └── ADR-0002-comunicacion-hibrida-rest-eventos-asincronos.md
│   │
│   └── c4/
│       ├── c4_context.mmd             ← C4 Nivel 1 — Diagrama de Contexto
│       └── c4_container.mmd           ← C4 Nivel 2 — Diagrama de Contenedores
│
└── prompts_mejorados/
    ├── prd_mejorado.md                ← Prompt D4 para generar PRD
    └── fsd_mejorado.md                ← Prompt D4 para generar FSD
```

---

## Artefactos generados

### BRD — Business Requirements Document

Define los objetivos de negocio que justifican la modernización de FTGO. Incluye el brief original del Anexo A con el diagnóstico del monolito, los 6 objetivos de negocio (BO-01 a BO-06) y las restricciones operacionales que gobiernan toda la migración.

**Restricciones clave declaradas en el BRD:**
- El monolito Java/WAR permanece operativo durante toda la migración; ningún release puede interrumpir pedidos en horario pico.
- Big Bang Rewrite está explícitamente prohibido por riesgo operacional.
- PAN/CVV nunca deben transitar ni almacenarse en FTGO; cumplimiento PCI-DSS delegado a Stripe.

---

### MRD — Market Requirements Document

Documenta el contexto de mercado, las personas y los pain points que el producto debe resolver desde la perspectiva del usuario. Incluye los perfiles de Consumidor, Restaurante, Courier y Back Office FTGO, con sus journeys actuales en el monolito y el delta de valor esperado tras la migración.

---

### PRD — Product Requirements Document

**Archivo**: `docs/PRD.md` · Versión `v1.0` · 24/05/2026

El PRD documenta *qué debe hacer el producto* para cumplir los objetivos del BRD/MRD. Cubre:

| Sección | Contenido |
|---------|-----------|
| Principios constitucionales | 4 invariantes del producto que gobiernan todas las decisiones |
| Objetivos del producto | OP-01 a OP-06 con métricas y metas concretas |
| Personas y user journeys | 6 personas con pain points actuales y necesidades futuras |
| User Stories | 17 historias con criterios INVEST, priorización MoSCoW/RICE y Gherkin |
| NFRs | 8 requisitos no funcionales con umbrales y justificación arquitectónica |
| Roadmap de versiones | v1.0 (Q3 2026) → v2.0 (Q2 2027) |
| Trazabilidad | BRD → MRD → PRD → FSD con referencias a Richardson |

**User stories semilla** (base para FSD y ADRs):

```
US-01: Toma de pedido          → FSD UC-01, UC-04, UC-08
US-02: Gestión de tickets      → FSD UC-02
US-03: Asignación courier      → FSD UC-03, UC-05, UC-06
```

---

### FSD — Functional Specification Document

**Archivo**: `docs/FSD.md` · Versión `v1.1` · 24/05/2026

El FSD especifica *cómo se comporta el sistema* para cada capacidad de negocio. Contiene 9 casos de uso formalizados (UC-01 a UC-09) con flujos principal, alternativos, reglas de negocio y bloques Gherkin.

| UC ID | Título | Capacidad | Origen |
|-------|--------|-----------|--------|
| UC-01 | Tomar pedido | Order Taking | US-01 |
| UC-02 | Aceptar / rechazar ticket | Order Fulfillment | US-02 |
| UC-03 | Asignar courier | Delivery | US-03 |
| UC-04 | Procesar pago en checkout | Billing & Accounting | Derivado PRD |
| UC-05 | Tracking en tiempo real | Delivery | Derivado PRD NFR |
| UC-06 | Reasignación automática courier | Delivery | Derivado US-03 |
| UC-07 | Dashboard operacional | Observabilidad | Derivado Brief §A.4 |
| UC-08 | Cancelación de pedido | Order Taking | Derivado PRD |
| UC-09 | Gestión de menú | Restaurant Management | Derivado Cap.2 |

**Catálogo de eventos de dominio** (definidos en FSD Anexo A.3):

```
OrderCreated         CourierAssigned      PaymentCaptured
OrderAccepted        CourierRejected      NotificationSent
OrderRejected        OrderDelivered       MenuItemAvailabilityChanged
OrderReadyForPickup  OrderCancelled
```

---

## Architecture Decision Records (ADRs)

Los ADRs registran las decisiones arquitectónicas significativas tomadas durante el diseño del programa de modernización. Cada ADR sigue la plantilla estándar del equipo con 9 secciones: metadatos, contexto, alternativas, decisión, consecuencias, impacto, plan de reversión, validación e historial.

### ADR-0001 — Migración Incremental usando Strangler Fig

**Archivo**: `docs/adr/ADR-0001-migracion-incremental-strangler-fig.md`  
**Estado**: Aceptada · 24/05/2026

| Alternativa | Decisión |
|-------------|----------|
| A. Mantener el monolito | Rechazada — no resuelve ninguno de los problemas actuales |
| B. Big Bang Rewrite | Rechazada — riesgo operacional inaceptable; violación de principio PRD |
| **C. Strangler Fig** | **✅ Elegida** — migración incremental sin interrumpir producción |

**Criterio decisivo**: el sistema debe poder revertir al 100 % del tráfico hacia el monolito en cualquier momento reconfigurando el API Gateway, sin pérdida de datos ni downtime planificado.

**Impacto en C4**: cada extracción define un nuevo Bounded Context que aparece como contenedor independiente en el diagrama L2.

---

### ADR-0002 — Comunicación Híbrida REST + Eventos Asíncronos

**Archivo**: `docs/adr/ADR-0002-comunicacion-hibrida-rest-eventos-asincronos.md`  
**Estado**: Aceptada · 24/05/2026

| Alternativa | Decisión |
|-------------|----------|
| A. Solo REST síncrono | Rechazada — cascada de fallos ante indisponibilidad de servicios downstream |
| B. Solo mensajería asíncrona | Rechazada — impide respuestas inmediatas en checkout (SLA < 200 ms) |
| **C. REST + Eventos async** | **✅ Elegida** — REST para flujos síncronos de cara al consumidor; eventos para desacoplamiento inter-servicio |

**Regla de aplicación**:

```
REST síncrono cuando:
  - El consumidor espera respuesta directa (checkout, confirmación).
  - Existe SLA de latencia estricto (< 200 ms p95).

Eventos asíncronos cuando:
  - El flujo atraviesa múltiples servicios con latencias variables.
  - Un fallo del consumidor del evento no debe afectar al productor.
  - Se requiere audit trail de cambios de estado (OrderCreated, CourierAssigned…).
```

**Ruta de migración del Event Bus**: RabbitMQ/SQS (v1.0) → Kafka (v1.2). Los contratos de eventos permanecen estables; solo cambia la infraestructura de transporte.

---

## Diagramas C4

Los diagramas siguen el modelo C4 de Simon Brown. Se generaron los niveles 1 y 2 en sintaxis Mermaid, compatibles con GitHub, GitLab y herramientas como Structurizr y Mermaid Live Editor.

### C4 Nivel 1 — Diagrama de Contexto

**Archivo**: `docs/c4/c4_context.mmd`

Muestra el sistema como caja negra: los 4 actores humanos (Consumidor, Restaurante, Courier, Back Office) interactuando con **FTGO Platform** y los 4 sistemas externos (Stripe, Google Maps, SendGrid, Twilio). No expone ningún detalle interno.

```bash
# Renderizar con Mermaid CLI
npx -p @mermaid-js/mermaid-cli mmdc \
  -i docs/c4/c4_context.mmd \
  -o docs/c4/c4_context.svg \
  --theme default
```

### C4 Nivel 2 — Diagrama de Contenedores

**Archivo**: `docs/c4/c4_container.mmd`

Expone los contenedores internos de FTGO Platform: el API Gateway (Strangler Fig router), los 5 microservicios extraídos, el Monolito Legacy, el Event Bus y las bases de datos por servicio. Cada relación declara tecnología y protocolo.

```bash
# Renderizar con Mermaid CLI
npx -p @mermaid-js/mermaid-cli mmdc \
  -i docs/c4/c4_container.mmd \
  -o docs/c4/c4_container.svg \
  --theme default
```

**Contenedores documentados en L2**:

| Contenedor | Tecnología | Rol |
|------------|-----------|-----|
| Web / Mobile App | React / React Native | UI para todos los actores |
| API Gateway | NGINX / AWS ALB | Strangler routing + TLS + rate limit |
| Order Service | Java / Spring Boot | Toma de pedidos, orquesta checkout |
| Restaurant Service | Java / Spring Boot | Tickets y gestión de menú |
| Delivery Service | Java / Spring Boot | Asignación courier y tracking |
| Billing Service | Java / Spring Boot | Cobro via Stripe, webhooks idempotentes |
| Notification Service | Node.js | Consume eventos; envía email y SMS |
| Monolito Legacy | Java WAR / Tomcat | Capacidades no migradas, fuente de verdad transicional |
| Event Bus | RabbitMQ/SQS → Kafka v1.2 | Mensajería async + DLQ + Outbox pattern |
| Order DB / Restaurant DB / … | PostgreSQL | BD por servicio, con tabla `outbox_events` |
| Legacy DB | MySQL | Datos del monolito no migrados aún |

---

## Prompts Mejorados

Los prompts del Módulo 4 se mejoraron aplicando los **5 requisitos D4** del docente para transformar prompts semilla con TODOs abiertos en prompts de ingeniería controlados, auditables y reproducibles.

### Requisitos D4 cumplidos (ambos prompts)

| Requisito D4 | PRD Mejorado | FSD Mejorado |
|--------------|:-----------:|:-----------:|
| ≥ 2 TODOs completados | ✅ 4/4 | ✅ 4/4 |
| ≥ 1 sección nueva | ✅ 4 nuevas | ✅ 4 nuevas |
| Changelog | ✅ | ✅ |
| Comando README | ✅ | ✅ |
| Métricas 3 corridas | ✅ | ✅ |

### `prompts_mejorados/prd_mejorado.md`

Mejoras sobre el seed `v0.1`:

- **TODO 1**: tabla de 9 stakeholders con ID, rol, necesidad y fuente del brief.
- **TODO 2**: tabla de 7 capacidades con bounded context y cita a Richardson.
- **TODO 3**: 6 criterios de stop cuantitativos con comandos bash verificables.
- **TODO 4**: esqueleto formal con placeholders y ejemplo NFR real.
- **Sección `Validation`**: checklist de 10 puntos pre-entrega.
- **Sección `Failure Modes Extendidos`**: 7 códigos de error (`E_MISSING_TRACEABILITY`, `E_INVALID_NFR`, `E_SCOPE_AMBIGUOUS`, etc.).

```bash
# Uso del prompt mejorado PRD
claude --model claude-sonnet-4-6 \
       --temperature 0.2 \
       --system-file prompts_mejorados/prd_mejorado.md \
       --user-file docs/brief_ftgo.md \
       --output docs/PRD.md
```

### `prompts_mejorados/fsd_mejorado.md`

Mejoras sobre el seed `v0.1`:

- **TODO 1**: tabla de 8 UCs con actor primario, capacidad PRD y origen explícito.
- **TODO 2**: regla de granularidad con 4 criterios para "UC nuevo" vs "flujo alternativo", con ejemplo FTGO concreto.
- **TODO 3**: 8 criterios de stop cuantitativos con comandos grep verificables.
- **TODO 4**: esqueleto de 7 campos + ejemplo completo de UC-01 con Gherkin válido.
- **Sección `Validation`**: checklist de 14 puntos pre-entrega.
- **Sección `Failure Modes Extendidos`**: 8 códigos de error (`E_INCOMPLETE_GWT`, `E_INVALID_CAPABILITY_MAPPING`, etc.).

```bash
# Uso del prompt mejorado FSD
claude --model claude-sonnet-4-6 \
       --temperature 0.2 \
       --system-file prompts_mejorados/fsd_mejorado.md \
       --user-file docs/PRD.md \
       --user-file docs/brief_ftgo.md \
       --output docs/FSD.md
```

---

## Matriz de trazabilidad

La trazabilidad completa garantiza que cada decisión, requisito y caso de uso puede rastrearse hacia atrás hasta el brief y el libro de Richardson, y hacia adelante hasta los diagramas C4.

| Richardson | Brief §A | BRD | MRD | PRD | FSD UC | ADR | C4 |
|------------|---------|-----|-----|-----|--------|-----|----|
| Cap.1 — Monolithic Hell | §A.1 diagnóstico | BO-01…06 | MRD-FTGO-01…09 | PRD-NFR-001 | contexto §1 | ADR-0001 §1 | — |
| Cap.2 — Strangler Fig | §A.4 migración | BO-06 | — | PRD-REQ-011, OP-06 | UC-01 gateway | ADR-0001 §3 | Gateway L2 |
| Cap.2 — Capacidades | §A.2 capacidades | — | — | PRD §3 | UC-01…UC-09 | — | Contenedores L2 |
| [US-01] | §A.3 semilla | BR-001 | MRD-FTGO-01 | PRD-US-001 | UC-01, UC-04, UC-08 | ADR-0002 §1 | Order Svc L2 |
| [US-02] | §A.3 semilla | BR-002 | MRD-FTGO-02 | PRD-US-006 | UC-02 | — | Restaurant Svc L2 |
| [US-03] | §A.3 semilla | BR-003 | MRD-FTGO-03 | PRD-US-010 | UC-03, UC-05, UC-06 | ADR-0002 §1 | Delivery Svc L2 |
| Cap.2 — Eventos | §A.4 EDA | — | — | PRD-NFR-004 | UC-01…UC-09 eventos | ADR-0002 §3 | Event Bus L2 |
| Cap.2 — Billing | §A.2 billing | BR-004 | MRD-FTGO-04 | PRD-US-003 | UC-04 | ADR-0002 §3 | Billing Svc L2 |

---

## Cómo usar este repositorio

### Prerrequisitos

```bash
# Node.js para renderizar diagramas Mermaid
node --version   # >= 18.x recomendado

# Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Claude CLI (opcional, para regenerar artefactos con los prompts mejorados)
npm install -g @anthropic-ai/claude-code
```

### Renderizar los diagramas C4

```bash
# Nivel 1 — Contexto
mmdc -i docs/c4/c4_context.mmd -o docs/c4/c4_context.svg --theme default

# Nivel 2 — Contenedores
mmdc -i docs/c4/c4_container.mmd -o docs/c4/c4_container.svg --theme default

# Ambos en un comando
for f in docs/c4/*.mmd; do
  mmdc -i "$f" -o "${f%.mmd}.svg" --theme default
done
```

### Regenerar el PRD con el prompt mejorado

```bash
claude --model claude-sonnet-4-6 \
       --temperature 0.2 \
       --system-file prompts_mejorados/prd_mejorado.md \
       --user-file docs/brief_ftgo.md \
       --output docs/PRD.md
```

### Regenerar el FSD con el prompt mejorado

```bash
claude --model claude-sonnet-4-6 \
       --temperature 0.2 \
       --system-file prompts_mejorados/fsd_mejorado.md \
       --user-file docs/PRD.md \
       --user-file docs/brief_ftgo.md \
       --output docs/FSD.md
```

### Verificar integridad de los artefactos

```bash
# Verificar NFRs cuantificados en el PRD
grep -c "Métrica:" docs/PRD.md         # debe ser ≥ 5

# Verificar UCs con GWT en el FSD
grep -c "Given:" docs/FSD.md           # debe ser ≥ 8

# Verificar trazabilidad al brief
grep -c "Brief §A.4" docs/PRD.md       # debe ser ≥ 5
grep -c "Brief §A.4" docs/FSD.md       # debe ser ≥ 1

# Verificar ADRs aceptados
grep -c "Aceptada" docs/adr/*.md       # debe ser ≥ 2

# Verificar diagramas Mermaid válidos
mmdc -i docs/c4/c4_context.mmd   --outputFormat=svg -o /tmp/test_ctx.svg
mmdc -i docs/c4/c4_container.mmd --outputFormat=svg -o /tmp/test_cnt.svg
echo "Diagramas válidos ✓"
```

---

## Roadmap del proyecto

```
v1.0  Q3 2026  ──  Strangler Ola 1: Order Service + Notification Service
                   API Gateway (canary 5%) + Stripe + observabilidad base
                   ← este repositorio documenta este estado

v1.1  Q4 2026  ──  Delivery Service + tracking Google Maps
                   Reasignación automática courier

v1.2  Q1 2027  ──  Billing Service completo
                   Event Bus migrado a Kafka
                   Dual-write strategy per domain

v2.0  Q2 2027  ──  Order Fulfillment + Restaurant Management desacoplados
                   80% tráfico fuera del monolito
                   Monolito reducido a módulos residuales
```

---

## Equipo

| Rol | Nombre | Responsabilidades |
|-----|--------|-------------------|
| Product Manager / Autora | Carolina Aguilar | BRD, MRD, PRD, FSD, ADRs, C4, Prompts mejorados, README |
| Tech Lead / Arquitectura | (revisor) | Revisión ADRs, validación diagramas C4 |
| QA | (revisor) | Validación Gherkin, trazabilidad FSD ↔ PRD |
| Docente | Módulo 4 — Exam Lab | Evaluación de artefactos y prompts D4 |

---

## Referencias

| Fuente | Cita |
|--------|------|
| *Microservices Patterns* | Richardson, Chris. Manning Publications, 2019. ISBN: 978-1617294549 |
| Strangler Fig Application | Martin Fowler. `martinfowler.com/bliki/StranglerFigApplication.html` |
| C4 Model | Simon Brown. `c4model.com` |
| Architecture Decision Records | Michael Nygard. `cognitect.com/blog/2011/11/15/documenting-architecture-decisions` |
| DDD Estratégico | Eric Evans. *Domain-Driven Design*. Addison-Wesley, 2003 |
| Outbox Pattern | Eventuate.io. `microservices.io/patterns/data/transactional-outbox.html` |
| Saga Pattern | Richardson, Cap. 4. `microservices.io/patterns/data/saga.html` |

---

## Licencia académica

Este repositorio es un trabajo académico desarrollado en el contexto del **Módulo 4 — Exam Lab**. El caso de estudio FTGO pertenece al libro *Microservices Patterns* de Chris Richardson (Manning, 2019). Todos los diagramas, ADRs, PRD, FSD y prompts son originales del equipo, elaborados a partir del brief y el libro mencionado.

---

*Generado el 24/05/2026 · Módulo 4 — Exam Lab · FTGO Microservices v1.0*
