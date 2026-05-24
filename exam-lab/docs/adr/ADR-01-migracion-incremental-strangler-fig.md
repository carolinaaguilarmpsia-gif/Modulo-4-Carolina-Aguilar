# ADR‑0001: Migración Incremental a Microservicios usando Strangler Fig

## Metadatos

| Campo | Valor |
|-------|-------|
| Número | `0001` |
| Título | Migración Incremental a Microservicios usando Strangler Fig |
| Fecha | `24/05/2026` |
| Autor(es) | Carolina Aguilar (Tech Lead / Arquitectura) |
| Estado | **Aceptada** |
| Alcance | Todo el sistema — plataforma FTGO (monolito Java/WAR + microservicios emergentes) |
| Stakeholders consultados | Product Manager, Equipo de Desarrollo, DevOps, QA, Back Office |

---

## 1. Contexto

### Problema

FTGO opera en producción como un **monolito Java empaquetado en WAR** que exhibe los síntomas de *Monolithic Hell* descritos en [Cap.1 Richardson]:

- **Acoplamiento elevado**: los módulos de Order Taking, Delivery, Billing y Notifications comparten código y base de datos, lo que provoca que un cambio en cualquier módulo requiera rebuild y redeploy de todo el sistema.
- **Builds lentos**: el ciclo de build completo supera los 45 minutos, bloqueando la capacidad de entrega continua.
- **Despliegues de alto riesgo**: cualquier release implica sustituir el WAR completo; un bug en un módulo menor puede tumbar toda la plataforma en horario pico.
- **Escalado conflictivo**: Order Taking experimenta picos de tráfico que no se correlacionan con Delivery ni Billing. Escalar toda la aplicación para absorber picos de un solo módulo es costoso e ineficiente.
- **Baja resiliencia**: un fallo en la integración con Stripe o Google Maps propaga errores a flujos completamente no relacionados.
- **Bloqueo entre equipos**: los equipos de consumidor, restaurante y courier compiten por merge y release, generando cuellos de botella organizacionales.

### Restricciones

- El monolito **permanece en producción y debe seguir operativo** durante toda la migración; ningún release puede interrumpir pedidos en horario pico [Brief §A.4] [PRD Principio 1].
- El equipo tiene capacidad para operar **≥ 2 servicios en paralelo** con el pipeline CI/CD existente extendido [PRD §10].
- Presupuesto cloud acotado: escalado con límites máximos por servicio.
- Plazo para la primera ola Strangler: **Q3 2026** con canary ≥ 5 % en producción [PRD §3.3].

### Fuerzas en tensión

| Fuerza A | ↔ | Fuerza B |
|----------|----|----------|
| Velocidad de entrega (extraer rápido) | ↔ | Estabilidad operacional (no romper producción) |
| Independencia de equipos | ↔ | Consistencia de datos entre servicios |
| Despliegues pequeños y frecuentes | ↔ | Coexistencia con monolito durante transición |
| Escalado independiente por capacidad | ↔ | Complejidad operacional creciente |

---

## 2. Alternativas Consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|-------------|------|---------|------------------|
| **A. Mantener el monolito** | Cero costo de migración; equipo no necesita aprender nuevos paradigmas; operación simple | No resuelve ninguno de los problemas actuales; escalado ineficiente persiste; bloqueo de equipos continúa; deuda técnica crece indefinidamente; imposibilidad de escalar módulos independientes en pico [Cap.1 Richardson] | Bajo a corto plazo; alto a largo plazo por deuda acumulada |
| **B. Big Bang Rewrite** | Sistema nuevo limpio desde cero; sin deuda heredada; tecnología moderna en todos los servicios | Riesgo operacional inaceptable: el monolito deja de recibir mejoras mientras se reescribe; alto riesgo de regresión en producción; requiere feature parity total antes del cutover; meses o años sin valor entregable; históricamente propenso al fracaso [Cap.1 Richardson]; viola [PRD Principio 2] explícitamente | Muy alto: paralización del producto 6–18 meses |
| **C. Strangler Fig (patrón incremental)** | Migración gradual sin detener el monolito; extracción de capacidades por bounded context; rollback posible por feature flag; valor entregable en cada ola; equipo aprende microservicios progresivamente; reduce riesgo operacional [Cap.2 Richardson] | Complejidad transicional: dos sistemas coexisten; necesidad de API Gateway para routing; riesgo de dual-write y shared database durante la transición; requiere disciplina de equipo para no "alimentar" el monolito durante la migración | Medio: inversión incremental por ola, ROI visible en cada sprint |

---

## 3. Decisión

> **Elegimos la alternativa C: Migración incremental mediante el patrón Strangler Fig, extrayendo capacidades de negocio una ola a la vez, manteniendo el monolito operativo como fuente de verdad para entidades no migradas.**

El Strangler Fig permite a FTGO extraer capacidades de negocio (Order Taking, Notifications, Delivery, Billing) hacia microservicios independientes de forma progresiva, enrutando tráfico gradualmente a través de un **API Gateway** (canary 5 % → 40 % → 100 %) mientras el monolito sigue atendiendo los flujos no migrados [Brief §A.4] [Cap.2 Richardson].

Esta decisión es la única compatible con los invariantes del producto: no se puede interrumpir el servicio en horario pico, no existe presupuesto para un Big Bang, y el equipo necesita aprender a operar microservicios de forma incremental y segura. Cada ola de extracción entrega valor real (OP-01 a OP-06) y puede ser auditada contra métricas concretas antes de avanzar a la siguiente.

El criterio decisivo es la **reversibilidad controlada**: en cualquier punto del roadmap, el API Gateway puede desvolver el 100 % del tráfico al monolito sin pérdida de datos ni downtime planificado.

---

## 4. Consecuencias

### 4.1 Positivas

- El monolito permanece operativo durante toda la migración, eliminando el riesgo de downtime catastrófico.
- Los equipos de Order Taking, Delivery y Notifications pueden desplegar de forma independiente, reduciendo el lead time de deploy de ~4 h a ≤ 30 min [OP-01].
- Escalado horizontal independiente por servicio: Order Taking puede escalar 2–10 réplicas en pico sin arrastrar a Billing ni Delivery [OP-02].
- Fallos en integraciones externas (Stripe, Maps) quedan aislados al servicio responsable, protegiendo el flujo de pedidos [OP-04].
- El equipo adquiere experiencia en microservicios de forma progresiva, con cada ola validada antes de la siguiente.
- Cada extracción genera un bounded context documentado, insumo directo para los diagramas C4 [PRD §A.1].

### 4.2 Negativas / Costos

- **Complejidad transicional**: durante las olas 1–3, el sistema tendrá dos fuentes de verdad parciales (monolito + microservicios), requiriendo disciplina de equipo para evitar dual-write corrupto [PRD §13].
- **Shared database temporal**: en v1.0, Order Taking y el monolito comparten BD, creando acoplamiento de datos que debe resolverse en v1.2+ con estrategia de migración por dominio.
- **Carga operacional**: el equipo debe mantener y monitorear simultáneamente el monolito legado y los nuevos microservicios, incrementando la carga de operaciones.
- **API Gateway como punto único de fallo**: si no se configura con alta disponibilidad, el Gateway puede convertirse en el nuevo cuello de botella.
- **Contract drift**: el monolito y los microservicios pueden divergir en contratos de API si no se implementan contract tests desde el inicio [FSD §12].

### 4.3 Neutras / Observables

- El monolito dejará de recibir nuevas funcionalidades en los módulos que están siendo extraídos (congelación de módulos en extracción).
- La complejidad del sistema aumenta temporalmente durante la transición, pero disminuye a medida que los módulos son extraídos y el monolito se reduce.
- Los flujos de observabilidad (correlationId, distributed tracing) son necesarios desde la primera ola, lo que adelanta inversión en infraestructura de observabilidad.

---

## 5. Impacto en el Sistema

- **Código**: se crea estructura `services/order-service`, `notification-service`, `gateway/`, `monolith/` (legado) [FSD §2.4]. El monolito no se modifica estructuralmente, solo se congela la adición de nuevas capacidades en módulos en extracción.
- **Operaciones**: el API Gateway debe configurarse con canary routing (5 % → 25 % → 100 % por ola), health checks por servicio y rollback automático ante error rate > umbral. El pipeline CI/CD se extiende para soportar deploys independientes por servicio [OP-01].
- **Seguridad**: el API Gateway es el nuevo perímetro TLS; debe implementar rate limiting, autenticación y propagación de `correlationId`. No se introduce superficie de ataque nueva más allá del Gateway.
- **Equipo**: los desarrolladores necesitan capacitación en patrones de microservicios (circuit breaker, outbox, idempotencia), operación de API Gateway y distributed tracing. Curva de aprendizaje estimada: 2–4 semanas por ola.
- **Costo**: infraestructura incremental por servicio extraído (containers + registry + pipeline CI/CD adicional). El ahorro en escalado selectivo compensa la inversión a partir de la segunda ola.

---

## 6. Plan de Reversión

**Señales tempranas de que la decisión fue incorrecta:**
- Tasa de incidentes P1 aumenta > 20 % tras cada extracción.
- El equipo no puede mantener el monolito y los microservicios simultáneamente (burnout, incidentes no resueltos en SLA).
- La complejidad del routing en Gateway genera más bugs que los resueltos por la extracción.
- Dual-write produce inconsistencias de datos no detectadas hasta producción.

**Costo estimado de revertir:**
- Revertir a 100 % monolito es posible reconfigurando el Gateway en minutos (feature flag). El código del microservicio no se elimina, queda como referencia.
- Costo operacional de reversión: bajo en ola 1 (1 servicio), medio en ola 2 (3 servicios), alto en ola 3+ (5+ servicios).

**Plan B:**
- Congelar las extracciones en la ola actual, estabilizar el sistema en su estado híbrido, y retomar la migración con refuerzo de equipo o rediseño de la ola siguiente.

---

## 7. Validación

| Criterio | Métrica | Meta | Plazo | Responsable |
|----------|---------|------|-------|-------------|
| Canary sin incidentes P1 | incidentes P1 en ventana canary | 0 | Q3 2026 (ola 1) | DevOps |
| Lead time deploy Order Taking | minutos p95 | ≤ 30 min | Q3 2026 | Dev |
| % tráfico en microservicios | pedidos nuevos vía order-service | ≥ 40 % (ola 2) | Q4 2026 | Producto |
| Latencia checkout | p95 POST /orders | < 200 ms | Q3 2026 | Arquitectura |
| Rollback exitoso en < 5 min | tiempo de rollback Gateway | < 5 min | validación continua | DevOps |

---

## 8. Referencias

- [Cap.1 Richardson] — *Microservices Patterns* Ch.1: Escaping Monolithic Hell.
- [Cap.2 Richardson] — *Microservices Patterns* Ch.2: Decomposition Strategies + Strangler Fig.
- [Brief §A.4] — Brief FTGO: restricciones operacionales y principios de migración.
- [US-01] — PRD User Story: toma de pedidos (primera extracción Strangler).
- [US-02] — PRD User Story: gestión de tickets restaurante.
- [US-03] — PRD User Story: asignación y tracking courier.
- [PRD §3.3] — Roadmap de versiones FTGO v1.0–v2.0.
- [PRD §13] — Riesgos del producto: Strangler routing, dual-write, deuda shared database.
- [FSD §2.4] — Plan técnico: estructura de proyecto y decisiones anticipadas.
- [FSD-NFR-007] — NFR: Strangler Fig incremental, canary 5→40 %.
- Martin Fowler — "Strangler Fig Application" (martinfowler.com/bliki/StranglerFigApplication.html).
- ADR-0002 (este repositorio) — Comunicación híbrida REST + eventos asíncronos (decisión complementaria).

---

## 9. Historial

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| 1 | 24/05/2026 | Carolina Aguilar | Propuesta inicial — análisis de alternativas y decisión Strangler Fig |
| 2 | 24/05/2026 | Carolina Aguilar | Aceptada tras revisión con Tech Lead y validación contra PRD v1.0 / FSD v1.1 |
