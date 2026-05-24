# Business Requirements Document (BRD) — FTGO (Food To Go)

> **Propósito del BRD**: formalizar las **necesidades y restricciones de negocio** que justifican la migración de arquitectura de FTGO, *independientemente de la solución técnica*. Responde a **"¿qué necesita el negocio y por qué?"**.
>
> **Alcance en este módulo**: este BRD captura la visión del *sponsor* para la migración de la aplicación monolítica FTGO a microservicios, como primer documento de la cadena `BRD → MRD → PRD → FSD → DTI`. El BRD se alinea al marco del método científico aplicado al software (S02): aquí se formula la **etapa "Problema"** —qué dolor real resolvemos y por qué importa— antes de pasar a la abstracción de producto en MRD/PRD.

---

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| Producto | FTGO (Food To Go) |
| Grupo | `<identificador del grupo>` |
| Versión | `v0.1` |
| Fecha | `22/05/2026` |
| Sponsor de negocio | Director de Tecnología — FTGO Inc. |
| Stakeholders | Consumidores, Restaurantes, Couriers, Empleados FTGO (back office), Equipo de Arquitectura, Sistemas Externos (Stripe, Google Maps, SendGrid, Twilio) |
| Autores | Equipo de Arquitectura FTGO |
| Revisores | Docente + 1 grupo par |
| Estado | Borrador |
| Insumo del Módulo Anterior (M2 UI/UX) | `<ruta a 01_Vision_de_Negocio_*.md u otros entregables M2>` |
| Prompts utilizados | PR-BRD-001 (basado en Brief Anexo A — Módulo 4) |

## 1. Resumen ejecutivo

**Problema**: FTGO opera desde hace varios años como una aplicación monolítica Java (WAR) que ha alcanzado el punto de quiebre: builds de ~45 minutos, incapacidad de escalar módulos individualmente ante el tráfico pico 5x en horarios de almuerzo y cena, falta de aislamiento de fallos y lock-in tecnológico están impidiendo el crecimiento sostenido del negocio (Richardson, Cap. 1).

**Propuesta**: migrar la arquitectura hacia microservicios aplicando el patrón **Strangler Fig** durante 18–24 meses, descomponiendo el monolito en 7 capacidades de negocio independientes (Consumer Management, Restaurant Management, Order Taking, Order Fulfillment/Kitchen, Delivery, Billing & Accounting, Notifications), cada una con su propia base de datos y pipeline de despliegue.

**Valor esperado**:
- Reducción del tiempo de build CI/CD de ~45 min a ≤ 10 min por servicio (–78 %).
- Disponibilidad ≥ 99,9 % mensual en el flujo de toma de pedidos (actualmente no garantizada).
- Capacidad de absorber tráfico pico 5x escalando únicamente los servicios bajo demanda, con ahorro operativo estimado en 30–40 % de los costos de compute en picos.

**Métricas clave de éxito**:

| KPI | Meta | Horizonte |
|-----|------|-----------|
| Disponibilidad flujo Order Taking (North Star) | ≥ 99,9 % mensual | Q4 2026 |
| Latencia p95 acciones del consumidor | < 200 ms | Q4 2026 |
| Capacidades migradas con Strangler Fig | ≥ 4 de 7 | Q2 2027 |

**Llamada a la acción**: se requiere aprobación del presupuesto de infraestructura cloud (CAPEX estimado USD 200 K en Año 1), acceso al repositorio del monolito legacy y designación formal del equipo de arquitectura para iniciar la Fase 0 de migración.

## 2. Contexto del negocio

- **Organización**: FTGO Inc.
- **Unidad impactada**: Tecnología y Producto (Ingeniería de Software).
- **Proceso(s) de negocio afectado(s)**: toma de pedidos, gestión de restaurantes, asignación y tracking de couriers, procesamiento de pagos, notificaciones a usuarios.
- **Estrategia de la organización** que justifica el proyecto: sostener el crecimiento operativo de la plataforma de delivery y acelerar la entrega de nuevas funcionalidades eliminando las restricciones impuestas por el monolito. La dirección de FTGO decidió migrar a microservicios para habilitar la autonomía de equipos (cada squad despliega su servicio independientemente) y cumplir los SLAs de disponibilidad y latencia comprometidos con consumidores y restaurantes [Brief §A.1].

## 3. Problema y oportunidad de negocio

### 3.1 Problema

El monolito de FTGO presenta los síntomas clásicos del "infierno monolítico" documentados en el Cap. 1 de Richardson (2019): **(1)** builds lentos (~45 min) que ralentizan el ciclo de entrega de nuevas funcionalidades; **(2)** módulos fuertemente acoplados que impiden escalar solo aquellas capacidades bajo alta demanda —el tráfico pico 5x en horarios de almuerzo (12:00–14:00) y cena (19:00–22:00) afecta a todo el sistema aunque únicamente Order Taking requiera escalar—; **(3)** ausencia de aislamiento de fallos, lo que significa que un error en Notifications puede propagarse y afectar Order Taking; **(4)** lock-in tecnológico en Java que dificulta adoptar tecnologías especializadas en servicios satélite; y **(5)** un equipo de desarrollo cada vez más bloqueado por el volumen del código base. La consecuencia de no actuar es la incapacidad de sostener el crecimiento, el riesgo de perder los SLAs de disponibilidad (99,9 %) y latencia (< 200 ms p95) comprometidos, y el aumento progresivo de la deuda técnica hasta requerir una reescritura total de mayor costo y riesgo [Brief §A.1; Richardson Cap. 1].

### 3.2 Oportunidad

- **Valor económico estimado**: reducción de 30–40 % en costos de compute en horarios pico al escalar solo los servicios que lo requieren; ahorro operativo acumulado estimado en USD 450 K en 3 años; resultado neto positivo desde el Año 2.
- **Valor estratégico / reputacional**: autonomía de equipos (despliegues independientes por capacidad), aceleración del time-to-market, posicionamiento competitivo ante plataformas de delivery que ya operan con arquitecturas distribuidas.
- **Ventana de oportunidad**: el equipo tiene dominio actual del monolito; diferir la migración incrementa la deuda técnica y el riesgo de una reescritura total (big-bang), más costosa y de mayor riesgo operativo.

### 3.3 Evidencia de Continuous Discovery

> Vincula este BRD al **track de Discovery** del Dual‑Track Agile (ver S04 §B6).

- **Documento de Discovery**: `docs/discovery/discovery_v0.1.md` (entregable de S03).
- **Fuente canónica del dominio**: Richardson, *Microservices Patterns* (Manning, 2019) — Cap. 1 (síntomas del monolito), Cap. 2 (descomposición por capacidad de negocio), Cap. 3 (IPC), Cap. 4 (sagas y consistencia de datos). Repositorio oficial FTGO: https://github.com/microservices-patterns/ftgo-application.
- **Evidencia de campo (NFRs del Brief §A.4)**: tráfico pico 5x documentado, latencia < 200 ms p95 requerida, disponibilidad 99,9 % comprometida, migración incremental Strangler Fig de 18–24 meses como restricción operativa validada.
- **Hipótesis principal validada**: la descomposición por capacidades de negocio (Decompose by Business Capability, Cap. 2) es la estrategia apropiada para FTGO dadas las 7 capacidades estables identificadas.
- **Artefactos M2 (UI/UX)**: `<wireframes, journeys, use cases del módulo anterior>`.
- **Próxima cadencia de Discovery**: quincenal durante la Fase 0 de migración.

## 4. Usuarios objetivo / Personas clave

> Se identifican los **2 usuarios principales** del sistema desde la perspectiva del negocio.

### 4.1 Persona principal

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Consumidor — usuario final de la app móvil/web |
| Contexto | Ordena comida desde su smartphone o navegador durante horarios de almuerzo y cena. Alta sensibilidad a la latencia y al estado del pedido en tiempo real [Brief §A.2]. |
| *Jobs‑to‑be‑done* | 1) Explorar menús de restaurantes cercanos. 2) Realizar un pedido con método de pago preferido. 3) Rastrear el estado de su pedido en tiempo real. 4) Recibir notificaciones de confirmación, preparación y entrega. 5) Cancelar o modificar un pedido si es necesario. |
| Dolores principales | Respuesta lenta en horarios pico, falta de visibilidad del estado del pedido, errores al confirmar pago, notificaciones tardías. |
| Ganancia esperada | Experiencia fluida con respuesta < 200 ms p95, tracking en tiempo real, confirmación instantánea del pedido con número único [Brief §A.4; US-01]. |

### 4.2 Persona secundaria

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Restaurante — operador de cocina y gestión de pedidos |
| Contexto | Gestiona su cocina desde un dashboard. Necesita visibilidad de los tickets entrantes y control sobre su carga de trabajo para no saturar la operación [Brief §A.2]. |
| *Jobs‑to‑be‑done* | 1) Recibir tickets de pedido en tiempo real. 2) Aceptar o rechazar pedidos con tiempo estimado de preparación. 3) Actualizar disponibilidad de ítems del menú. 4) Consultar reportes de pedidos e ingresos. 5) Gestionar horarios de apertura. |
| Dolores principales | Tickets llegando con retraso, sin posibilidad de rechazar pedidos imposibles de atender, sin visibilidad de la carga futura de cocina. |
| Ganancia esperada | Dashboard confiable con notificación inmediata de tickets, capacidad de gestionar carga de cocina y rechazo justificado de pedidos [Brief §A.2; US-02]. |

## 5. Propuesta de valor

> Síntesis tipo *Value Proposition Canvas* (Osterwalder).

| Eje | Contenido |
|-----|-----------|
| **Para quién** (cliente / usuario principal) | Consumidores que piden comida a domicilio, Restaurantes que gestionan su operación de delivery, y Couriers que optimizan sus rutas de entrega. |
| **Que necesita** (*job‑to‑be‑done*) | Una plataforma de delivery confiable, rápida y disponible que procese pedidos sin degradación en horarios pico, notifique en tiempo real y escale sin interrupciones del servicio. |
| **Nuestra propuesta es** (producto / servicio) | FTGO con arquitectura de microservicios: plataforma descompuesta en servicios independientes por capacidad de negocio, desplegables y escalables de forma autónoma mediante migración incremental Strangler Fig. |
| **Que le aporta** (*pain relievers* + *gain creators*) | 1) Disponibilidad ≥ 99,9 % en el flujo de pedidos. 2) Latencia < 200 ms p95 para el consumidor. 3) Escalado horizontal independiente en horarios pico sin afectar toda la plataforma. 4) Aislamiento de fallos (fallo en Notifications no afecta Order Taking). 5) Entrega de nuevas funcionalidades por servicio sin redeployment global. |
| **A diferencia de** (alternativa actual) | El monolito actual, que requiere desplegar todo el sistema para cualquier cambio, no puede escalar módulos individualmente y carece de aislamiento de fallos entre capacidades. |
| **Nuestro diferencial es** (*unique value*) | Migración incremental (Strangler Fig) que preserva la operación continua del negocio durante 18–24 meses, con trazabilidad end-to-end (correlation ID + distributed tracing) y consistencia fuerte dentro del aggregate de pedido [Brief §A.4; Richardson Cap. 2]. |

## 6. Panorama competitivo (resumen)

> Visión sintética para sustentar el BRD. El análisis profundo vive en el MRD.

| Competidor / alternativa | Tipo (directo / indirecto / *do‑nothing*) | Fortaleza percibida | Debilidad percibida |
|--------------------------|--------------------------------------------|---------------------|---------------------|
| Monolito FTGO actual | *do‑nothing* | Conocido por el equipo, operativo hoy | No escala, builds lentos, sin aislamiento de fallos, deuda técnica creciente |
| Reescritura total (greenfield) | Directo (alternativa interna) | Arquitectura limpia desde cero | Alto riesgo operativo, costo elevado, tiempo de entrega > 2 años |
| Plataformas SaaS de delivery (tech stacks de Rappi, UberEats) | Indirecto | Arquitectura madura, probada a escala global | No aplica al contexto de FTGO como plataforma propia; vendor lock-in |
| Migración a serverless/FaaS | Alternativa arquitectónica | Costo operativo bajo en demanda baja | Latencia en cold starts, complejidad de debugging, no cubre todos los NFRs de FTGO |

> Nota: este resumen se complementa con la sección de competencia del MRD (`docs/mrd/MRD_v0.1.md`).

## 7. Business Model Canvas

> Síntesis del **modelo de negocio** en los 9 bloques de Osterwalder. Cada bloque tiene ≥ 3 elementos.

| Bloque | Mínimo 3 elementos concretos |
|--------|-------------------------------|
| 1. Segmentos de clientes | Consumidores finales (app móvil/web) / Restaurantes asociados / Couriers independientes |
| 2. Propuesta de valor | Delivery confiable y rápido (< 200 ms UX) / Escalabilidad en pico 5x sin degradación global / Tracking en tiempo real del estado del pedido |
| 3. Canales | App móvil (iOS/Android) para el consumidor / Dashboard web para el restaurante / App courier para asignaciones y rutas |
| 4. Relación con clientes | Self-service digital (pedidos sin fricción) / Notificaciones push, email y SMS (SendGrid/Twilio) / Soporte back office para resolución de incidentes |
| 5. Fuentes de ingresos | Comisión por pedido al restaurante / Cargo por delivery al consumidor / Comisión al courier por entrega completada |
| 6. Recursos clave | Plataforma de microservicios en infraestructura cloud / Equipo de arquitectura y desarrollo (Java/Spring Boot core) / Base de restaurantes y couriers registrados |
| 7. Actividades clave | Procesamiento de pedidos (Order Taking + Order Fulfillment) / Asignación y tracking de delivery en tiempo real / Procesamiento de pagos vía Stripe (PCI-DSS delegado) |
| 8. Socios clave | Stripe (pasarela de pago, PCI-DSS delegado) / Google Maps (geocoding y rutas para couriers) / SendGrid + Twilio (notificaciones email y SMS por volumen) |
| 9. Estructura de costos | Infraestructura cloud (compute + almacenamiento independiente por servicio) / Fees de pasarela de pago Stripe (por transacción) / Costo de notificaciones SendGrid/Twilio (por volumen enviado) |

## 8. Métricas clave de éxito (North Star + apoyo)

> KPIs de negocio que medirán si el proyecto resuelve realmente el problema.

| ID | KPI | North Star? | Línea base | Meta | Horizonte | Fuente del dato |
|----|-----|-------------|------------|------|-----------|-----------------|
| KPI-01 | Disponibilidad flujo Order Taking | Sí | Por medir (monolito) | ≥ 99,9 % mensual | Q4 2026 | Monitoreo APM / alertas |
| KPI-02 | Latencia p95 acciones del consumidor | No | Por medir (monolito) | < 200 ms | Q4 2026 | Distributed tracing |
| KPI-03 | Tiempo de build CI/CD por servicio | No | ~45 min (monolito global) | ≤ 10 min por servicio | Q3 2026 | Pipeline CI/CD |
| KPI-04 | Capacidades migradas con Strangler Fig | No | 0 de 7 | ≥ 4 de 7 capacidades | Q2 2027 | Registro de migración |
| KPI-05 | Incidentes críticos en Order Taking en horario pico | No | Por medir | 0 incidentes P1 | Q4 2026 | Logs + sistema de alertas |

## 9. Objetivos de negocio (SMART)

| ID | Objetivo | Métrica | Línea base | Meta | Horizonte |
|----|----------|---------|------------|------|-----------|
| BO-01 | Alcanzar disponibilidad comprometida en el flujo de toma de pedidos | % uptime mensual | Por medir | ≥ 99,9 % | Q4 2026 |
| BO-02 | Reducir latencia percibida por el consumidor en la app | Milisegundos p95 | Por medir | < 200 ms | Q4 2026 |
| BO-03 | Reducir tiempo de build y despliegue de cambios en cada servicio | Minutos por pipeline | ~45 min (monolito) | ≤ 10 min por servicio | Q3 2026 |
| BO-04 | Migrar al menos 4 capacidades de negocio con Strangler Fig sin downtime en producción | N° capacidades migradas | 0 de 7 | ≥ 4 de 7 | Q2 2027 |
| BO-05 | Habilitar escalado horizontal independiente en todos los servicios | N° servicios con HPA configurado | 0 de 7 | 7 de 7 | Q4 2026 |

## 10. Stakeholders y roles (modelo RACI)

| Stakeholder | Interés | R / A / C / I |
|-------------|---------|----------------|
| Director de Tecnología (Sponsor) | Aprobación estratégica y presupuesto | A |
| Equipo de Arquitectura | Diseño y documentación de la arquitectura objetivo | R |
| Equipos de Desarrollo (Squads) | Implementación de los microservicios | R |
| Consumidor (usuario final) | Experiencia de usuario — UX y latencia | C |
| Restaurante (operador) | Gestión de tickets y dashboard operativo | C |
| Courier | Asignaciones cercanas y tracking de rutas | C |
| Empleados FTGO (back office) | Visibilidad, reportes, resolución de incidentes | C |
| Legal / Compliance | PCI-DSS (delegado a Stripe), GDPR y normativas locales | C |
| Sistemas externos (Stripe, GMaps, SendGrid/Twilio) | Integraciones estables con SLAs predecibles | I |

## 11. Requerimientos de negocio

> Cada ítem responde: ¿qué necesita el negocio, y cómo sabremos que se cumplió? **No** se describen soluciones técnicas.

| ID | Requerimiento de negocio | Prioridad (MoSCoW) | Justificación | Métrica de aceptación |
|----|---------------------------|--------------------|---------------|-----------------------|
| BR-001 | El sistema debe procesar pedidos del consumidor aunque la pasarela de pago esté temporalmente caída (cola de retry) | Must | NFR Tolerancia a fallos externos [Brief §A.4] | 100 % de pedidos encolados ante fallo de Stripe; retry exitoso en < 5 min |
| BR-002 | Cada capacidad de negocio debe poder desplegarse y escalarse de forma independiente sin afectar a las demás | Must | NFR Escalabilidad horizontal; tráfico pico 5x [Brief §A.4] | Despliegue de un servicio no genera downtime en otros; HPA activo en todos |
| BR-003 | El flujo de toma de pedidos debe tener disponibilidad ≥ 99,9 % mensual | Must | NFR Disponibilidad [Brief §A.4] | Uptime medido mensualmente ≥ 99,9 % |
| BR-004 | Las acciones del consumidor en la app deben recibir respuesta en < 200 ms p95 | Must | NFR Latencia UX [Brief §A.4] | Percentil 95 de latencia < 200 ms medido en producción |
| BR-005 | Toda acción del consumidor debe ser rastreable end-to-end con correlation ID y distributed tracing | Must | NFR Trazabilidad [Brief §A.4] | 100 % de transacciones con correlation ID propagado entre todos los servicios |
| BR-006 | La migración debe aplicarse de forma incremental (Strangler Fig) sin reemplazar el monolito de golpe | Must | NFR Migración incremental 18–24 meses [Brief §A.4] | Monolito sigue operativo en producción durante toda la fase de migración |
| BR-007 | Los datos de pago deben cumplir PCI-DSS delegando el procesamiento íntegramente a Stripe | Must | Compliance PCI-DSS [Brief §A.4] | Cero datos de tarjeta almacenados en sistemas FTGO; auditoría aprobada antes del lanzamiento |
| BR-008 | El sistema de tracking en tiempo real puede degradar a 99,5 % de disponibilidad sin afectar el flujo de Order Taking | Should | NFR Disponibilidad diferenciada [Brief §A.4] | Degradación de tracking no genera alertas P1 ni afecta métricas de Order Taking |
| BR-009 | Los servicios core deben implementarse en Java/Spring Boot; los servicios satélite pueden usar tecnologías distintas | Should | NFR Tecnología — reutilizar conocimiento del equipo [Brief §A.4] | Servicios core (Order, Kitchen, Delivery) en Java 17/Spring Boot verificado en code review |
| BR-010 | Los datos de consumidores deben protegerse según GDPR y normativas locales aplicables | Must | Compliance GDPR/local [Brief §A.4] | Auditoría de datos PII aprobada por Legal antes del lanzamiento en producción |

## 12. Reglas de negocio y políticas

| ID | Regla | Tipo | Origen |
|----|-------|------|--------|
| RB-01 | Un pedido solo puede confirmarse si el restaurante está activo y el método de pago es válido | Política operativa | US-01 / Capacidad Order Taking [Brief §A.3] |
| RB-02 | Un restaurante puede rechazar un ticket indicando motivo; el pedido se cancela y el consumidor es notificado automáticamente | Política operativa | US-02 / Capacidad Order Fulfillment [Brief §A.3] |
| RB-03 | Un courier tiene un timeout de 30 segundos para aceptar una asignación antes de que el sistema reasigne automáticamente | Regla de proceso | US-03 / Capacidad Delivery [Brief §A.3] |
| RB-04 | Los datos de tarjeta de pago nunca deben almacenarse en sistemas FTGO; solo se almacenan tokens Stripe | Normativa | PCI-DSS [Brief §A.4] |
| RB-05 | La consistencia de datos entre servicios puede ser eventual para reporting; se requiere consistencia fuerte dentro del aggregate de un pedido | Arquitectónica | NFR Consistencia de datos [Brief §A.4; Richardson Cap. 4] |
| RB-06 | Cada microservicio debe tener su propia base de datos (Database per Service); ningún servicio accede directamente a la BD de otro | Arquitectónica | Richardson Cap. 2 — patrón Database per Service; NFR Escalabilidad independiente |

## 13. Supuestos, restricciones y dependencias

- **Supuestos**:
  - Los consumidores tienen acceso a internet móvil con latencia suficiente para experiencias < 200 ms en la capa de aplicación.
  - El equipo de desarrollo tiene dominio de Java/Spring Boot para los servicios core.
  - Stripe, Google Maps, SendGrid y Twilio mantienen sus SLAs actuales durante toda la fase de migración.
  - El monolito legacy puede operar en paralelo durante los 18–24 meses de migración incremental sin requerir cambios estructurales.

- **Restricciones**:
  - **Tecnología**: Java/Spring Boot preferido en servicios core para reutilizar conocimiento del equipo; libertad tecnológica en servicios satélite [Brief §A.4].
  - **Compliance**: PCI-DSS delegado íntegramente a Stripe; GDPR y normativas locales para datos de consumidores [Brief §A.4].
  - **Migración**: el monolito no puede reemplazarse de golpe; la migración debe seguir el patrón Strangler Fig durante 18–24 meses [Brief §A.4].
  - **Carga**: la plataforma debe absorber tráfico pico 5x en horarios de almuerzo (12:00–14:00) y cena (19:00–22:00) [Brief §A.4].

- **Dependencias**:
  - **Stripe**: procesamiento de pagos (PCI-DSS delegado) — integración obligatoria desde el Día 1.
  - **Google Maps**: geocoding y rutas para el Delivery Service — integración obligatoria.
  - **SendGrid / Twilio**: canal de notificaciones email y SMS — integración obligatoria.
  - **Monolito legacy**: debe seguir activo y coexistir durante toda la fase Strangler Fig; cualquier cambio en el monolito durante la migración debe coordinarse con el equipo de arquitectura.
  - **Bus de eventos (Apache Kafka o equivalente)**: requerido para comunicación asíncrona entre microservicios [Richardson Cap. 4].

## 14. Alcance de negocio

### 14.1 En alcance
- Las 7 capacidades de negocio del Cap. 2 de Richardson: Consumer Management, Restaurant Management, Order Taking, Order Fulfillment/Kitchen, Delivery, Billing & Accounting, Notifications.
- Documentación de arquitectura objetivo: PRD ligero, FSD ligero (≥ 5 UCs con Given/When/Then), 2 ADRs, diagramas C4 niveles 1 y 2.
- Migración incremental con patrón Strangler Fig — Fase 1 cubre ≥ 4 capacidades (Q4 2026–Q2 2027).
- Integraciones con Stripe, Google Maps, SendGrid y Twilio.
- Trazabilidad end-to-end con correlation ID y distributed tracing en todos los servicios.

### 14.2 Fuera de alcance
- **Reescritura total (big-bang)**: descartada por riesgo operativo y costo; el monolito sigue activo durante la migración.
- **Desarrollo de nuevas funcionalidades de negocio durante la Fase 0**: el foco es exclusivamente la arquitectura y la migración.
- **Migración de datos históricos**: se abordará en fases posteriores con una estrategia dedicada de data migration.
- **Sistemas de BI/Analytics avanzados**: fuera de las 7 capacidades de negocio definidas en el brief.
- **Gestión de flota propia de couriers**: FTGO opera con couriers independientes; la logística de flota propia queda fuera del alcance.

## 15. Beneficios esperados y *business case* resumido

| Tipo | Año 1 | Año 2 | Año 3 |
|------|-------|-------|-------|
| Ahorro operativo (infra escalada selectiva) | USD 80 K (est.) | USD 150 K | USD 200 K |
| Reducción de pérdidas por incidentes (aislamiento de fallos) | USD 40 K (est.) | USD 60 K | USD 70 K |
| Ingresos adicionales (mayor disponibilidad y menor churn) | USD 50 K (est.) | USD 120 K | USD 180 K |
| Inversión (CAPEX — arquitectura + infra Fase 1) | –USD 200 K | –USD 80 K | –USD 50 K |
| Costo operación incremental (OPEX) | –USD 60 K | –USD 70 K | –USD 75 K |
| **Resultado neto estimado** | **–USD 90 K** | **+USD 180 K** | **+USD 325 K** |
| **VAN (3 años, tasa 12 %)** | **~USD 320 K (est.)** | | |
| **TIR** | **~38 % (est.)** | | |

> *Nota: todos los valores son estimaciones preliminares basadas en benchmarks de industria. Se requiere medir la línea base de costos del monolito actual antes del lanzamiento para ajustar el modelo financiero.*

## 16. Riesgos de negocio

| Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|--------|--------------|---------|------------|-------------|
| Distributed Monolith accidental (servicios con acoplamiento oculto) | Alta | Alta | ADRs con trade-offs explícitos; revisiones de arquitectura quincenales; enforcement del patrón Database per Service | Equipo de Arquitectura |
| Baja adopción de la nueva arquitectura por el equipo de desarrollo | Media | Alta | Capacitación en patrones de microservicios (Richardson); arquitecto líder dedicado como enabler | CTO / Arq. Principal |
| Coexistencia monolito-microservicios genera inconsistencias de datos durante Strangler Fig | Media | Alta | Definición explícita de fuente de verdad por capacidad; eventual consistency aceptada solo en reporting [RB-05] | Equipo de Arquitectura |
| Dependencia de sistemas externos (Stripe, GMaps) con SLA degradado | Baja | Alta | Circuit breakers; colas de retry; degradación graceful definida por servicio [BR-001; BR-008] | Equipo de Infraestructura |
| Migración excede el horizonte de 18–24 meses | Media | Media | Roadmap por fases con gate de calidad al completar cada capacidad migrada; revisión mensual de avance | PM / CTO |
| Incumplimiento PCI-DSS durante la migración | Baja | Crítico | Delegación total a Stripe desde el Día 1; cero almacenamiento de datos de tarjeta en FTGO [RB-04]; auditoría externa antes de producción | Legal / Compliance |

## 17. Criterios de éxito del proyecto de negocio

- Cumplimiento de ≥ 80 % de los objetivos SMART (BO-01 a BO-05) al cierre de Q4 2026.
- *Business case* positivo (resultado neto > 0) al cierre del Año 2 post-inicio de migración.
- Satisfacción del *sponsor* (Director de Tecnología) ≥ 4/5 en revisión de gate al completar la Fase 1.
- Cero incidentes de compliance PCI-DSS o GDPR durante toda la fase de migración.
- Al menos 4 de 7 capacidades migradas con Strangler Fig sin downtime en producción al Q2 2027.

## 18. Trazabilidad a documentos hijos

| BRD ID | MRD relacionado | PRD relacionado | Caso de uso FSD |
|--------|-----------------|-----------------|-----------------|
| BR-001 | MRD-N-01 (Tolerancia a fallos) | PRD-NFR-04 | UC-04: Procesar pago / retry |
| BR-002 | MRD-N-02 (Escalabilidad horizontal) | PRD-NFR-01 | UC-01 a UC-05 (todos los flujos) |
| BR-003 | MRD-N-03 (Disponibilidad Order Taking) | PRD-NFR-03 | UC-01: Tomar pedido |
| BR-004 | MRD-N-04 (Latencia UX) | PRD-NFR-02 | UC-01: Tomar pedido / UC-05: Tracking |
| BR-005 | MRD-N-05 (Trazabilidad end-to-end) | PRD-NFR-07 | Todos los UCs (cross-cutting concern) |
| BR-006 | MRD-N-06 (Migración incremental) | PRD-REQ-Alcance | ADR-0001: Estilo arquitectónico |
| BR-008 | MRD-N-07 (Delivery SLA diferenciado) | PRD-NFR-03b | UC-03: Asignar courier / UC-05: Tracking |
| BR-010 | MRD-N-08 (Compliance GDPR) | PRD-NFR-08 | UC-01: Tomar pedido (datos PII) |

## 19. Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Sponsor (Director de Tecnología) | | ___________________ | |
| PM / Líder de Proyecto | | ___________________ | |
| Arquitecto Principal | | ___________________ | |

## 20. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v0.1 | 22/05/2026 | Equipo de Arquitectura FTGO | Versión inicial — generada a partir del Brief Anexo A (Módulo 4, Examen Práctico) |

## 21. Anexo opcional — PR‑FAQ Amazon‑style (Working Backwards)

### 21.1 Press Release (futuro fingido)

```text
22 DE MAYO DE 2026

COCHABAMBA — FTGO (Food To Go) anunció hoy el inicio de la migración de su
plataforma de delivery a una arquitectura de microservicios, permitiendo a sus
más de N consumidores activos disfrutar de una experiencia de pedido con
disponibilidad garantizada del 99,9 % y respuesta en menos de 200 ms, incluso
durante los horarios de mayor demanda.

"Esta migración no es solo un cambio técnico; es la base para que FTGO pueda
crecer sostenidamente y entregar valor a consumidores y restaurantes sin las
limitaciones que el monolito nos imponía", dijo el Director de Tecnología de FTGO.

Desde hace años, la plataforma opera sobre un monolito Java que acumula builds
lentos, falta de aislamiento de fallos y un equipo de desarrollo bloqueado por
el tamaño del código. En horarios pico, el sistema no puede escalar solo las
capacidades bajo demanda, afectando la experiencia de todos los usuarios.

Aplicando el patrón Strangler Fig documentado por Chris Richardson, FTGO
migrará sus 7 capacidades de negocio a microservicios independientes durante
18–24 meses, sin interrumpir la operación actual. Cada servicio podrá
desplegarse, escalarse y evolucionar de forma autónoma.

"Ahora cuando hago un pedido en hora pico, llega la confirmación al instante
y puedo ver exactamente dónde está mi repartidor", comentó un consumidor
de prueba del piloto interno.

FTGO con arquitectura de microservicios estará disponible progresivamente
a partir del Q4 2026. Para más información: https://github.com/microservices-patterns/ftgo-application
```

### 21.2 External FAQ (preguntas de clientes externos)

- **¿Qué cambia para mí como consumidor?** Nada visible de inmediato; la mejora se traduce en pedidos más rápidos de confirmar, tracking más confiable y menos errores en horarios pico.
- **¿Mi historial de pedidos y datos están seguros durante la migración?** Sí. Los datos de pago siempre fueron y seguirán siendo procesados por Stripe (PCI-DSS); los datos de consumidores están protegidos bajo GDPR. La migración no implica pérdida de datos históricos.
- **¿El servicio se interrumpe durante la migración?** No. Se aplica el patrón Strangler Fig: el monolito sigue operativo y los microservicios van reemplazando capacidades de forma incremental.
- **¿Habrá nuevas funcionalidades durante la migración?** La Fase 0 se enfoca en la arquitectura; nuevas funcionalidades se priorizan a partir de la Fase 1 completada.
- **¿Qué pasa si un servicio falla?** La nueva arquitectura aísla los fallos por capacidad; un problema en Notifications no afectará Order Taking.

### 21.3 Internal FAQ (preguntas del equipo y sponsor)

- **¿Por qué ahora y no en 6 meses?** Cada mes de demora aumenta la deuda técnica acumulada y el riesgo de requerir una reescritura total (big-bang) más costosa. El equipo tiene dominio actual del monolito; es el mejor momento para migrar de forma incremental.
- **¿Cuál es la inversión y el horizonte de retorno?** CAPEX estimado de USD 200 K en el Año 1; resultado neto positivo desde el Año 2 (~USD 180 K); VAN a 3 años ~USD 320 K con TIR ~38 %.
- **¿Cuáles son los riesgos principales y cómo se mitigan?** Distributed Monolith accidental (mitigado con ADRs y Database per Service), baja adopción del equipo (mitigado con capacitación y arquitecto líder), e inconsistencias de datos durante Strangler Fig (mitigado con fuente de verdad por capacidad).
- **¿Qué dependencias críticas existen?** Stripe (PCI-DSS), Google Maps (rutas), SendGrid/Twilio (notificaciones) y el bus de eventos Kafka. Todas deben estar integradas y operativas desde la Fase 1.
- **¿Cómo escalamos si la demanda supera la proyección durante la migración?** Cada microservicio tendrá HPA (Horizontal Pod Autoscaler) configurado desde el inicio; el Scale Cube (X-axis + Y-axis) cubre los escenarios de carga documentados en el brief [Brief §A.4].

---

## Checklist mínimo de entrega

- [x] **Resumen ejecutivo** de ½ página con problema, propuesta, valor y métricas.
- [x] Problema de negocio con evidencia cuantitativa (tiempos, síntomas documentados en Richardson Cap. 1).
- [x] **1–2 personas / usuarios objetivo** caracterizadas (JTBD, dolores, ganancias) — Consumidor + Restaurante.
- [x] **Propuesta de valor** explícita (formato VPC) — Sección 5.
- [x] **Panorama competitivo resumen** con ≥ 3 alternativas (incluyendo *do‑nothing*) — Sección 6.
- [x] **Business Model Canvas** con los 9 bloques poblados, **≥ 3 elementos por bloque** — Sección 7.
- [x] **Métricas clave de éxito**: 1 *North Star* (KPI-01) + 4 KPIs de apoyo, con meta y horizonte — Sección 8.
- [x] ≥ 3 objetivos de negocio SMART (5 objetivos: BO-01 a BO-05) — Sección 9.
- [x] Matriz RACI completa (9 stakeholders) — Sección 10.
- [x] ≥ 8 requerimientos de negocio priorizados (MoSCoW) (10 requerimientos: BR-001 a BR-010) — Sección 11.
- [x] Reglas, restricciones, supuestos y dependencias explícitos — Secciones 12 y 13.
- [x] *Business case* cuantitativo estimado con VAN y TIR — Sección 15.
- [x] Trazabilidad a MRD/PRD/FSD iniciada — Sección 18.
