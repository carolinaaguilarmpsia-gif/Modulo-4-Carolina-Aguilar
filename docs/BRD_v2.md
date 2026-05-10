# Business Requirements Document (BRD) — v2.0
# Sistema de Gestión Académica Integral (SGAI)

---

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| Producto | Sistema de Gestión Académica Integral (SGAI) |
| Grupo | G01 |
| Versión | **v2.0** |
| Fecha | 10/05/2026 |
| Sponsor de negocio | Dirección de Planificación Académica (DPA) |
| Stakeholders | Docentes, Administradores de Facultad, Técnicos DPA, Administrador de Sistema, Dirección Universitaria, Unidad de TI, Asesoría Legal |
| Autores | Equipo de Desarrollo SGAI |
| Revisores | Docente + Grupo Par |
| Estado | **En revisión** |
| Insumo BRD anterior | BRD_SGAI_v0.1 (02/05/2026) |
| Prompts utilizados | PR-BRD-001, PR-BRD-002 (ver PROMPT_MAPPINGS.md) |

> **Cambios respecto a v0.1:** Objetivos SMART ampliados con líneas base explícitas; análisis de stakeholders enriquecido con RACI completo; riesgos reclasificados con responsables; Business Model Canvas con elementos adicionales de sostenibilidad; sección de Continuous Discovery añadida; trazabilidad completa BRD → MRD → PRD → FSD.

---

## 1. Resumen Ejecutivo

**Problema:** Más de 1.500 docentes distribuidos en 15+ facultades de una universidad pública boliviana gestionan hoy su ciclo académico-administrativo íntegramente en papel y presencialmente. Los trámites de oferta académica demoran entre 5 y 15 días hábiles; las declaraciones juradas carecen de trazabilidad digital; y la información laboral (horarios, boletas de pago) solo es accesible mediante visitas físicas a la administración. El costo operativo estimado de esta ineficiencia supera las 800 horas-persona anuales solo en el DPA.

**Propuesta:** El SGAI es una plataforma web institucional que centraliza, digitaliza y automatiza el ciclo completo de gestión académico-administrativa docente: declaraciones juradas con flujo multinivel de aprobación, trámite de oferta académica entre facultades y DPA, consulta self-service de horarios y boletas de pago, y administración de perfiles y roles. Se integra con los sistemas de nómina y el sistema de información institucional existentes sin modificarlos.

**Valor esperado:**
- Reducción del ciclo de aprobación de oferta académica de 5–15 días a ≤ 2 días hábiles.
- 100 % de docentes activos con acceso self-service a información laboral sin trámite presencial.
- Ahorro operativo estimado de USD 62.000 en 3 años (VAN: +USD 12.400 al 10 %).

**Métricas clave de éxito:**
- **North Star (KPI-01):** Tiempo medio de aprobación de oferta académica ≤ 2 días hábiles — Q1 2027.
- **KPI-02:** Tasa de adopción digital de declaraciones juradas ≥ 90 % — Q1 2027.
- **KPI-03:** Satisfacción docente ≥ 4/5 (escala 1–5) — Q2 2027.

**Llamada a la acción:** Se requiere del sponsor la aprobación formal del presente BRD v2.0, la designación del equipo técnico, la apertura de acceso a APIs de nómina y sistema institucional, y la aprobación del presupuesto de desarrollo antes del **30 de junio de 2026**.

---

## 2. Contexto del Negocio

- **Organización:** Universidad pública boliviana — régimen CEUB (Comité Ejecutivo de la Universidad Boliviana).
- **Unidades impactadas:** Departamento de Planificación Académica (DPA), Administraciones de Facultad (15+), Cuerpo docente (1.500+ docentes activos), Unidad de TI.
- **Procesos de negocio afectados:**
  1. Gestión y validación de declaraciones juradas docentes.
  2. Planificación y aprobación de oferta académica semestral/anual.
  3. Administración de perfiles profesionales, CV y carga horaria docente.
  4. Distribución y consulta de información financiera (boletas de pago).
  5. Gestión de roles institucionales (autoridades, investigadores, administrativos).
  6. Generación de reportes de control para la Dirección Universitaria.
- **Estrategia organizacional vinculada:** Plan Estratégico Institucional 2024–2028 — Eje de Modernización y Digitalización; directrices del CEUB sobre transparencia y trazabilidad institucional; Ley N° 164 de Telecomunicaciones y TIC de Bolivia.

---

## 3. Problema y Oportunidad de Negocio

### 3.1 Problema

La institución opera con más de 1.500 docentes en 15+ facultades mediante flujos 100 % manuales y presenciales. El proceso de oferta académica —crítico para el inicio de cada semestre— exige que administradores de facultad compilen información en papel, la presenten físicamente al DPA, y aguarden revisión y devolución manual, con ciclos documentados de 5 a 15 días hábiles y tasas de observación (devolución por error) cercanas al 30 %. Las declaraciones juradas siguen el mismo patrón: entrega física, revisión sin trazabilidad y riesgo de edición post-aprobación sin registro. La información laboral y financiera (horarios, carga horaria, boletas de pago) solo es accesible mediante consultas directas a la administración, saturando los canales de atención.

**Impacto cuantificado:**
- Ciclo de aprobación: 5–15 días hábiles por trámite × 30+ trámites semestrales = hasta 450 días-hábiles de retraso acumulado por semestre.
- Errores y re-trabajo: ~30 % de observaciones implican re-presentación física y ciclo adicional de 3–5 días.
- Carga del DPA: estimado de 800+ horas-persona anuales en gestión manual de documentación.
- Consecuencia de no actuar: deterioro de la planificación académica, incremento de errores, insatisfacción docente e incumplimiento de plazos normativos del CEUB.

### 3.2 Oportunidad

- **Valor operativo:** Eliminar 5–13 días hábiles por trámite en 15 facultades × 2 semestres equivale a recuperar 800+ horas-persona anuales en DPA y administraciones.
- **Valor estratégico:** Posicionar a la universidad como institución digitalmente moderna, cumplir exigencias de transparencia y trazabilidad del marco CEUB y Ley 164.
- **Ventana de oportunidad:** Proyecto *greenfield* sin deuda técnica heredada. El plazo de 6–12 meses permite tener el sistema operativo antes del ciclo académico 2027. Posibilidad de licenciar el sistema a otras universidades del CEUB como fuente adicional de valor institucional.

### 3.3 Evidencia de Continuous Discovery

| Aspecto | Detalle |
|---------|---------|
| Entrevistas realizadas | 8 entrevistas con docentes, 4 con administradores de facultad, 2 con técnicos DPA |
| Hipótesis validada | "Los docentes prefieren gestión digital completa sobre proceso híbrido" — confirmada en 9/10 entrevistados |
| Hipótesis en validación | "El DPA puede procesar trámites en ≤ 2 días si el sistema provee flujo digital" |
| Artefactos M2 (UI/UX) | Wireframes de flujo DJ, mockup panel docente, user journey oferta académica |
| Próxima cadencia | Quincenal durante desarrollo (validación de prototipos con usuarios reales) |

---

## 4. Usuarios Objetivo / Personas Clave

### 4.1 Persona Principal — Docente

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Docente universitario (titular, interino, investigador) — 1.500+ usuarios |
| Contexto | Trabaja en una o más facultades; hoy debe apersonarse físicamente para cualquier trámite o consulta |
| Jobs-to-be-done | 1. Enviar y rastrear su declaración jurada; 2. Consultar su carga horaria y horarios; 3. Acceder a sus boletas de pago; 4. Mantener actualizado su CV/perfil; 5. Consultar el calendario académico vigente |
| Dolores principales | Desplazamientos físicos innecesarios; desconocimiento del estado de sus trámites; información dispersa en múltiples oficinas; riesgo de pérdida de documentos |
| Ganancia esperada | Gestión completa de su vida académico-administrativa desde cualquier dispositivo con navegador, sin filas ni presencia física |

### 4.2 Persona Secundaria — Administrador de Facultad

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Administrador / Secretario académico de facultad — 15+ usuarios |
| Contexto | Coordinador de la planificación académica; intermediario entre docentes y DPA |
| Jobs-to-be-done | 1. Compilar y enviar oferta académica digital; 2. Revisar y validar declaraciones juradas; 3. Publicar calendarios académicos; 4. Gestionar roles docentes |
| Dolores principales | Recopilación manual de información; falta de visibilidad del estado de trámites en el DPA; coordinación por correo y teléfono |
| Ganancia esperada | Flujo digital con trazabilidad en tiempo real; panel centralizado de gestión; reducción de re-trabajo |

### 4.3 Persona Terciaria — Técnico DPA

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Técnico del Departamento de Planificación Académica — 3–5 usuarios |
| Contexto | Revisa y aprueba la planificación académica institucional; genera reportes de control |
| Jobs-to-be-done | 1. Revisar documentación técnica de oferta académica; 2. Aprobar u observar trámites; 3. Generar reportes consolidados |
| Dolores principales | Volumen de documentos en papel; imposibilidad de generar métricas; tiempos de procesamiento largos |
| Ganancia esperada | Bandeja digital de trámites con historial, notificaciones automáticas y reportes generados por el sistema |

### 4.4 Persona Soporte — Administrador del Sistema

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Administrador técnico del sistema — 1–2 usuarios (Unidad de TI) |
| Contexto | Responsable de la integridad del sistema, los accesos y la estructura base |
| Jobs-to-be-done | 1. Crear y gestionar cuentas de usuario; 2. Configurar materias y cargas horarias; 3. Administrar roles y permisos |
| Dolores principales | Ausencia de herramientas centralizadas de administración; gestión manual de accesos |
| Ganancia esperada | Panel de administración completo con auditoría de accesos y configuración sin acceso directo a base de datos |

---

## 5. Propuesta de Valor

| Eje | Contenido |
|-----|-----------|
| **Para quién** | Docentes, administradores de facultad, técnicos DPA y administradores de una universidad pública boliviana con 1.500+ docentes y 15+ facultades |
| **Que necesita** | Gestionar el ciclo académico-administrativo completo (declaraciones juradas, oferta académica, información laboral) de forma ágil, trazable y sin presencia física |
| **Nuestra propuesta es** | Una plataforma web centralizada que digitaliza y automatiza los flujos de gestión académica y administrativa docente, integrada con los sistemas de nómina e información institucional existentes |
| **Que le aporta** | 1. Eliminación de trámites presenciales y en papel; 2. Trazabilidad en tiempo real del estado de cada trámite; 3. Acceso self-service a información laboral y financiera; 4. Reducción del ciclo de aprobación de 5–15 días a ≤ 2 días; 5. Cumplimiento normativo embebido en reglas de negocio |
| **A diferencia de** | Proceso actual: papel, correo electrónico, desplazamientos físicos y coordinación telefónica sin trazabilidad ni fuente única de verdad |
| **Nuestro diferencial es** | Diseño específico para el contexto universitario boliviano (normativa CEUB, Ley 164), flujo de aprobación multinivel configurable, e integración nativa con sistemas legados sin modificarlos |

---

## 6. Panorama Competitivo (Resumen)

| Competidor / alternativa | Tipo | Fortaleza percibida | Debilidad percibida |
|--------------------------|------|---------------------|---------------------|
| Proceso actual (papel + correo + presencia) | Do-nothing | Culturalmente aceptado; sin costo inmediato | Sin trazabilidad; 5–15 días de ciclo; propenso a pérdida de documentos |
| SIU-Guaraní (Argentina) | Directo | Maduro, probado en universidades latinoamericanas | No adaptado a normativa boliviana; costo de licencia y localización elevado |
| Google Workspace (Forms + Drive + Sheets) | Indirecto | Bajo costo, familiar para usuarios | Sin flujo de aprobación formal; sin integración con nómina; sin reglas de negocio institucionales |
| ERP universitario genérico (Ellucian, Banner) | Directo | Funcionalidad amplia, soporte empresarial | Costo prohibitivo para universidad pública; exceso de funcionalidad no requerida |

---

## 7. Business Model Canvas

| Bloque | Mínimo 3 elementos concretos |
|--------|-------------------------------|
| **1. Segmentos de clientes** | Docentes universitarios (1.500+) / Administradores de facultad (15+ unidades) / Técnicos y autoridades del DPA / Otras universidades del sistema CEUB (mercado potencial) |
| **2. Propuesta de valor** | Digitalización completa del ciclo académico-administrativo docente / Trazabilidad y flujo de aprobación multinivel / Eliminación de trámites presenciales y reducción del ciclo a ≤ 2 días |
| **3. Canales** | Plataforma web responsive (cualquier navegador/dispositivo) / Notificaciones por correo electrónico institucional / Capacitaciones presenciales y tutoriales en línea |
| **4. Relación con clientes** | Autogestión (self-service) vía portal web / Soporte técnico a través de la Unidad de TI / Acompañamiento durante onboarding con guías y videos |
| **5. Fuentes de ingresos** | Presupuesto institucional universitario (modelo de costo compartido) / Posible licenciamiento a otras universidades CEUB / Ahorro operativo como retorno indirecto (800+ horas-persona/año) |
| **6. Recursos clave** | Equipo de desarrollo de software / Infraestructura de servidores universitarios / APIs de sistemas legados (nómina, sistema institucional) / Reglamento interno y normativa CEUB |
| **7. Actividades clave** | Desarrollo e implementación del sistema / Integración con sistemas de nómina y ERP institucional / Capacitación y gestión del cambio / Mantenimiento y soporte continuo |
| **8. Socios clave** | Unidad de TI de la universidad (infraestructura y soporte) / Proveedores de sistemas legados (APIs de integración) / DPA como sponsor operativo / CEUB (validación normativa institucional) |
| **9. Estructura de costos** | Desarrollo de software CAPEX (horas de ingeniería, estimado USD 45.000) / Infraestructura hosting OPEX (USD 6.000/año) / Capacitación y gestión del cambio (incluida en CAPEX) / Mantenimiento y soporte técnico post-lanzamiento |

---

## 8. Métricas Clave de Éxito (North Star + Apoyo)

| ID | KPI | North Star? | Línea base | Meta | Horizonte | Fuente del dato |
|----|-----|-------------|------------|------|-----------|-----------------|
| KPI-01 | Tiempo medio de aprobación de oferta académica (días hábiles) | **Sí** | 5–15 días hábiles | ≤ 2 días hábiles | Q1 2027 | Logs del sistema SGAI |
| KPI-02 | Tasa de adopción digital de declaraciones juradas (% procesadas digitalmente) | No | 0 % (papel) | ≥ 90 % | Q1 2027 | Registros SGAI |
| KPI-03 | Satisfacción del docente con el sistema (escala 1–5) | No | Por medir antes del lanzamiento | ≥ 4/5 | Q2 2027 | Encuesta semestral |
| KPI-04 | % de docentes que consultan boletas/horarios sin trámite presencial | No | 0 % | 100 % | Q2 2027 | Logs de acceso SGAI |
| KPI-05 | Reducción de horas-persona DPA en gestión manual de oferta académica | No | ~800 h/año (estimado) | Reducción ≥ 60 % | Q2 2027 | Registro de tiempos DPA |

---

## 9. Objetivos de Negocio (SMART)

| ID | Objetivo | Métrica | Línea base | Meta | Horizonte |
|----|----------|---------|------------|------|-----------|
| BO-01 | Reducir el tiempo de aprobación del trámite de oferta académica mediante digitalización del flujo multinivel | Días hábiles promedio por trámite | 5–15 días | ≤ 2 días hábiles | Q1 2027 |
| BO-02 | Eliminar la presencialidad en la gestión de declaraciones juradas, migrar al 100 % al canal digital | % de DJ gestionadas digitalmente | 0 % | 100 % | Q1 2027 |
| BO-03 | Garantizar acceso self-service a información laboral para el 100 % de los docentes activos | % de docentes con acceso sin trámite presencial | 0 % | 100 % | Q2 2027 |
| BO-04 | Reducir la carga administrativa del DPA en la gestión de oferta académica en al menos 60 % | Horas-persona mensuales en revisión manual | ~67 h/mes (estimado) | ≤ 27 h/mes | Q2 2027 |
| BO-05 | Garantizar la integridad y trazabilidad de toda la documentación académica generada en el sistema | % de documentos con historial de cambios auditable | 0 % | 100 % | Q1 2027 |

---

## 10. Stakeholders y Roles (Modelo RACI)

| Stakeholder | Interés | RACI | Descripción del rol |
|-------------|---------|------|---------------------|
| Director DPA (Sponsor) | Estratégico: modernización y eficiencia institucional | **A** | Aprueba el proyecto, el presupuesto y los entregables clave |
| Técnicos DPA | Operativo: revisión y aprobación de trámites | **R** | Ejecutan la revisión y aprobación de oferta académica |
| Administradores de Facultad | Operativo: planificación académica | **R** | Gestionan la oferta académica y validan DJ de sus docentes |
| Docentes | Experiencia: autogestión de información laboral | **C** | Usuarios finales; participan en validaciones y encuestas |
| Unidad de TI | Técnico: infraestructura, seguridad y soporte | **R** | Provisión de infraestructura, seguridad y soporte técnico |
| Equipo de Desarrollo | Técnico: construcción del sistema | **R** | Diseña, desarrolla y despliega el SGAI |
| Dirección Universitaria | Estratégico: alineación con plan institucional | **I** | Informada de avances y resultados |
| Unidad Legal / Asesoría Jurídica | Cumplimiento: normativa CEUB y Ley 164 | **C** | Valida reglas de negocio y cumplimiento legal |
| Proveedores sistemas legados | Técnico: APIs de integración | **C** | Proveen documentación técnica para integración |
| Administrador del Sistema | Técnico: gestión de accesos y configuración | **R** | Opera la administración del sistema en producción |

---

## 11. Requerimientos de Negocio

| ID | Requerimiento de negocio | Prioridad (MoSCoW) | Justificación | Métrica de aceptación |
|----|--------------------------|--------------------|-|-|
| BR-001 | El docente debe poder crear, enviar y hacer seguimiento a sus declaraciones juradas sin presencia física | Must | Elimina el principal cuello de botella presencial | ≥ 90 % de DJ procesadas digitalmente en el primer semestre |
| BR-002 | El administrador de facultad debe poder enviar el trámite de oferta académica de forma digital al DPA | Must | Digitaliza el proceso de mayor impacto | 100 % de trámites de oferta enviados digitalmente |
| BR-003 | El técnico DPA debe poder aprobar, observar y devolver trámites con trazabilidad completa | Must | Garantiza auditoría y elimina re-trabajo sin registro | 100 % de decisiones del DPA registradas en el sistema |
| BR-004 | El docente debe poder consultar su carga horaria, horarios de clase y calendario académico en línea | Must | Elimina consultas presenciales a administración | 100 % de docentes activos con acceso self-service |
| BR-005 | El docente debe poder acceder a sus boletas de pago desde el sistema | Must | Cubre la necesidad de información financiera sin trámite | 100 % de boletas disponibles digitalmente |
| BR-006 | El sistema debe impedir la edición de DJ aprobadas o en revisión, salvo devolución por observación | Must | Cumple reglamento interno; garantiza integridad documental | 0 ediciones no autorizadas en auditoría |
| BR-007 | Solo docentes con vinculación activa pueden generar declaraciones juradas | Must | Regla del reglamento interno | 0 excepciones detectadas en auditoría |
| BR-008 | El administrador de facultad debe gestionar el estado y roles de sus docentes (autoridad, investigador, administrativo) | Must | Refleja la estructura organizacional de la universidad | 100 % de roles configurables sin intervención del Administrador de sistema |
| BR-009 | El sistema debe integrarse con el sistema de nómina para mostrar boletas de pago actualizadas | Must | Fuente única de verdad para información financiera | Boletas sincronizadas en ≤ 24 h desde la liquidación |
| BR-010 | El sistema debe integrarse con el sistema institucional para sincronizar materias, carreras y carga horaria | Must | Evita duplicación de datos y errores de consistencia | 0 inconsistencias entre SGAI y sistema institucional en auditoría mensual |
| BR-011 | El administrador del sistema debe poder crear cuentas, configurar materias y gestionar roles y permisos | Must | Requisito de operación y seguridad del sistema | Gestión de accesos centralizada, 100 % sin acceso directo a BD |
| BR-012 | El técnico DPA debe poder generar reportes consolidados de la gestión académica | Should | Herramienta de control y toma de decisiones institucional | ≥ 3 tipos de reporte exportables (PDF/Excel) en el lanzamiento |
| BR-013 | El docente debe poder actualizar su CV / perfil profesional en el sistema | Should | Centraliza la información profesional docente | 100 % de docentes con perfil actualizable |
| BR-014 | El sistema debe enviar notificaciones automáticas ante cambios de estado de trámites | Should | Reduce seguimiento manual y mejora la experiencia | 100 % de cambios de estado notificados por correo |

---

## 12. Reglas de Negocio y Políticas

| ID | Regla | Tipo | Origen |
|----|-------|------|--------|
| RB-01 | Solo los docentes con vinculación activa pueden generar declaraciones juradas | Política | Reglamento interno universitario |
| RB-02 | Todo trámite de oferta académica debe ser revisado y validado por la Administración de Facultad antes de pasar al técnico DPA | Política | Reglamento interno universitario |
| RB-03 | Las declaraciones juradas aprobadas o en proceso de revisión no pueden editarse, salvo que sean devueltas con observaciones | Política | Reglamento interno universitario |
| RB-04 | El sistema debe cumplir la Ley N° 164 de Telecomunicaciones y TIC de Bolivia (protección de datos, seguridad informática) | Normativa | Ley 164 – Estado Plurinacional de Bolivia |
| RB-05 | La planificación académica debe respetar plazos y formatos del CEUB | Normativa | Disposiciones CEUB |
| RB-06 | El acceso a boletas de pago está restringido a cada docente para sus propios datos; los administradores de facultad no tienen acceso a boletas individuales | Política | Reglamento interno / Privacidad laboral |
| RB-07 | Los roles Autoridad e Investigador solo pueden ser asignados por el Administrador de Facultad de la unidad correspondiente | Política | Reglamento interno universitario |

---

## 13. Supuestos, Restricciones y Dependencias

**Supuestos:**
- Los docentes cuentan con acceso a internet (móvil o fijo) y un navegador web moderno.
- Los sistemas de nómina y el sistema institucional exponen o pueden exponer APIs o mecanismos de integración documentados.
- La Dirección Universitaria aprobará el financiamiento del proyecto dentro del ciclo presupuestario 2026.
- La Unidad de TI proveerá infraestructura de servidores y soporte para el despliegue del sistema.
- Los usuarios aceptarán recibir capacitación y acompañamiento durante el período de transición.

**Restricciones:**
- El sistema debe cumplir la Ley N° 164 de Bolivia y las disposiciones normativas del CEUB.
- Plazo de entrega en producción: 6 a 12 meses desde la aprobación del BRD.
- El presupuesto formal debe aprobarse antes del 30 de junio de 2026.
- El sistema debe ser accesible exclusivamente vía navegador web (sin app nativa en esta fase).
- Los sistemas de nómina y el sistema institucional son legados que no pueden modificarse; el SGAI se adapta a sus interfaces existentes.

**Dependencias:**
- Acceso técnico y documentación de APIs del sistema de nómina (boletas de pago).
- Acceso técnico y documentación del sistema institucional (materias, carreras, carga horaria).
- Aprobación del reglamento interno por la Unidad Legal para validar reglas de negocio embebidas.
- Disponibilidad de la Unidad de TI para provisión de entorno de desarrollo, staging y producción.

---

## 14. Alcance de Negocio

### 14.1 En Alcance
- Gestión digital del ciclo de vida de declaraciones juradas (creación, envío, revisión, aprobación, observación, devolución).
- Trámite digital de oferta académica: desde la facultad hasta la aprobación del DPA.
- Gestión de perfiles y CV de docentes.
- Consulta de carga horaria, horarios de clase y calendario académico.
- Acceso a boletas de pago (integración con sistema de nómina).
- Administración de roles y estados de docentes (autoridad, investigador, administrativo).
- Generación de reportes consolidados para el DPA.
- Integración con sistema de nómina y sistema de información institucional.
- Administración de usuarios, materias y permisos por el Administrador del sistema.
- Notificaciones automáticas por correo electrónico institucional.

### 14.2 Fuera de Alcance
- Gestión financiera o contable de la universidad (pertenece al sistema de nómina/ERP institucional).
- Matrícula y gestión de estudiantes (módulo institucional separado).
- Aplicación móvil nativa (iOS/Android) — evaluación en fases posteriores.
- Módulo de videoconferencia o LMS (Learning Management System).
- Gestión de procesos de contratación o concurso de méritos docentes.

---

## 15. Beneficios Esperados y Business Case Resumido

> Cifras estimadas conservadoras basadas en benchmarks de digitalización en universidades públicas latinoamericanas y volumen institucional declarado.

| Tipo | Año 1 | Año 2 | Año 3 |
|------|-------|-------|-------|
| Ahorro operativo (reducción horas-persona DPA + facultades) | USD 18.000 | USD 22.000 | USD 22.000 |
| Valor por eliminación de errores y re-trabajo | USD 5.000 | USD 8.000 | USD 8.000 |
| Inversión CAPEX (desarrollo + integración) | USD 45.000 | — | — |
| Costo OPEX (hosting + mantenimiento + soporte) | USD 6.000 | USD 6.000 | USD 6.000 |
| **Flujo neto del año** | **–USD 28.000** | **+USD 24.000** | **+USD 24.000** |
| **VAN estimado (3 años, 10 % descuento)** | **+USD 12.400** | | |
| **TIR estimada** | **~22 %** | | |
| **Payback estimado** | **~20 meses** | | |

---

## 16. Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|--------|--------------|---------|------------|-------------|
| Integración con sistemas legados falla o se retrasa | Alta | Alto | Levantar documentación técnica en Sprint 0; definir contrato de integración formal; diseñar módulos desacoplados que operen parcialmente sin integración | Líder técnico + Unidad de TI |
| Resistencia al cambio de docentes y administradores | Media | Alto | Plan de gestión del cambio con capacitaciones presenciales y tutoriales; período de transición paralela (papel + digital) en el primer semestre | PM + DPA |
| Presupuesto no aprobado o reducido significativamente | Media | Alto | Presentar Business Case cuantificado antes de Q3 2026; diseñar MVP modular y reducible | Sponsor + PM |
| Incumplimiento del plazo de 6–12 meses | Media | Medio | Definir MVP mínimo viable desde el inicio; metodología ágil con entregables incrementales; revisión de alcance mensual | PM |
| Brechas de seguridad o incumplimiento Ley 164 | Baja | Alto | Auditoría de seguridad en fase de diseño; revisión legal antes del lanzamiento; autenticación con credenciales institucionales | Unidad de TI + Asesoría Legal |
| Datos inconsistentes en sistemas legados no documentados | Media | Medio | Sprint 0 de análisis de datos con la Unidad de TI; definir estrategia de limpieza y migración inicial | Líder técnico |

---

## 17. Criterios de Éxito del Proyecto de Negocio

- Cumplimiento de ≥ 80 % de los objetivos SMART definidos en la sección 9 al cierre del primer año de operación.
- Tiempo de aprobación de oferta académica reducido a ≤ 2 días hábiles en el primer semestre de uso.
- 100 % de declaraciones juradas gestionadas digitalmente al segundo semestre de operación.
- Satisfacción del docente ≥ 4/5 en encuesta semestral post-lanzamiento.
- Sistema operando sin incidentes críticos de seguridad durante los primeros 12 meses.
- Business case positivo (flujo neto acumulado positivo) al cierre del Año 2.

---

## 18. Trazabilidad a Documentos Hijos

| BRD ID | MRD relacionado | PRD relacionado | Caso de uso FSD |
|--------|-----------------|-----------------|-----------------|
| BR-001 | MRD-N-01 | PRD-REQ-01 | FSD-UC-001 (Gestión DJ) |
| BR-002 | MRD-N-02 | PRD-REQ-02 | FSD-UC-002 (Oferta Académica) |
| BR-003 | MRD-N-02 | PRD-REQ-03 | FSD-UC-003 (Aprobación DPA) |
| BR-004 | MRD-N-03 | PRD-REQ-04 | FSD-UC-004 (Consulta horarios) |
| BR-005 | MRD-N-04 | PRD-REQ-05 | FSD-UC-005 (Boletas de pago) |
| BR-006 | MRD-N-01 | PRD-REQ-06 | FSD-UC-001 (regla de integridad DJ) |
| BR-009 | MRD-N-04 | PRD-REQ-07 | FSD-UC-006 (Integración nómina) |
| BR-010 | MRD-N-05 | PRD-REQ-08 | FSD-UC-007 (Integración ERP institucional) |
| BR-012 | MRD-N-06 | PRD-REQ-09 | FSD-UC-008 (Reportes DPA) |

---

## 19. Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Sponsor (Director DPA) | | | |
| PM del Proyecto | | | |
| Líder Técnico / Arquitecto | | | |
| Asesoría Legal | | | |

---

## 20. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v0.1 | 02/05/2026 | Equipo SGAI | Versión inicial del BRD |
| v2.0 | 10/05/2026 | Equipo SGAI | Refinamiento estratégico: objetivos SMART con líneas base, RACI ampliado, riesgos con responsables, trazabilidad completa, BR-013 y BR-014 añadidos, KPI-05 añadido, sección Continuous Discovery añadida |

---

## Checklist de Entrega

- [x] Resumen ejecutivo con problema, propuesta, valor y métricas.
- [x] Problema de negocio con evidencia cuantitativa.
- [x] 4 personas / usuarios objetivo caracterizadas (JTBD, dolores, ganancias).
- [x] Propuesta de valor explícita (formato VPC).
- [x] Panorama competitivo con ≥ 3 alternativas (incluyendo do-nothing).
- [x] Business Model Canvas con los 9 bloques poblados, ≥ 3 elementos por bloque.
- [x] Métricas clave de éxito: 1 North Star + 4 KPIs de apoyo, con meta y horizonte.
- [x] ≥ 5 objetivos de negocio SMART con líneas base explícitas.
- [x] Matriz RACI completa (10 stakeholders).
- [x] 14 requerimientos de negocio priorizados (MoSCoW).
- [x] Reglas, restricciones, supuestos y dependencias explícitos.
- [x] Business case cuantitativo con VAN, TIR y payback.
- [x] Trazabilidad a MRD/PRD/FSD iniciada.
- [x] Sección Continuous Discovery con evidencia de entrevistas.
