# Market Requirements Document (MRD) — v1.1
# Sistema de Gestión Académica Integral (SGAI)

> **Cambios respecto a v1.0:** Análisis competitivo expandido con criterios adicionales y puntuaciones; 2 segmentos de mercado detallados con buyer persona completa, TAM/SAM/SOM refinados; Océano Azul con tabla ERIC; hipótesis actualizadas con resultados parciales.

---

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| Producto | Sistema de Gestión Académica Integral (SGAI) |
| Grupo | G01 |
| Versión | **v1.1** |
| Fecha | 10/05/2026 |
| Product Manager / Autor | Carolina Aguilar |
| Revisores | Docente + Stakeholders institucionales |
| Estado | En revisión |
| Relación con BRD | BRD_SGAI_v2.0 |

---

## 1. Resumen Ejecutivo

El SGAI resuelve la brecha estructural de digitalización en la gestión académica de universidades públicas bolivianas bajo el sistema CEUB. Con más de 1.500 docentes y 15+ facultades operando 100 % en papel, los ciclos de aprobación de oferta académica alcanzan 5–15 días hábiles, las declaraciones juradas no tienen trazabilidad digital y los docentes no tienen acceso self-service a su información laboral y financiera.

El mercado primario es el sistema universitario público boliviano (CEUB): 11 universidades autónomas, aproximadamente 12.000 docentes activos y presupuestos de TI estimados en USD 2–5M anuales por institución. La oportunidad inmediata es la universidad piloto (SOM año 1: USD 45.000), con una expansión proyectada a 2–3 universidades CEUB adicionales en años 2–3 (SOM expandido: USD 135.000–180.000).

Las soluciones disponibles —SIU-Guaraní, ERPs genéricos y Google Workspace— no combinan las tres dimensiones críticas del mercado boliviano: flujo de aprobación multinivel configurable según normativa CEUB, integración con sistemas legados de nómina locales sin modificarlos, y operación on-premise con cumplimiento nativo de la Ley 164. Esta triple especificidad define el **océano azul** del SGAI.

La estrategia go-to-market parte del caso piloto validado hacia el sistema CEUB mediante presentación institucional, con un modelo de licencia on-premise a USD 45.000 CAPEX + USD 6.000 OPEX/año que es 2 a 10 veces más económico que las alternativas competidoras.

---

## 2. Visión del Producto

> "Para los docentes y administradores de universidades públicas bolivianas, que hoy pierden entre 5 y 15 días hábiles en trámites presenciales y en papel, el SGAI es la plataforma de gestión académica-administrativa diseñada para el contexto CEUB que reduce el ciclo de aprobación a ≤ 2 días hábiles y da acceso self-service completo a toda la información laboral desde cualquier navegador — antes del ciclo académico 2027."

---

## 3. Análisis de Mercado

### 3.1 Tamaño de Mercado

| Métrica | Valor | Fuente |
|---------|-------|--------|
| TAM — Mercado global de software ERP para educación superior | USD 1.200M (2025), CAGR ~12 % | MarketsandMarkets Higher Education ERP Report 2025 (est. regional) |
| TAM — Universidades públicas CEUB Bolivia (11 instituciones) | ~12.000 docentes; presupuesto TI est. USD 22–55M/año (sistema completo) | CEUB Informe Estadístico 2024; estimación propia |
| SAM — Universidades CEUB con necesidad documentada de digitalización | 11 universidades × USD 45.000 CAPEX = **USD 495.000** | Estimación basada en BRD §15 |
| SOM año 1 — Universidad piloto | **USD 45.000** CAPEX + USD 6.000 OPEX | Caso piloto SGAI |
| SOM años 2–3 — Expansión a 2–3 universidades CEUB | **USD 90.000–135.000** CAPEX adicional | Estimación equipo SGAI |

> **Nota de transparencia:** Las cifras de TAM global son estimaciones de mercado de analistas. Los valores de SAM y SOM son proyecciones del equipo basadas en el caso piloto documentado y el tamaño del sistema CEUB.

### 3.2 Tendencias del Sector

- **Digitalización post-pandemia en educación superior latinoamericana:** Bolivia sigue la tendencia regional con 2–3 años de rezago, creando una ventana de oportunidad inmediata.
- **Preferencia por soluciones verticales sobre ERPs genéricos:** Las instituciones rechazan progresivamente costos prohibitivos de ERPs (USD 200K–500K) en favor de soluciones específicas y accesibles.
- **Modelo de licenciamiento entre universidades públicas (SIU Argentina):** Demuestra viabilidad del modelo de software compartido entre instituciones del mismo sistema universitario.
- **Regulación creciente de datos en Bolivia (Ley 164):** Barreras de entrada para soluciones extranjeras no adaptadas al marco normativo boliviano.
- **Presión institucional del CEUB por transparencia y trazabilidad:** Las directrices CEUB 2024–2028 exigen digitalización de procesos académicos con auditoría.

### 3.3 Factores Regulatorios y de Cumplimiento

- **Ley N° 164 de Telecomunicaciones y TIC de Bolivia:** Seguridad informática, protección de datos, soberanía de la información. Obligatoria para sistemas institucionales bolivianos.
- **Normativa CEUB:** Formatos, plazos y flujos de planificación académica (oferta académica, declaraciones juradas). El SGAI embebe estas reglas en su lógica de negocio.
- **Estatuto Orgánico de la Universidad Boliviana:** Marco legal de la autonomía universitaria que regula la estructura administrativa y los procesos académicos.
- **Reglamento interno universitario:** Políticas de vinculación docente, roles institucionales y plazos administrativos específicos de cada institución.

### 3.4 Cadencia de Continuous Discovery

| Aspecto | Valor |
|---------|-------|
| Cadencia de entrevistas | Quincenal durante el desarrollo del MVP |
| Usuarios contactados (fase actual) | 15 total: 8 docentes, 4 admins. de facultad, 2 técnicos DPA, 1 director DPA |
| Formato de hipótesis | *Cuando `<situación>`, espero `<resultado>`, porque `<razón>`* |
| Hipótesis backlog | Ver §12 de este MRD |
| Output del Discovery | Validaciones que actualizan §3, §5, §6 y §12 sprint a sprint |

---

## 4. Segmentación y Personas

### 4.1 Segmentos de Clientes

| Segmento | Tamaño (piloto) | Necesidad principal | Adopción esperada | Perfil de compra |
|----------|----------------|---------------------|-------------------|------------------|
| **Seg-1: Docentes universitarios** (titular, interino, investigador) | 1.500+ por institución | Autogestión de DJ, horarios y boletas sin presencialidad | Alta si UX simple y primeros flujos en < 10 min | Usuarios finales; no son decisores de compra |
| **Seg-2: Administradores de Facultad y DPA** | 18–25 por institución | Panel centralizado, flujo digital con trazabilidad, reportes automáticos | Muy alta — son los más afectados por el proceso manual | Influenciadores clave en la decisión institucional |
| **Seg-3: Dirección Universitaria y Rectorado** | 3–5 por institución | Métricas institucionales, cumplimiento normativo, visibilidad estratégica | Media — interés en resultados, no en uso directo del sistema | Decisores de la compra |
| **Seg-4: Unidad de TI universitaria** | 2–5 por institución | Sistema desplegable on-premise, mantenible con stack estándar, sin dependencia de proveedor | Alta si el stack es conocido y la documentación es completa | Validadores técnicos de la compra |

---

### 4.2 Personas — Detalle Extendido

#### Persona 1 — Prof. Carmen Villalba (Docente Universitaria) — Segmento 1

> **Buyer persona principal — 1.500+ usuarios en la institución piloto.**

- **Rol:** Docente titular con 12 años de antigüedad. Dicta 3 materias en 2 facultades. Investigadora en tiempo parcial.
- **Demografía:** 42 años, Licenciada en Ciencias de la Educación, posgrado en Pedagogía. Usa smartphone Android (Samsung básico) y laptop personal (Windows 10, Chrome). Conectividad mixta: WiFi universitario en campus y datos móviles en casa.
- **Contexto laboral:** Trabaja en 2 facultades diferentes, gestiona su documentación entre ambas. Tiene carga académica de 22 horas semanales. Deja la documentación administrativa para los viernes porque implica desplazamientos.
- **Jobs-to-be-done:**
  1. Enviar y rastrear su DJ sin ir al DPA.
  2. Consultar su boleta de pago cuando necesita justificar ingresos para trámites personales.
  3. Saber su horario oficial para programar otras actividades.
  4. Actualizar su CV institucional sin tramitar en Recursos Humanos.
  5. Consultar el calendario de exámenes sin depender de un papel pegado en la pared.
- **Dolores actuales:**
  - Dedica entre 2 y 4 horas **por semestre** solo en desplazamientos para trámites administrativos.
  - Nunca sabe el estado de su DJ hasta que llama o va físicamente a la Facultad.
  - Ha tenido DJs devueltas por errores de formato mínimos; el retraso fue de 2 semanas adicionales.
  - Sus boletas de pago llegan en papel al buzón de la universidad; las ha perdido en 2 ocasiones.
  - Tiene que pedir permisos laborales para ir a tramitar durante horario de trabajo.
- **Comportamiento digital:** Usa WhatsApp intensivamente para comunicación profesional. Gmail personal, Google Drive para sus apuntes. No tiene experiencia con plataformas institucionales complejas (la experiencia con Moodle fue negativa por la interfaz confusa).
- **Criterio de adopción:** Si completa su primera DJ en menos de 10 minutos sin llamar a nadie, adoptará el sistema. Si tiene que leer un manual, no lo usará.
- **Frase representativa:** *"Si pudiera hacer todo desde mi celular, me ahorraría media jornada por semestre. Pero siempre termino yendo igual porque no sé si llegó mi papel."*
- **Willingness-to-pay:** No paga directamente; financiamiento institucional. Su adopción depende de la percepción de utilidad en los primeros 2 usos. Si el sistema falla 2 veces seguidas, vuelve al papel.
- **Canales de acceso:** Principalmente desde laptop (trabajo en casa) y celular (campus). Prefiere acceso vía URL directa, sin instalar apps.

---

#### Persona 2 — Lic. Roberto Mamani (Administrador de Facultad) — Segmento 2

> **Buyer persona influenciador — 15–20 usuarios por institución, pero con impacto en 80+ docentes cada uno.**

- **Rol:** Secretario académico de la Facultad de Ciencias Económicas. Gestiona 80 docentes, 6 carreras y el trámite de oferta académica de 120+ materias por semestre.
- **Demografía:** 38 años, Licenciado en Administración de Empresas. Trabaja exclusivamente en la Facultad. Computadora de escritorio HP (Windows 10, Office 2019) en su oficina. Conexión de la universidad. No trabaja desde casa.
- **Contexto laboral:** Su cargo es de planta; lleva 8 años en el puesto. Tiene una auxiliar administrativa que lo apoya en la compilación de documentos. En los primeros 15 días de cada semestre, trabaja hasta las 8 PM para cerrar la oferta académica.
- **Jobs-to-be-done:**
  1. Compilar y enviar la oferta académica de su facultad al DPA sin recopilar 80 hojas.
  2. Saber qué DJ de sus docentes están pendientes sin revisar carpetas físicas.
  3. Corregir las observaciones del DPA sin reimprimir y re-presentar toda la documentación.
  4. Publicar el calendario académico de su facultad de forma oficial.
  5. Gestionar el estado y roles de sus docentes (Autoridades, Investigadores) con trazabilidad.
- **Dolores actuales:**
  - Dedica **3 semanas completas** al inicio de cada semestre solo en la compilación de la oferta académica.
  - Recibe devoluciones del DPA con observaciones a lápiz en hojas impresas — a veces ilegibles.
  - Mantiene una hoja de cálculo Excel propia (no oficial) para rastrear el estado de las DJs de sus docentes porque no existe otro sistema.
  - Coordina por correo y WhatsApp con el DPA; los acuerdos se pierden entre mensajes.
  - No puede trabajar desde fuera de la Facultad porque toda la documentación es física.
- **Comportamiento digital:** Usuario avanzado de Microsoft Office (Word, Excel con fórmulas, correo Outlook). Ha usado formularios Google en proyectos personales. Aprende rápido si el sistema tiene una interfaz similar a Excel/tablas. No tolera sistemas lentos o poco intuitivos.
- **Criterio de adopción:** Si puede ver el estado de todos sus docentes y el trámite de oferta en una sola pantalla, lo adoptará inmediatamente. Es el principal promotor interno del sistema si queda satisfecho; es el principal detractor si falla.
- **Frase representativa:** *"Cada inicio de semestre es un caos. Tengo mi propio Excel para rastrear quién me entregó qué, porque el sistema no existe. Si hubiera algo, aunque sea básico, ya sería un alivio enorme."*
- **Willingness-to-pay:** Financiamiento institucional. Es influenciador clave en la decisión del Director DPA y el Rector. Tiene reuniones directas con las autoridades universitarias.
- **Impacto de su adopción:** Si el SGAI funciona bien para Roberto, los 80 docentes de su facultad adoptarán el sistema en cadena, porque él los guiará.

---

#### Persona 3 — Téc. Jimena Flores (Técnico DPA) — Segmento 2

- **Rol:** Técnica del Departamento de Planificación Académica. Revisa y aprueba los trámites de oferta académica de 15+ facultades.
- **Demografía:** 35 años, Técnica administrativa con título de Auditoría. Perfil orientado al detalle y al cumplimiento normativo.
- **Dolores principales:** Procesa 20+ carpetas físicas en períodos críticos; los reportes para la Dirección los construye manualmente en Excel (1–2 días por reporte); no puede trabajar de forma remota.
- **Criterio de adopción:** Bandeja digital con historial, filtros y generación automática de reportes.
- **Frase representativa:** *"Cuando llega el período de cierre, hay días que reviso 20 carpetas. Si pudiera ver todo en pantalla con el historial, mi trabajo cambiaría completamente."*

---

#### Persona 4 — Ing. Marco Quispe (Administrador del Sistema / TI) — Segmento 4

- **Rol:** Técnico de la Unidad de TI universitaria. Responsable de infraestructura de servidores y soporte a sistemas institucionales.
- **Demografía:** 30 años, Ingeniero de Sistemas. Alta capacidad técnica. Familiarizado con Linux, Docker, PostgreSQL.
- **Dolores principales:** Gestiona accesos directamente en BD; los sistemas legados no tienen documentación actualizada; recibe solicitudes de soporte por WhatsApp sin sistema de tickets.
- **Criterio de adopción:** Sistema desplegable con Docker Compose, panel de admin con auditoría, documentación técnica completa, sin dependencia de proveedor externo.
- **Frase representativa:** *"Necesito que sea desplegable en nuestros servidores sin dependencias externas raras y que tenga un panel de admin decente. Lo demás lo puedo manejar."*

---

## 4.3 Voz del Cliente (VoC)

> Síntesis de **8 entrevistas semiestructuradas** (5 docentes, 2 administradores de facultad, 1 técnico DPA) realizadas en abril 2026. Método: entrevista de 45 min + observación del proceso en papel.

### Citas representativas (verbatim)

| Actor | Cita | Tema | JTBD vinculado |
|-------|------|------|----------------|
| Docente (Ciencias de la Educación) | *"No sé si mi DJ llegó hasta el DPA; tengo que llamar a la secretaría."* | Trazabilidad DJ | JTBD-02 |
| Docente (Economía) | *"Para el banco necesito la boleta y pierdo media mañana yendo a administración."* | Boletas self-service | JTBD-05 |
| Admin. Facultad (Economía) | *"Tres semanas armando carpetas; el DPA devuelve con lápiz y no sé qué corregir primero."* | Oferta académica digital | JTBD-03, JTBD-04 |
| Técnico DPA | *"En cierre reviso 20 carpetas; el reporte para Dirección me toma dos días en Excel."* | Reportes automatizados | JTBD-08 |
| Docente (Ingeniería) | *"Si la pantalla es como Moodle, no la uso; necesito algo simple."* | Usabilidad / adopción | H-01 |

### Temas emergentes (affinity map)

| Tema | Frecuencia (n=8) | Intensidad | Implicación de producto |
|------|------------------|------------|-------------------------|
| Falta de visibilidad del estado de trámites | 7/8 | Alta | Notificaciones + bandeja con historial (MRD-N-01, PRD-REQ-010) |
| Desplazamiento físico innecesario | 6/8 | Alta | Self-service DJ, boletas, horarios (Seg-1) |
| Pérdida de observaciones en devoluciones | 5/8 | Alta | Historial digital obligatorio (RB-06) |
| Miedo a sistemas institucionales complejos | 4/8 | Media | Flujos ≤ 5 pasos; UX tipo formulario simple |
| Desconfianza en datos desactualizados | 4/8 | Media | Timestamp de sincronización visible (modo degradado) |

### Métricas VoC → KPIs de producto

| Insight VoC | KPI / métrica | Meta |
|-------------|---------------|------|
| "No sé el estado de mi DJ" | % DJs con estado visible en tiempo real | 100 % |
| "Pierdo tiempo yendo a administración" | % docentes con ≥ 1 consulta digital/mes (horario o boleta) | ≥ 80 % |
| "El DPA tarda semanas" | Tiempo medio aprobación oferta académica (North Star) | ≤ 4 días hábiles |

---

## 5. Jobs-to-be-Done

| JTBD ID | Cuando… | Quiero… | Para poder… |
|---------|---------|---------|-------------|
| JTBD-01 | inicio de semestre y debo presentar mi DJ obligatoria | crearla y enviarla desde mi computadora en < 10 minutos | cumplir mi obligación sin ir físicamente al DPA |
| JTBD-02 | quiero saber si mi DJ fue aprobada o devuelta | consultar el estado en tiempo real sin llamar a la secretaría | tomar acción inmediata si hay correcciones |
| JTBD-03 | necesito coordinar la oferta académica de mi facultad para 120+ materias | tener un panel donde asignar docentes y enviarlo al DPA con un clic | evitar 3 semanas de recopilación manual de papeles |
| JTBD-04 | recibo una devolución con observaciones del DPA | ver exactamente qué debo corregir con historial completo | corregir en el mismo sistema sin re-presentar toda la documentación física |
| JTBD-05 | un trámite bancario o personal requiere mi boleta de pago | descargar mi boleta oficial en PDF desde el sistema | no ir a la administración a pedirla en persona |
| JTBD-06 | un estudiante me pregunta mi horario oficial de clases | consultarlo en el sistema actualizado | dar información certera sin depender de un papel |
| JTBD-07 | postulo a un proyecto de investigación universitaria | actualizar mi CV institucional con mis publicaciones recientes | tener un perfil profesional actualizado en el sistema |
| JTBD-08 | el DPA me pide el reporte de oferta académica del semestre | generarlo desde el sistema con un clic en PDF o Excel | no construirlo manualmente en Excel durante 2 días |

---

## 6. Análisis Competitivo

### 6.1 Tabla Comparativa Extendida

> Puntuación: ✅ = lo hace bien (2 pts) · ⚠️ = parcial o con limitaciones (1 pt) · ❌ = no lo hace (0 pts)

| Criterio | Peso | **SGAI** | SIU-Guaraní | Google Workspace | Banner/Ellucian | Proceso actual |
|----------|------|----------|-------------|-----------------|-----------------|----------------|
| Flujo aprobación multinivel Docente→Facultad→DPA | Alto | ✅ | ⚠️ Parcial (enf. estudiantes) | ❌ | ✅ Con configuración costosa | ❌ Manual |
| Adaptación a normativa CEUB Bolivia | Crítico | ✅ Nativo | ❌ Normativa argentina | ❌ | ❌ Genérico | ✅ Es la norma vigente |
| Integración con nómina local sin modificarla | Alto | ✅ Adaptadores | ⚠️ Solo ecosistema SIU | ❌ | ✅ Proyecto costoso | ❌ |
| Cumplimiento Ley 164 Bolivia + servidores locales | Crítico | ✅ | ❌ | ❌ Cloud Google | ⚠️ Configurable | ✅ Sin datos digitales |
| Acceso self-service docente (boletas, horarios, DJ) | Alto | ✅ Completo | ⚠️ Parcial | ⚠️ Sin integración nómina | ✅ Con config. costosa | ❌ |
| Costo CAPEX de implementación | Alto | ✅ USD 45K | ⚠️ USD 80K–150K | ✅ USD 5K–10K | ❌ USD 200K–500K | ✅ USD 0 (costo oculto) |
| Tiempo de implementación | Medio | ✅ 6–12 meses | ❌ 12–24 meses | ✅ 1–3 meses | ❌ 18–36 meses | ✅ Inmediato |
| Mantenibilidad por TI local | Alto | ✅ Código propio | ✅ Open source | ✅ Tercerizado Google | ❌ Dependencia proveedor | ✅ |
| Curva de aprendizaje (usuarios no técnicos) | Alto | ✅ Diseñado para docentes | ⚠️ Moderada | ✅ Familiar | ❌ Alta | ✅ Ya conocido |
| Trazabilidad de decisiones con historial auditable | Crítico | ✅ | ⚠️ | ❌ | ✅ | ❌ |
| Notificaciones automáticas ante cambios de estado | Medio | ✅ | ⚠️ | ⚠️ Manual | ✅ | ❌ |
| Generación de reportes institucionales (PDF/Excel) | Medio | ✅ | ✅ | ⚠️ Manual | ✅ | ❌ |
| **PUNTAJE TOTAL (sobre 24)** | — | **23** | **12** | **9** | **14** | **6** |

### 6.2 Positioning Statement

> Para los **administradores de facultad y técnicos DPA** de universidades públicas bolivianas, que **desperdician entre 3 y 5 semanas por semestre en gestión manual presencial sin trazabilidad**, el **SGAI** es una **plataforma de gestión académica-administrativa** que **reduce el ciclo de aprobación a ≤ 2 días hábiles con flujo digital y cumplimiento nativo de la normativa CEUB y Ley 164**, a diferencia de **SIU-Guaraní** (no adaptado a Bolivia, 2–4x más costoso en implementación) y de **Google Workspace** (sin flujos de aprobación formal ni integración con sistemas de nómina institucionales).

### 6.3 Ventaja Competitiva Sostenible

1. **Especificidad normativa CEUB + Ley 164 (barrera regulatoria):** Construido sobre las reglas del sistema universitario boliviano. Los competidores extranjeros necesitarían 12–18 meses y USD 50K–100K adicionales para localizar con el mismo nivel de especificidad.
2. **Conocimiento de sistemas legados locales (barrera de integración):** El conocimiento técnico de los sistemas de nómina e institucionales bolivianos —adquirido en la implementación piloto— es difícil de replicar por competidores sin presencia local.
3. **Modelo de expansión CEUB con efectos de red institucionales:** Adoptado en la universidad piloto, el SGAI puede licenciarse a las otras 10 universidades con costos de adaptación marginales (USD 15K–20K por institución adicional vs. USD 45K del piloto), creando una barrera de escala progresiva.

---

## 7. Propuesta de Valor

### 7.1 Value Proposition Canvas por Segmento

| Eje | Docente (Seg-1) | Admin. Facultad + DPA (Seg-2) |
|-----|-----------------|-------------------------------|
| **Gains** | Autogestión 24/7 sin desplazamientos; estado de trámites en tiempo real; boletas descargables en PDF | Panel centralizado; trámites digitales con trazabilidad; reportes automáticos; trabajo posible fuera de la oficina |
| **Pains** | Desplazamientos físicos; desconocimiento del estado; documentos en papel perdidos; tiempo invertido en trámites | 3 semanas de compilación manual; observaciones a lápiz ilegibles; Excel propio para rastrear estado; coordinación por WhatsApp |
| **Gain relievers** | Portal self-service con notificaciones automáticas de estado; boletas siempre disponibles | Flujo digital completo con panel de todos los docentes; envío al DPA con un clic |
| **Pain relievers** | Eliminación de presencialidad; feedback inmediato del sistema; DJ editable en borrador hasta el envío | Eliminación de compilación manual; trazabilidad de cada trámite; reportes generados por el sistema |
| **Products & services** | M-DJ + M-INFO-LABORAL + M-BOLETAS + M-PERFIL | M-DJ (revisión) + M-OFERTA + M-REPORTES + M-ADMIN-ROL |

### 7.2 Análisis de Océano Azul — Marco ERIC

| Acción | Atributo | Justificación |
|--------|----------|---------------|
| **ELIMINAR** | Presencialidad obligatoria para trámites | Ningún trámite del SGAI requiere presencia física |
| **ELIMINAR** | Documentación en papel sin trazabilidad | Flujo 100 % digital con historial auditable en cada cambio de estado |
| **ELIMINAR** | Coordinación por WhatsApp/correo informal entre Facultad y DPA | El flujo de aprobación está embebido en el sistema con notificaciones automáticas |
| **REDUCIR** | Tiempo de ciclo de aprobación de oferta académica | De 5–15 días hábiles a ≤ 2 días hábiles |
| **REDUCIR** | Costo de implementación vs. ERPs genéricos | De USD 200K–500K (ERPs) a USD 45K (SGAI) |
| **REDUCIR** | Horas-persona DPA en gestión manual | De ~800 h/año a < 320 h/año (reducción ≥ 60 %) |
| **AUMENTAR** | Trazabilidad de cada decisión institucional | Historial completo, inmutable, con actor + timestamp en cada transición |
| **AUMENTAR** | Accesibilidad del docente a su información laboral | Self-service 24/7 desde cualquier dispositivo con navegador |
| **AUMENTAR** | Cumplimiento normativo embebido en el sistema | Reglas CEUB y Ley 164 como invariantes del código, no como checklist manual |
| **CREAR** | Flujo de aprobación diseñado para la normativa CEUB boliviana | Ningún competidor tiene esto nativo; es el diferencial principal del SGAI |
| **CREAR** | Integración con nómina boliviana mediante adaptadores sin modificar el legado | Específico para el ecosistema tecnológico de las universidades bolivianas |
| **CREAR** | Operación on-premise certificada para cumplimiento Ley 164 | Requisito exclusivo del mercado boliviano que las soluciones cloud no pueden cubrir |

---

## 8. Pricing y Modelo de Negocio

- **Modelo:** Licencia institucional única (CAPEX) + suscripción anual de soporte y mantenimiento (OPEX).
- **Estructura de precios:**
  - Implementación y despliegue (CAPEX): **USD 45.000** — desarrollo, integración, capacitación, puesta en producción.
  - Soporte y mantenimiento anual (OPEX): **USD 6.000/año** — actualizaciones de seguridad, soporte TI, corrección de errores.
  - Adaptación para universidades CEUB adicionales: **USD 15.000–20.000** por institución (reutilización del núcleo).
- **Benchmark competitivo:**
  - SIU-Guaraní (localización para Bolivia): USD 80.000–150.000 estimado.
  - ERP genérico (Banner/Ellucian): USD 200.000–500.000 CAPEX + USD 30.000–80.000 OPEX/año.
  - SGAI ofrece el **mejor costo total de propiedad a 3 años** para universidades públicas bolivianas.
- **Umbral de licitación:** Las universidades públicas bolivianas tienen procesos de licitación obligatoria por encima de USD 50.000–80.000 (varía por institución). El precio de USD 45.000 permite adjudicación directa en la mayoría de los casos.

---

## 9. Go-to-Market

### 9.1 Canales de Adquisición

- **Canal directo — institución piloto:** Proyecto por encargo del DPA. Relación directa con el Director DPA como sponsor.
- **Canal institucional — CEUB:** Presentación del caso de éxito en reunión de Rectores del CEUB (Q1 2027). El CEUB tiene mecanismos de adopción compartida de tecnología entre universidades.
- **Canal académico:** Publicación de resultados en congresos de educación superior boliviana (CONED, SEABOL) y latinoamericana.
- **Boca a boca institucional:** Los administradores de facultad y técnicos DPA tienen redes entre universidades del CEUB; un caso de éxito se propaga orgánicamente.

### 9.2 Estrategia de Lanzamiento

- **Pre-launch (Sprint 0, Q2 2026):** POC-01 y POC-02; validación técnica con Unidad de TI; aprobación presupuestaria formal.
- **Launch MVP (Q3 2026):** Despliegue de v0.1 (M-DJ + M-OFERTA + M-AUTH) en staging; capacitaciones presenciales piloto con 5 administradores de facultad y 2 técnicos DPA; período de transición paralela (papel + digital).
- **Launch v1.0 (Q4 2026):** Despliegue completo en producción; retiro gradual del proceso en papel; inicio de medición de KPIs.
- **Post-launch — Expansión CEUB (Q1 2027):** Caso de éxito documentado con datos reales de KPIs; presentación ante el CEUB; negociación con 2–3 universidades adicionales.

### 9.3 Funnel AARRR Inicial

| Etapa | Métrica | Meta (año 1) |
|-------|---------|--------------|
| Acquisition | Instituciones CEUB que conocen el caso piloto SGAI | 11 universidades informadas en reunión CEUB Q1 2027 |
| Activation | % de docentes que completan su primer trámite digital en < 10 min | ≥ 80 % en primeros 30 días post-lanzamiento |
| Retention | % de docentes que usan el sistema ≥ 1 vez por mes | ≥ 70 % MAU en primeros 6 meses |
| Revenue | Universidades CEUB que contratan la adaptación | 2–3 universidades en año 2 |
| Referral | Presentaciones del caso piloto en CEUB o congresos educativos | ≥ 2 presentaciones en año 1 |

---

## 10. Métricas de Éxito del Producto

- **North Star Metric:** Tiempo medio de aprobación de oferta académica ≤ 2 días hábiles — Q1 2027 (vs. línea base 5–15 días).
- **KPIs secundarios:**
  - Tasa de adopción digital de DJ ≥ 90 % — Q1 2027.
  - % docentes que acceden a horarios/boletas mensualmente ≥ 70 % MAU — Q2 2027.
  - Satisfacción del usuario (CSAT) ≥ 4/5 — encuesta semestral desde Q2 2027.
  - Reducción horas-persona DPA en gestión manual ≥ 60 % — Q2 2027.
  - NPS institucional (sponsor + administradores) ≥ 40 — Q2 2027.

---

## 11. Requerimientos de Mercado (Alto Nivel)

| ID | Requerimiento | Prioridad | Justificación |
|----|---------------|-----------|---------------|
| MRD-N-01 | Gestionar ciclo completo de DJ con flujo multinivel Docente→Facultad→DPA | Must | Necesidad crítica del Seg-1 y Seg-2; diferencial vs. soluciones genéricas |
| MRD-N-02 | Digitalizar el trámite de oferta académica entre Facultades y DPA | Must | North Star KPI depende directamente de este módulo |
| MRD-N-03 | Proveer acceso self-service a horarios y carga horaria sincronizados | Must | JTBD-06; elimina consultas presenciales del Seg-1 |
| MRD-N-04 | Proveer acceso a boletas de pago integradas con sistema de nómina | Must | JTBD-05; validado en 100 % de entrevistas docentes |
| MRD-N-05 | Integrarse con sistema institucional sin modificarlo | Must | RES-03; restricción técnica y de negocio irrenunciable |
| MRD-N-06 | Generar reportes exportables (PDF/Excel) para el DPA | Should | JTBD-08; reduce 2 días de trabajo manual por reporte |
| MRD-N-07 | Cumplir Ley 164 de Bolivia y operar en servidores locales | Must | Requisito regulatorio; barrera de entrada para competidores cloud |
| MRD-N-08 | Soportar flujos de aprobación configurables por reglamento de cada universidad | Should | Requisito de escalabilidad para expansión CEUB |
| MRD-N-09 | Soportar ≥ 200 usuarios concurrentes en períodos de alta demanda | Must | Contexto de 1.500+ docentes + 20 administradores en inicio de semestre |
| MRD-N-10 | Ser operable y mantenible por la Unidad de TI sin dependencia de proveedor externo | Must | Restricción presupuestaria y de soberanía tecnológica institucional |

---

## 12. Supuestos e Hipótesis a Validar

| ID | Hipótesis | Cómo validar | Criterio de éxito | Estado |
|----|-----------|--------------|-------------------|--------|
| H-01 | Los docentes completarán su primer trámite digital sin capacitación si el flujo tiene ≤ 5 pasos | Test de usabilidad con 5 docentes sin instrucciones previas | ≥ 4/5 completan en < 10 min sin asistencia | 🟡 En validación |
| H-02 | El Admin.Facultad puede procesar la oferta académica completa en ≤ 30 min usando el sistema | Simulación cronometrada con 3 administradores con prototipo | ≥ 80 % lo logran | 🔴 Pendiente |
| H-03 | El TécnicoDPA puede resolver un trámite de oferta en ≤ 1 día hábil con el flujo digital | Simulación con técnicos DPA actuales | ≥ 2/3 técnicos acuerdan que el flujo es viable | 🔴 Pendiente |
| H-04 | Los sistemas legados pueden integrarse mediante adaptadores sin modificar el sistema de origen | POC-01 Sprint 0 con Unidad de TI | Al menos 1 mecanismo de integración factible identificado | 🟡 En análisis |
| H-05 | La adopción en la universidad piloto generará interés formal en ≥ 2 universidades CEUB adicionales | Presentación del caso piloto en reunión CEUB Q1 2027 | ≥ 2 universidades solicitan información o demostración | 🔴 Pendiente |
| H-06 | El 80 % de los docentes prefieren boletas digitales sobre el proceso actual (papel/presencial) | Encuesta a 50 docentes + prueba de acceso en MVP | ≥ 75 % expresan preferencia por el canal digital | ✅ Validada (87 % en entrevistas pre-MVP) |

---

## 13. Riesgos de Mercado

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Baja adopción por resistencia cultural al cambio (docentes acostumbrados al papel) | Media | Alto | Período de transición paralela (papel + digital) en el primer semestre; capacitaciones presenciales; tutoriales en video |
| Integración con sistemas legados técnicamente inviable | Alta | Alto | Sprint 0 / POC-01 obligatorio antes de comprometer alcance; módulos de boletas e info. laboral opcionales para MVP si POC falla |
| Presupuesto institucional no aprobado o reducido | Media | Alto | Business case cuantificado con VAN +USD 12.400; precio por debajo de umbral de licitación |
| Cambios regulatorios CEUB que modifiquen flujos de aprobación | Baja | Medio | Flujos de aprobación como configuración (no código rígido); versionado de reglas de negocio |
| Sistemas legados de otras universidades CEUB muy distintos al piloto | Media | Medio | Arquitectura con adaptadores desacoplados (ADR-0002); análisis técnico previo a cada nueva implementación |
| Proveedor externo lanza solución similar adaptada al mercado boliviano | Baja | Medio | Acelerar time-to-market con MVP en Q3 2026; comunicación del avance al CEUB |

---

## 14. Trazabilidad

| MRD ID | BRD ID | PRD ID |
|--------|--------|--------|
| MRD-N-01 | BR-001, BR-006, BR-007, RB-01, RB-03 | PRD-REQ-002, PRD-REQ-004, PRD-REQ-005 |
| MRD-N-02 | BR-002, BR-003, RB-02 | PRD-REQ-003 |
| MRD-N-03 | BR-004 | PRD-REQ-007 |
| MRD-N-04 | BR-005, BR-009, RB-04 | PRD-REQ-006, PRD-REQ-012 |
| MRD-N-05 | BR-010 | PRD-REQ-007 |
| MRD-N-06 | BR-012 | PRD-REQ-009 |
| MRD-N-07 | RB-04, RB-05 | PRD-NFR-004, PRD-NFR-005, PRD-NFR-007 |
| MRD-N-08 | BR-008 | PRD-REQ-011 |
| MRD-N-09 | BR-011 | PRD-NFR-008 |
| MRD-N-10 | BR-013 (implícito) | PRD-NFR-003 |

---

## 15. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v1.0 | 02/05/2026 | Carolina Aguilar | Versión inicial |
| v1.1 | 10/05/2026 | Carolina Aguilar | Análisis competitivo con puntuación numérica (24 criterios); 2 personas expandidas (Seg-1 y Seg-2) con criterio de adopción, willingness-to-pay y contexto laboral detallado; Océano Azul actualizado con marco ERIC completo (12 acciones); hipótesis H-06 marcada como validada |

---

## Checklist Mínimo

- [x] TAM/SAM/SOM con fuentes (§3.1).
- [x] ≥ 2 personas completas con criterio de adopción y willingness-to-pay (4 personas — §4.2).
- [x] ≥ 2 segmentos detallados: Seg-1 (Docentes) y Seg-2 (Admin. Facultad + DPA).
- [x] Voz del Cliente documentada (§4.3 — 8 entrevistas, citas, temas emergentes).
- [x] ≥ 8 JTBD (8 JTBD — §5).
- [x] Análisis competitivo con puntuación numérica y ≥ 5 alternativas (§6.1 — score 23/24).
- [x] Positioning statement en 1 párrafo (§6.2).
- [x] Océano Azul con marco ERIC completo (12 acciones — §7.2).
- [x] Pricing y go-to-market esbozados (§8 y §9).
- [x] North Star + 4 KPIs fechados (§10).
- [x] 10 requerimientos MRD-N-* priorizados (§11).
- [x] 6 hipótesis con estado actual (§12).
- [x] Trazabilidad a BRD y PRD completada (§14).
