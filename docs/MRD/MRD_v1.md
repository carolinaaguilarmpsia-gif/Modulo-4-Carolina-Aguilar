# Market Requirements Document (MRD) — v1.0
# Sistema de Gestión Académica Integral (SGAI)

---

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| Producto | Sistema de Gestión Académica Integral (SGAI) |
| Grupo | G01 |
| Versión | v1.0 |
| Fecha | 10/05/2026 |
| Product Manager / Autor | Equipo de Desarrollo SGAI |
| Revisores | Docente + Stakeholders institucionales |
| Estado | Borrador |
| Relación con BRD | BRD_SGAI_v2.0 |

---

## 1. Resumen Ejecutivo

El SGAI nace de una brecha estructural en la gestión académica de las universidades públicas bolivianas: más de 1.500 docentes y 15+ facultades operan hoy con procesos 100 % manuales y presenciales que generan ciclos de aprobación de 5 a 15 días hábiles, pérdida de documentos, cero trazabilidad y saturación del Departamento de Planificación Académica (DPA).

El mercado objetivo es el sistema universitario público boliviano (CEUB), compuesto por 11 universidades autónomas con más de 170.000 estudiantes y aproximadamente 12.000 docentes activos a nivel nacional. La oportunidad inmediata es la institución piloto (universidad pública con 1.500+ docentes), con un SOM de expansión potencial al resto del sistema CEUB.

Las soluciones actuales disponibles —SIU-Guaraní (Argentina), ERP genéricos como Banner o Ellucian, y herramientas colaborativas como Google Workspace— no resuelven el problema de fondo: ninguna está diseñada para la normativa boliviana (CEUB, Ley 164), los flujos de aprobación multinivel docente-facultad-DPA, ni la integración con sistemas de nómina locales. El SGAI ocupa un océano azul: plataforma de gestión académica-administrativa diseñada específicamente para el contexto universitario público boliviano.

La diferenciación clave es triple: (1) flujo de aprobación configurable alineado al reglamento interno CEUB, (2) integración nativa con sistemas legados de nómina e información institucional sin modificarlos, y (3) acceso self-service completo para el docente desde cualquier navegador. El tamaño de oportunidad a 3 años supera los USD 200.000 en el sistema CEUB completo, con un modelo de licenciamiento institucional replicable.

---

## 2. Visión del Producto

> "Para los docentes y administradores de universidades públicas bolivianas, que hoy pierden entre 5 y 15 días hábiles en trámites presenciales y en papel, el SGAI es la plataforma de gestión académica-administrativa diseñada para el contexto CEUB que reduce el ciclo de aprobación a ≤ 2 días hábiles y da acceso self-service completo a toda la información laboral desde cualquier navegador — antes del ciclo académico 2027."

---

## 3. Análisis de Mercado

### 3.1 Tamaño de Mercado

| Métrica | Valor | Fuente |
|---------|-------|--------|
| TAM — Universidades públicas CEUB (11 universidades) | ~12.000 docentes activos, presupuesto TI estimado USD 2–5M/año en el sistema | CEUB Informe Estadístico 2024; estimación propia |
| TAM — Valor económico del mercado de software de gestión académica en Latinoamérica | USD 1.200M (2025), crecimiento ~12 % anual | MarketsandMarkets 2025 (estimación regional) |
| SAM — Universidades públicas bolivianas con necesidad documentada de digitalización académica | 11 universidades CEUB × USD 45.000 CAPEX promedio = ~USD 495.000 | Estimación propia basada en BRD §15 |
| SOM — Universidad piloto (año 1) + 2–3 universidades CEUB (años 2–3) | USD 45.000 (piloto) + USD 90.000–135.000 (expansión) = USD 135.000–180.000 en 3 años | Estimación equipo SGAI |

> **Nota de transparencia:** Las cifras de TAM regional son estimaciones de mercado; los valores de SAM y SOM son proyecciones del equipo basadas en el caso piloto documentado. Se validarán con datos reales de presupuesto institucional en la fase de expansión.

### 3.2 Tendencias del Sector

- **Digitalización acelerada post-pandemia en educación superior latinoamericana:** Las universidades públicas de la región incrementaron su inversión en plataformas digitales entre 2020 y 2024; Bolivia sigue la tendencia con rezago de 2–3 años, creando una ventana de oportunidad.
- **Demanda de sistemas específicos vs. ERPs genéricos:** Las instituciones de educación superior rechazan progresivamente los ERPs de alto costo (Banner, Ellucian) en favor de soluciones verticales más accesibles y adaptables a su normativa local.
- **Crecimiento del modelo SaaS/licencia en software universitario público latinoamericano:** Iniciativas como SIU-Guaraní (Argentina) demuestran que el modelo de licenciamiento entre universidades públicas es viable y preferido sobre la contratación de proveedores privados.
- **Regulación creciente de datos en Bolivia (Ley 164):** El cumplimiento normativo de protección de datos se convierte en requisito mínimo de cualquier sistema institucional, creando barreras de entrada para soluciones extranjeras no adaptadas.
- **Autogestión docente como expectativa mínima:** Los docentes de educación superior esperan el mismo nivel de acceso digital a su información laboral que tienen en el sector privado; la presencialidad obligatoria es percibida como fricción institucional negativa.

### 3.3 Factores Regulatorios y de Cumplimiento

- **Ley N° 164 de Telecomunicaciones y Tecnologías de Información y Comunicación (Bolivia):** Establece requisitos de seguridad informática, protección de datos personales y soberanía de datos. Todos los sistemas institucionales bolivianos deben cumplirla.
- **Normativa CEUB (Comité Ejecutivo de la Universidad Boliviana):** Establece los formatos, plazos y flujos de la planificación académica (oferta académica, declaraciones juradas). El SGAI embebe estas reglas en su lógica de negocio.
- **Reglamento interno universitario:** Cada universidad tiene sus propias políticas de vinculación docente, roles institucionales y plazos administrativos. El SGAI debe ser configurable para respetar estas diferencias entre universidades del CEUB.
- **Estatuto Orgánico de la Universidad Boliviana:** Marco legal de la autonomía universitaria que regula la estructura administrativa y los procesos de planificación académica.

### 3.4 Cadencia de Continuous Discovery

| Aspecto | Valor |
|---------|-------|
| Cadencia de entrevistas | Quincenal durante el desarrollo del MVP |
| Usuarios contactados en la fase actual | 8 docentes, 4 administradores de facultad, 2 técnicos DPA, 1 director DPA |
| Formato de hipótesis | *Cuando `<situación>`, espero `<resultado>`, porque `<razón>`* |
| Backlog de hipótesis | Ver §12 de este MRD |
| Output del track | Validaciones que actualizan §3, §5, §11 y §12 de este MRD sprint a sprint |

> **Sprint actual:** Se realizaron 15 contactos con usuarios en las semanas previas a la elaboración de este MRD. El próximo ciclo de discovery (semana del 20/05/2026) validará los flujos de oferta académica con 3 administradores de facultad adicionales.

---

## 4. Segmentación y Personas

### 4.1 Segmentos de Clientes

| Segmento | Tamaño (institución piloto) | Necesidad principal | Disposición institucional | Notas |
|----------|----------------------------|---------------------|--------------------------|-------|
| Docentes universitarios (titular, interino, investigador) | 1.500+ | Autogestión de DJ, horarios y boletas sin presencialidad | Alta (presión por digitalización) | Usuario final con menor capacidad técnica; UX crítica |
| Administradores de Facultad | 15–20 (uno por facultad) | Coordinar oferta académica y validar DJ de forma eficiente | Alta (carga de trabajo manual insostenible) | Usuarios de alta frecuencia; flujo de trabajo complejo |
| Técnicos DPA | 3–5 | Bandeja de trámites digital, reportes automáticos | Muy alta (sponsor del proyecto) | Usuarios con mayor conocimiento institucional |
| Administradores del Sistema (TI) | 1–2 | Gestión centralizada de accesos y configuración | Alta (reduces soporte directo) | Usuarios técnicos; necesitan herramientas de auditoría |
| Dirección Universitaria | 3–5 | Visibilidad de métricas institucionales | Media (interés estratégico) | Usuarios de consulta; reportes ejecutivos |

### 4.2 Personas

#### Persona 1 — Prof. Carmen Villalba (Docente Universitaria)

- **Rol:** Docente titular con 12 años de antigüedad, dicta 3 materias en 2 facultades.
- **Demografía:** 42 años, licenciada en Ciencias de la Educación, usa smartphone Android y laptop personal. Acceso a internet móvil y WiFi universitario.
- **Objetivos:**
  1. Enviar su declaración jurada sin ir físicamente al DPA.
  2. Saber en qué estado está su trámite sin llamar a la secretaría.
  3. Acceder a sus boletas de pago del último semestre cuando necesite justificar ingresos.
  4. Consultar su horario oficial sin depender de un papel pegado en la pared.
- **Dolores actuales:**
  - Dedica entre 2 y 4 horas por semestre en desplazamientos para trámites presenciales.
  - No sabe el estado de sus trámites hasta que llama o va físicamente.
  - Ha tenido DJ devueltas por errores mínimos de formato, con retraso de 2 semanas adicionales.
  - Su boleta de pago llega en papel a su buzón; la pierde frecuentemente.
- **Comportamiento digital:** Usa WhatsApp intensivamente, tiene cuenta de Gmail personal, usa Excel básico. No tiene experiencia con plataformas institucionales complejas.
- **Frase representativa:** "Si pudiera hacer todo desde mi celular, me ahorraría media jornada por semestre. Pero siempre termino yendo igual porque no sé si llegó mi papel."
- **Willingness-to-pay:** No paga directamente; el sistema es financiado institucionalmente. Su adopción depende de la percepción de utilidad en los primeros 2 usos.

---

#### Persona 2 — Lic. Roberto Mamani (Administrador de Facultad)

- **Rol:** Secretario académico de la Facultad de Ciencias Económicas. Gestiona 80 docentes y coordina 6 carreras.
- **Demografía:** 38 años, administrativo de planta con 8 años en el cargo. Usa computadora de escritorio con Windows 10 en su oficina. Conexión a internet de la universidad.
- **Objetivos:**
  1. Compilar y enviar el trámite de oferta académica sin recopilar hojas de 80 docentes.
  2. Saber qué DJ de sus docentes están pendientes sin revisar carpetas físicas.
  3. Gestionar el estado de sus docentes (autoridades, investigadores) desde un panel central.
  4. Reducir la coordinación por correo y WhatsApp con los técnicos del DPA.
- **Dolores actuales:**
  - Dedica 3 semanas completas al inicio de cada semestre solo en la compilación de la oferta académica.
  - Recibe devoluciones del DPA con observaciones a lápiz en hojas impresas.
  - Tiene una hoja de cálculo propia (no oficial) para rastrear el estado de las DJ de sus docentes.
  - Coordina por correo electrónico y WhatsApp con el DPA; la información se pierde entre mensajes.
- **Comportamiento digital:** Usuario de Microsoft Office (Word, Excel, correo Outlook), familiarizado con formularios web simples. No tiene experiencia con sistemas de gestión académica digitales.
- **Frase representativa:** "Cada inicio de semestre es un caos. Tengo mi propio Excel para rastrear quién me entregó qué, porque el sistema no existe. Si hubiera algo, aunque sea básico, ya sería un alivio."
- **Willingness-to-pay:** Igual que Persona 1, financiamiento institucional. Su adopción es crítica para el éxito del sistema; es el principal multiplicador de valor para los docentes de su facultad.

---

#### Persona 3 — Téc. Jimena Flores (Técnico DPA)

- **Rol:** Técnica del Departamento de Planificación Académica. Revisa y aprueba los trámites de oferta académica de las 15+ facultades.
- **Demografía:** 35 años, técnica administrativa con título de Auditoría. Trabaja exclusivamente en el DPA. Computadora de escritorio, conexión de la universidad.
- **Objetivos:**
  1. Tener una bandeja de trabajo con todos los trámites pendientes, priorizados y con historial.
  2. Poder observar y devolver trámites con observaciones formales sin imprimir ni firmar a mano.
  3. Generar reportes consolidados para la Dirección sin construirlos manualmente en Excel.
  4. Tener trazabilidad de quién hizo qué y cuándo en cada trámite.
- **Dolores actuales:**
  - Recibe carpetas físicas de 15+ facultades en el mismo período; el seguimiento es imposible sin listas propias.
  - Las observaciones se escriben a mano sobre documentos físicos; los docentes alegan no haberlas recibido.
  - Los reportes para la Dirección los construye manualmente en Excel, tomando entre 1 y 2 días por reporte.
  - No puede trabajar desde fuera de la oficina porque toda la documentación es física.
- **Frase representativa:** "Cuando llega el período de cierre de oferta académica, hay días que reviso 20 carpetas. Si pudiera ver todo en pantalla con el historial, mi trabajo cambiaría completamente."
- **Willingness-to-pay:** Financiamiento institucional. Es el usuario con mayor impacto directo en la reducción del KPI-01 (tiempo de aprobación).

---

#### Persona 4 — Ing. Marco Quispe (Administrador del Sistema / Unidad de TI)

- **Rol:** Técnico de la Unidad de TI universitaria. Responsable de la infraestructura de servidores y del soporte a sistemas institucionales.
- **Demografía:** 30 años, ingeniero de sistemas. Familiarizado con Linux, redes y bases de datos relacionales. Alta capacidad técnica.
- **Objetivos:**
  1. Desplegar y mantener el sistema con mínima fricción operativa.
  2. Gestionar usuarios y permisos desde un panel sin acceso directo a la base de datos.
  3. Tener logs de auditoría y monitoreo del sistema disponibles.
  4. Integrar el SGAI con los sistemas legados de nómina y el sistema institucional con el menor riesgo posible.
- **Dolores actuales:**
  - Gestiona accesos de usuarios directamente en bases de datos o archivos de configuración; no hay panel administrativo.
  - Los sistemas legados no tienen documentación de API actualizada.
  - Recibe solicitudes de soporte por WhatsApp y correo sin sistema de tickets.
- **Frase representativa:** "Necesito que el sistema sea desplegable en nuestros servidores sin dependencias externas raras, y que tenga un panel de admin decente. Lo demás lo puedo manejar."

---

## 5. Jobs-to-be-Done

| JTBD ID | Cuando… | Quiero… | Para poder… |
|---------|---------|---------|-------------|
| JTBD-01 | inicio de semestre y debo presentar mi DJ | crearla y enviarla desde mi computadora o celular en menos de 10 minutos | cumplir con mi obligación administrativa sin ir físicamente al DPA |
| JTBD-02 | quiero saber si mi DJ fue aprobada o devuelta | consultar el estado en tiempo real desde el sistema | tomar acción inmediata sin esperar una llamada de la secretaría |
| JTBD-03 | necesito coordinar la oferta académica de mi facultad | tener un panel centralizado donde asignar docentes a materias y enviarlo al DPA con un clic | evitar 3 semanas de recopilación manual de papeles y coordinación por WhatsApp |
| JTBD-04 | recibo una devolución con observaciones del DPA | ver exactamente qué debo corregir, con el historial completo de comentarios | corregir el trámite en el mismo sistema sin re-presentar toda la documentación física |
| JTBD-05 | un docente o familiar me pide comprobante de mis ingresos | descargar mi boleta de pago oficial en PDF desde el sistema | no tener que ir a la administración a solicitarla en persona |
| JTBD-06 | un estudiante me pregunta mi horario | consultarlo en el sistema oficial en tiempo real | dar información certera sin depender de un papel desactualizado |
| JTBD-07 | necesito actualizar mi CV para postular a investigación | actualizar mis datos de formación y publicaciones en el sistema institucional | tener un perfil profesional actualizado y disponible para la universidad |
| JTBD-08 | el DPA me pide el reporte de oferta académica del semestre | generarlo desde el sistema con un clic en PDF o Excel | no construirlo manualmente en Excel durante 2 días |

---

## 6. Análisis Competitivo

### 6.1 Tabla Comparativa

| Criterio | SGAI (nuestro producto) | SIU-Guaraní (Argentina) | Google Workspace (Forms + Drive) | ERP genérico (Banner/Ellucian) | Proceso actual (papel + presencial) |
|----------|------------------------|-------------------------|----------------------------------|-------------------------------|-------------------------------------|
| Adaptación a normativa CEUB Bolivia | ✅ Diseñado específicamente | ❌ Normativa argentina; requiere costosa localización | ❌ Sin lógica de negocio institucional | ❌ Genérico; requiere costosa parametrización | ✅ Es la norma vigente (pero manual) |
| Flujo de aprobación multinivel (Docente → Facultad → DPA) | ✅ Nativo, configurable | ⚠️ Parcial (enfocado en estudiantes, no docentes) | ❌ No soporta flujos de aprobación formales | ✅ Configurable con alto costo de implementación | ❌ Manual, sin trazabilidad |
| Integración con sistemas legados de nómina | ✅ Adaptadores desacoplados | ⚠️ Parcial (ecosistema SIU) | ❌ No | ✅ Requiere proyecto de integración costoso | ❌ No aplica |
| Acceso self-service docente (boletas, horarios, DJ) | ✅ Completo | ⚠️ Parcial (enfoque en estudiantes) | ⚠️ Limitado (no integrado con nómina) | ✅ Con costosa configuración | ❌ Solo presencial |
| Costo de implementación (CAPEX) | USD 45.000 (estimado) | USD 80.000–150.000 (licencia + localización) | USD 5.000–10.000 (sin soporte) | USD 200.000–500.000 | USD 0 (costo operativo oculto) |
| Tiempo de implementación | 6–12 meses | 12–24 meses | 1–3 meses (sin flujos formales) | 18–36 meses | No aplica |
| Cumplimiento Ley 164 Bolivia | ✅ Diseñado para ello | ❌ No nativo | ⚠️ Parcial (datos en servidores Google) | ⚠️ Depende de la configuración | ❌ No aplica |
| Operación en servidores locales (sin cloud pública) | ✅ Sí | ✅ Sí | ❌ No (cloud Google) | ⚠️ Depende del modelo | ✅ No aplica |
| Soporte en español boliviano + contexto CEUB | ✅ Nativo | ⚠️ Español argentino, diferente reglamentación | ⚠️ Interfaz en español, sin contexto institucional | ❌ Soporte en inglés o intermediarios | ✅ Es el idioma nativo |
| Curva de aprendizaje para usuarios no técnicos | ✅ Diseñado para docentes sin experiencia en sistemas | ⚠️ Moderada | ✅ Baja (herramienta familiar) | ❌ Alta | ❌ No aplica |
| Mantenimiento y evolución por la propia universidad | ✅ Código propio, equipo TI local | ✅ Código abierto SIU | ✅ Tercerizado a Google | ❌ Dependencia del proveedor | ✅ No aplica |

### 6.2 Positioning Statement

> Para los **administradores de facultad y técnicos DPA** de universidades públicas bolivianas, que **hoy desperdician entre 3 y 5 semanas por semestre en gestión manual presencial sin trazabilidad**, el **SGAI** es una **plataforma de gestión académica-administrativa** que **reduce el ciclo de aprobación de oferta académica a ≤ 2 días hábiles con flujo digital completo y cumplimiento de la normativa CEUB**, a diferencia de **SIU-Guaraní y los ERPs genéricos**, que **no están adaptados a la regulación boliviana y tienen costos de implementación 2 a 10 veces superiores**, ni de **Google Workspace**, que **carece de flujos de aprobación formal y de integración con sistemas de nómina institucionales**.

### 6.3 Ventaja Competitiva Sostenible

- **Especificidad normativa:** El SGAI está construido sobre las reglas del CEUB y la Ley 164 de Bolivia. Esta especificidad es difícil de replicar por competidores genéricos o extranjeros sin incurrir en altos costos de adaptación.
- **Integración con sistemas legados locales:** El conocimiento de los sistemas de nómina e información institucional de las universidades bolivianas, adquirido en la implementación piloto, es una barrera de entrada para nuevos competidores.
- **Modelo de expansión CEUB:** Una vez adoptado en la universidad piloto, el SGAI puede licenciarse a las otras 10 universidades del sistema con costos de adaptación marginales, creando efectos de red institucionales.
- **Costo total de propiedad competitivo:** USD 45.000 CAPEX vs. USD 80.000–500.000 de alternativas, con OPEX de USD 6.000/año operado por la propia Unidad de TI universitaria.

---

## 7. Propuesta de Valor

### 7.1 Value Proposition Canvas Resumido

| Eje | Docente | Administrador de Facultad | Técnico DPA |
|-----|---------|--------------------------|-------------|
| **Gains (ganancias)** | Acceso 24/7 a DJ, horarios y boletas desde cualquier dispositivo; cero desplazamientos | Panel centralizado de gestión de 80+ docentes; visibilidad en tiempo real del estado de trámites | Bandeja digital con historial; reportes automáticos en PDF/Excel; trabajo remoto posible |
| **Pains (dolores)** | Desplazamientos físicos, desconocimiento del estado de sus trámites, documentos en papel perdidos | 3 semanas de compilación manual por semestre, coordinación por WhatsApp, devoluciones sin trazabilidad | 20+ carpetas físicas diarias en períodos críticos, reportes manuales de 2 días, imposibilidad de trabajar remoto |
| **Gain relievers** | Portal web self-service con notificaciones automáticas de estado | Flujo digital completo con asignación de docentes en pantalla y envío con un clic | Bandeja digital con filtros, historial de observaciones y generación automática de reportes |
| **Pain relievers** | Eliminación de presencialidad; estado de trámites en tiempo real; DJ editable en borrador hasta el envío | Eliminación de compilación manual; trazabilidad de cada trámite; observaciones formales con texto registrado | Digitalización completa del flujo de revisión; reportes generados por el sistema; historial auditable |
| **Products & services** | Módulo DJ + Módulo Información Laboral + Módulo Boletas de Pago + Módulo Perfil | Módulo DJ (revisión) + Módulo Oferta Académica + Módulo Roles Docentes | Módulo Oferta Académica (aprobación) + Módulo Reportes + Panel de control institucional |

### 7.2 Análisis de Océano Azul — SGAI vs. Competidores

> Estrategia de diferenciación basada en el marco de *Blue Ocean Strategy* (Kim & Mauborgne). El SGAI elimina, reduce, aumenta y crea atributos para separarse de la competencia.

| Acción | Atributo | Detalle |
|--------|----------|---------|
| **ELIMINAR** | Presencialidad obligatoria para trámites | El SGAI hace que ningún trámite requiera presencia física |
| **ELIMINAR** | Documentación en papel | Flujo 100 % digital con firma de aceptación electrónica |
| **REDUCIR** | Tiempo de aprobación de oferta académica | De 5–15 días a ≤ 2 días hábiles |
| **REDUCIR** | Costo de implementación vs. ERPs | De USD 200.000–500.000 (ERPs) a USD 45.000 |
| **AUMENTAR** | Trazabilidad de cada decisión | Historial completo de cambios de estado, actores y timestamps |
| **AUMENTAR** | Accesibilidad del docente a su información | Self-service 24/7 desde cualquier dispositivo con navegador |
| **CREAR** | Flujo de aprobación diseñado para la normativa CEUB | Ningún competidor tiene esto nativo; es el diferencial principal |
| **CREAR** | Integración con sistemas de nómina bolivianos sin modificarlos | Adaptador desacoplado específico para el ecosistema local |
| **CREAR** | Operación en servidores locales + cumplimiento Ley 164 nativo | Requisito exclusivo del mercado boliviano; las soluciones extranjeras no lo cubren |

---

## 8. Pricing y Modelo de Negocio

### Modelo Principal: Licencia Institucional por Universidad

- **Modelo:** Licencia institucional única (CAPEX de desarrollo) + suscripción anual de soporte y mantenimiento (OPEX).
- **Estructura de precios propuesta:**
  - **Implementación y despliegue (CAPEX):** USD 45.000 — incluye desarrollo, integración con sistemas legados, capacitación y puesta en producción.
  - **Soporte y mantenimiento anual (OPEX):** USD 6.000/año — incluye actualizaciones de seguridad, soporte técnico a la Unidad de TI y corrección de errores.
  - **Adaptación para universidades adicionales del CEUB:** USD 15.000–20.000 por universidad (costo reducido por reutilización del núcleo del sistema).
- **Benchmark:**
  - SIU-Guaraní (Argentina): gratuito para universidades del SIU, pero el costo de localización e implementación en Bolivia supera los USD 80.000.
  - ERP universitario genérico: USD 200.000–500.000 CAPEX + USD 30.000–80.000 OPEX anual.
  - SGAI ofrece el mejor costo total de propiedad a 3 años para el segmento de universidades públicas bolivianas.
- **Elasticidad:** Las universidades públicas bolivianas operan con presupuestos institucionales rígidos. El precio debe estar por debajo del umbral de licitación pública que requiere proceso competitivo extendido (varía por universidad; estimado USD 50.000–80.000).

---

## 9. Go-to-Market

### 9.1 Canales de Adquisición

- **Canal directo — Institución piloto:** El proyecto nace como un encargo del DPA de la universidad piloto. La relación directa con el sponsor (Director DPA) es el canal principal de la fase 1.
- **Canal institucional — CEUB:** Una vez validado en la institución piloto, la presentación del caso de éxito ante el CEUB (reuniones de Rectores) es el canal de expansión natural. El CEUB tiene mecanismos de adopción compartida de tecnología entre universidades.
- **Canal académico:** Publicación de resultados (reducción de tiempos, adopción docente) en congresos de educación superior boliviana y latinoamericana como herramienta de posicionamiento.
- **Boca a boca institucional:** Los administradores de facultad y técnicos DPA tienen redes de contacto entre universidades del sistema CEUB; un caso de éxito validado se propaga orgánicamente.

### 9.2 Estrategia de Lanzamiento

- **Pre-launch (Sprint 0 — Q2 2026):** Análisis técnico de integración con sistemas legados; validación de flujos con usuarios reales (5+ docentes, 2+ administradores); aprobación formal del BRD y presupuesto por el sponsor.
- **Launch MVP (Q3 2026):** Despliegue del MVP (módulos DJ + Oferta Académica + Administración) en entorno de staging; capacitaciones presenciales a usuarios piloto (Administradores de Facultad y Técnicos DPA); período de transición paralela (papel + digital).
- **Launch v1.0 (Q4 2026):** Despliegue de v1.0 completa (todos los módulos) en producción; retiro gradual del proceso en papel; inicio de medición de KPIs.
- **Post-launch — Expansión CEUB (Q1–Q2 2027):** Caso de éxito documentado; presentación ante el CEUB; negociación de adopción en 2–3 universidades adicionales.

### 9.3 Funnel AARRR Inicial

| Etapa | Métrica | Meta (año 1) |
|-------|---------|--------------|
| Acquisition | Instituciones que conocen el SGAI (CEUB) | 11 universidades informadas del caso piloto |
| Activation | % de docentes que completan su primer trámite digital | ≥ 80 % en los primeros 30 días post-lanzamiento |
| Retention | % de docentes que usan el sistema al menos 1 vez por mes | ≥ 70 % MAU en los primeros 6 meses |
| Revenue | Universidades CEUB que contratan la adaptación del SGAI | 2–3 universidades en año 2 |
| Referral | Presentaciones del caso piloto en el CEUB o congresos educativos | ≥ 2 presentaciones en año 1 |

---

## 10. Métricas de Éxito del Producto

- **North Star Metric:** Tiempo medio de aprobación de oferta académica (días hábiles) — Meta: ≤ 2 días hábiles en Q1 2027 vs. línea base de 5–15 días.
- **KPIs secundarios:**
  - Tasa de adopción digital de DJ ≥ 90 % — Q1 2027.
  - % de docentes que acceden a horarios/boletas mensualmente ≥ 70 % MAU — Q2 2027.
  - Satisfacción del usuario (CSAT) ≥ 4/5 — medición semestral desde Q2 2027.
  - Reducción de horas-persona DPA en gestión manual ≥ 60 % — Q2 2027.
  - NPS institucional (sponsor + administradores) ≥ 40 — Q2 2027.

---

## 11. Requerimientos de Mercado (Alto Nivel)

| ID | Requerimiento | Prioridad | Justificación |
|----|---------------|-----------|---------------|
| MRD-N-01 | El sistema debe gestionar el ciclo completo de DJ con flujo de aprobación multinivel (Docente → Facultad → DPA) | Must | Necesidad crítica del segmento; diferencial vs. soluciones genéricas |
| MRD-N-02 | El sistema debe digitalizar el trámite de oferta académica entre Facultades y DPA | Must | KPI-01 (North Star) depende directamente de este módulo |
| MRD-N-03 | El sistema debe proveer acceso self-service a horarios y carga horaria sincronizados | Must | JTBD-06; eliminación de consultas presenciales |
| MRD-N-04 | El sistema debe proveer acceso a boletas de pago integradas con el sistema de nómina | Must | JTBD-05; necesidad validada en 100 % de entrevistas docentes |
| MRD-N-05 | El sistema debe integrarse con el sistema de información institucional sin modificarlo | Must | Restricción técnica y de negocio del contexto universitario boliviano |
| MRD-N-06 | El sistema debe generar reportes exportables (PDF/Excel) para el DPA | Should | JTBD-08; reduce 2 días de trabajo manual por reporte |
| MRD-N-07 | El sistema debe cumplir la Ley 164 de Bolivia y operar en servidores locales | Must | Requisito regulatorio y política de la Unidad de TI universitaria |
| MRD-N-08 | El sistema debe soportar flujos de aprobación configurables por reglamento interno de cada universidad | Should | Requisito de escalabilidad para la expansión al sistema CEUB |
| MRD-N-09 | El sistema debe soportar al menos 200 usuarios concurrentes en períodos de alta demanda | Must | Contexto de institución piloto: 1.500 docentes + 20 administradores |
| MRD-N-10 | El sistema debe ser operable y mantenible por la Unidad de TI universitaria sin dependencia de proveedor externo | Must | Restricción presupuestaria y de soberanía tecnológica institucional |

---

## 12. Supuestos e Hipótesis a Validar

| ID | Hipótesis | Cómo validar | Criterio de éxito |
|----|-----------|--------------|-------------------|
| H-01 | Los docentes completarán su primer trámite digital sin capacitación presencial si el flujo tiene ≤ 5 pasos | Test de usabilidad con 5 docentes sin instrucciones previas | ≥ 4/5 completan sin asistencia en < 10 minutos |
| H-02 | El Administrador de Facultad puede procesar la oferta académica completa en ≤ 30 minutos usando el sistema | Simulación cronometrada con 3 administradores | ≥ 80 % lo logran en el tiempo definido |
| H-03 | El Técnico DPA puede resolver un trámite de oferta académica en ≤ 1 día hábil con el flujo digital | Simulación con los técnicos DPA actuales | ≥ 2/3 técnicos acuerdan que el flujo es viable en ese tiempo |
| H-04 | Los sistemas legados de nómina e institucional pueden integrarse mediante adaptadores sin modificar el sistema de origen | Análisis técnico de Sprint 0 con la Unidad de TI | Se identifica al menos 1 mecanismo de integración factible (API, BD solo lectura, batch) |
| H-05 | La adopción del SGAI por la universidad piloto generará interés formal en al menos 2 universidades adicionales del CEUB en el año 1 | Presentación del caso piloto en reunión CEUB Q1 2027 | ≥ 2 universidades solicitan información o demostración formal |
| H-06 | El 80 % de los docentes prefieren consultar sus boletas de pago en el sistema sobre el proceso actual (papel/presencial) | Encuesta a 50 docentes + prueba de acceso en MVP | ≥ 75 % expresan preferencia por el canal digital |

---

## 13. Riesgos de Mercado

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Baja adopción por resistencia cultural al cambio (docentes y administrativos acostumbrados al papel) | Media | Alto | Período de transición paralela (papel + digital) en el primer semestre; capacitaciones presenciales; tutoriales en video; campaña de comunicación institucional |
| La integración con sistemas legados resulta técnicamente inviable sin modificar los sistemas de origen | Alta | Alto | Sprint 0 de análisis técnico obligatorio antes de comprometer el alcance; diseño con adaptadores en modo degradado |
| Presupuesto institucional no aprobado o recortado | Media | Alto | Business case cuantificado presentado antes de Q3 2026; diseño de MVP modular y reducible |
| Competidor establece solución similar antes del go-live del SGAI | Baja | Medio | Aceleración del time-to-market con MVP en Q3 2026; comunicación del avance al sponsor mensualmente |
| Cambios regulatorios del CEUB que modifiquen los flujos de aprobación de oferta académica | Baja | Medio | Diseño de flujos de aprobación como configuración, no como código rígido; versionado de reglas de negocio |
| Las otras universidades del CEUB tienen sistemas legados tan diferentes que el costo de adaptación elimina la ventaja de precio | Media | Medio | Arquitectura con adaptadores desacoplados desde v1.0; análisis de sistemas en las 2–3 universidades objetivo antes de negociar |

---

## 14. Trazabilidad

| MRD ID | BRD ID | PRD ID |
|--------|--------|--------|
| MRD-N-01 | BR-001, BR-006, BR-007 | PRD-REQ-002, PRD-REQ-004, PRD-REQ-005 |
| MRD-N-02 | BR-002, BR-003 | PRD-REQ-003 |
| MRD-N-03 | BR-004 | PRD-REQ-007 |
| MRD-N-04 | BR-005, BR-009 | PRD-REQ-006, PRD-REQ-012 |
| MRD-N-05 | BR-010 | PRD-REQ-007 |
| MRD-N-06 | BR-012 | PRD-REQ-009 |
| MRD-N-07 | RB-04, RB-05 | PRD-NFR-004, PRD-NFR-005, PRD-NFR-007 |
| MRD-N-08 | BR-008 | PRD-REQ-011 |
| MRD-N-09 | BR-011 | PRD-NFR-008 |
| MRD-N-10 | BR-013 (implícito) | PRD-NFR-003 |

---

## 15. Anexos

- **Entrevistas con usuarios (resumen ejecutivo):** 15 entrevistas realizadas — 8 docentes, 4 administradores de facultad, 2 técnicos DPA, 1 director DPA. Hallazgo principal: 100 % de los entrevistados identificó la presencialidad obligatoria como el dolor más crítico. El 87 % afirmó que adoptaría un sistema digital si el flujo fuera simple (≤ 5 pasos para las tareas más frecuentes).
- **Benchmarks de mercado:** Ver tabla §6.1. Fuentes consultadas: sitio oficial SIU (siu.edu.ar), catálogos Ellucian 2025, MarketsandMarkets Higher Education ERP Market Report 2025 (estimación).
- **Análisis de Océano Azul:** Ver §7.2. Marco aplicado: Kim & Mauborgne — *Blue Ocean Strategy*, 2ª edición.

---

## 16. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v1.0 | 10/05/2026 | Equipo SGAI | Versión inicial del MRD — 4 personas, 8 JTBD, análisis competitivo completo, análisis de Océano Azul, 10 reqs. de mercado, 6 hipótesis |

---

## Checklist Mínimo

- [x] TAM/SAM/SOM con fuentes (§3.1).
- [x] ≥ 2 personas completas (4 personas — §4.2).
- [x] ≥ 3 JTBD (8 JTBD — §5).
- [x] ≥ 2 competidores en matriz (5 alternativas incluyendo do-nothing — §6.1).
- [x] Positioning statement en 1 frase (§6.2).
- [x] Análisis de Océano Azul con tabla Eliminar/Reducir/Aumentar/Crear (§7.2).
- [x] Pricing y go-to-market esbozados (§8 y §9).
- [x] North Star + 4 KPIs fechados (§10).
- [x] 10 requerimientos MRD-N-* priorizados (§11).
- [x] 6 hipótesis a validar con criterio de éxito (§12).
- [x] Trazabilidad a BRD y PRD completada (§14).
