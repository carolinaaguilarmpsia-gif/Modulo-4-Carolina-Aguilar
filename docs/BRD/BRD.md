# Business Requirements Document (BRD)
# Sistema de Gestión Académica Integral (SGAI)

---

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| Producto | Sistema de Gestión Académica Integral (SGAI) |
| Grupo | G01 |
| Versión | v0.1 |
| Fecha | 02/05/2026 |
| Sponsor de negocio | Dirección de Planificación Académica (DPA) |
| Stakeholders | Docentes, Administradores de Facultad, Técnicos DPA, Administradores de Sistema, Dirección Universitaria, Unidad de TI |
| Autores | Equipo de Desarrollo SGAI |
| Revisores | Docente + 1 grupo par |
| Estado | Borrador |

---

## 1. Resumen Ejecutivo

**Problema:** La universidad pública gestiona actualmente más de 1.500 docentes y más de 15 facultades mediante procesos 100% presenciales y en papel: las declaraciones juradas, la oferta académica y la consulta de información laboral requieren desplazamiento físico, firmas manuales y coordinación por correo electrónico, generando ciclos de aprobación de entre 5 y 15 días hábiles por trámite, acumulación de errores por falta de trazabilidad y una carga administrativa insostenible sobre los técnicos del Departamento de Planificación Académica (DPA).

**Propuesta:** Desarrollar el SGAI, una plataforma web centralizada que digitalice y automatice el ciclo de vida académico-administrativo del docente: gestión de perfil y CV, declaraciones juradas con flujo de aprobación digital, oferta académica semestral/anual entre facultades y DPA, consulta de carga horaria y boletas de pago, integrada con los sistemas de nómina y el sistema de información institucional existentes.

**Valor esperado:**
- Reducción del tiempo de aprobación de oferta académica de 5–15 días hábiles a ≤ 2 días hábiles.
- 100 % de los docentes con acceso self-service a su información laboral y académica sin trámite presencial.
- Reducción estimada de 60 % en horas-persona dedicadas a gestión administrativa manual en el DPA.

**Métricas clave de éxito:**
- KPI-01 (North Star): Tiempo medio de aprobación de oferta académica ≤ 2 días hábiles — horizonte Q1 2027.
- KPI-02: Tasa de adopción digital de declaraciones juradas ≥ 90 % — horizonte Q1 2027.
- KPI-03: Satisfacción del docente con el sistema ≥ 4/5 — horizonte Q2 2027.

**Llamada a la acción:** Se requiere del sponsor la aprobación formal del presente BRD, la designación del equipo técnico de desarrollo, la apertura de acceso a los sistemas de nómina y sistema institucional para el análisis de integración, y la definición del presupuesto de proyecto antes del 30 de junio de 2026.

---

## 2. Contexto del Negocio

- **Organización:** Universidad pública boliviana (institución de educación superior autónoma, régimen CEUB).
- **Unidad impactada:** Departamento de Planificación Académica (DPA), Administraciones de Facultad, cuerpo docente institucional.
- **Procesos de negocio afectados:**
  - Gestión y validación de declaraciones juradas docentes.
  - Planificación y aprobación de oferta académica semestral/anual.
  - Administración de perfiles, CV y carga horaria docente.
  - Consulta y distribución de información financiera (boletas de pago).
  - Gestión de roles institucionales (autoridades, investigadores, administrativos).
- **Estrategia organizacional vinculada:** Modernización y digitalización de la gestión universitaria; reducción de burocracia presencial; mejora de la transparencia y trazabilidad institucional alineada al Plan Estratégico Institucional y a las directrices del Comité Ejecutivo de la Universidad Boliviana (CEUB).

---

## 3. Problema y Oportunidad de Negocio

### 3.1 Problema

La universidad gestiona más de 1.500 docentes distribuidos en más de 15 facultades mediante procesos enteramente manuales y presenciales. El proceso más crítico —el trámite de oferta académica— exige que los administradores de facultad recopilen información en papel, la presenten físicamente ante el DPA, y aguarden revisión y devolución manual, generando ciclos de 5 a 15 días hábiles por semestre, con alta probabilidad de pérdida de documentos, observaciones repetidas y re-trabajo.

Las declaraciones juradas, obligatorias para todos los docentes con vinculación activa, siguen el mismo patrón: entrega presencial, revisión sin trazabilidad digital y riesgo de edición no autorizada post-aprobación. La información laboral y financiera (horarios, carga horaria, boletas de pago) solo es accesible a través de consultas directas a la administración, saturando los canales de atención.

La consecuencia de no actuar es el deterioro progresivo de la calidad de la planificación académica, el incremento de errores administrativos, la insatisfacción docente y el riesgo de incumplimiento de plazos normativos ante el CEUB y el reglamento interno universitario.

### 3.2 Oportunidad

- **Valor operativo:** Eliminar entre 5 y 13 días hábiles por trámite de oferta académica equivale, en una institución con más de 15 facultades y 2 semestres por año, a recuperar cientos de horas-persona anuales en el DPA y las administraciones de facultad.
- **Valor estratégico:** Posicionar a la universidad como institución digitalmente moderna, mejorar la experiencia docente y cumplir con las exigencias de transparencia y trazabilidad del marco normativo boliviano (Ley 164 de Telecomunicaciones y TIC, disposiciones CEUB).
- **Ventana de oportunidad:** La ausencia de un sistema previo representa una oportunidad de diseño limpio (greenfield), sin deuda técnica heredada. El plazo de 6 a 12 meses permite tener el sistema operativo antes del inicio del ciclo académico 2027.

---

## 4. Usuarios Objetivo / Personas Clave

### 4.1 Persona Principal — Docente

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Docente universitario (titular, interino, investigador) |
| Contexto | Trabaja en una o más facultades; actualmente debe apersonarse físicamente al DPA o a la administración de facultad para cualquier trámite o consulta |
| Jobs-to-be-done | 1. Enviar y hacer seguimiento a su declaración jurada; 2. Consultar su carga horaria y horarios asignados; 3. Acceder a sus boletas de pago; 4. Mantener actualizado su CV/perfil profesional; 5. Conocer el calendario académico vigente |
| Dolores principales | Desplazamientos físicos innecesarios; desconocimiento del estado de sus trámites; información dispersa en múltiples oficinas; riesgo de perder documentos en papel |
| Ganancia esperada | Gestión completa de su vida académico-administrativa desde cualquier dispositivo con navegador, sin filas ni presencia física |

### 4.2 Persona Secundaria — Administrador de Facultad

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Administrador / Secretario académico de facultad |
| Contexto | Coordina la planificación académica de su facultad y es el intermediario entre docentes y DPA |
| Jobs-to-be-done | 1. Compilar y enviar el trámite de oferta académica; 2. Revisar y validar declaraciones juradas de docentes de su facultad; 3. Cargar y publicar el calendario académico; 4. Gestionar estados y roles de docentes (autoridades, investigadores) |
| Dolores principales | Recopilación manual de información de múltiples docentes; falta de visibilidad del estado de los trámites enviados al DPA; coordinación por correo y llamadas telefónicas |
| Ganancia esperada | Flujo digital de aprobación con trazabilidad en tiempo real; reducción de re-trabajo por observaciones; panel centralizado de gestión de su facultad |

### 4.3 Persona Terciaria — Técnico DPA

| Atributo | Valor |
|----------|-------|
| Nombre / rol | Técnico del Departamento de Planificación Académica |
| Contexto | Revisa y aprueba la planificación académica a nivel institucional; genera reportes de control para las autoridades universitarias |
| Jobs-to-be-done | 1. Revisar documentación técnica de trámites de oferta académica; 2. Aprobar u observar trámites para corrección; 3. Generar reportes consolidados |
| Dolores principales | Volumen de documentos en papel; imposibilidad de generar métricas; tiempos de procesamiento largos por revisión secuencial manual |
| Ganancia esperada | Bandeja digital de trámites con historial, notificaciones y generación automática de reportes |

---

## 5. Propuesta de Valor

| Eje | Contenido |
|-----|-----------|
| **Para quién** | Docentes, administradores de facultad y técnicos DPA de una universidad pública boliviana con más de 1.500 docentes y más de 15 facultades |
| **Que necesita** | Gestionar el ciclo académico-administrativo completo (declaraciones juradas, oferta académica, información laboral) de forma ágil, trazable y sin presencia física |
| **Nuestra propuesta es** | Una plataforma web centralizada que digitaliza y automatiza los flujos de gestión académica y administrativa docente, integrada con los sistemas de nómina e información institucional existentes |
| **Que le aporta** | 1. Eliminación de trámites presenciales y en papel; 2. Trazabilidad en tiempo real del estado de cada trámite; 3. Acceso self-service a información laboral y financiera; 4. Reducción del ciclo de aprobación de oferta académica de hasta 13 días; 5. Cumplimiento normativo automático (reglas de negocio embebidas) |
| **A diferencia de** | El proceso actual: papel, correo electrónico, desplazamientos físicos y coordinación telefónica sin trazabilidad ni fuente única de verdad |
| **Nuestro diferencial es** | Diseño específico para el contexto universitario boliviano (normativa CEUB, reglamento interno), flujo de aprobación multinivel configurable e integración nativa con sistemas legados de nómina y gestión institucional |

---

## 6. Panorama Competitivo (Resumen)

| Competidor / alternativa | Tipo | Fortaleza percibida | Debilidad percibida |
|--------------------------|------|---------------------|---------------------|
| Proceso actual (papel + correo + presencia física) | Do-nothing | Conocido y aceptado culturalmente | Sin trazabilidad, lento (5–15 días), propenso a pérdida de documentos |
| SIU-Guaraní (sistema argentino) | Directo | Maduro, probado en universidades públicas latinoamericanas | No adaptado a normativa boliviana; costo de licencia y localización elevado |
| Google Workspace (Forms + Drive + Sheets) | Indirecto | Bajo costo, familiar para usuarios | No es un sistema de gestión; sin flujo de aprobación formal ni integración con nómina |
| ERP universitario genérico (ej. Ellucian, Banner) | Directo | Funcionalidad amplia, soporte empresarial | Costo prohibitivo para universidad pública; exceso de funcionalidad no requerida |

---

## 7. Business Model Canvas

| Bloque | Elementos concretos |
|--------|---------------------|
| **1. Segmentos de clientes** | Docentes universitarios (>1.500) / Administradores de facultad (>15 unidades) / Técnicos y autoridades del DPA |
| **2. Propuesta de valor** | Digitalización completa del ciclo académico-administrativo docente / Trazabilidad y flujo de aprobación multinivel / Eliminación de trámites presenciales y reducción de ciclos de 5–15 días a ≤ 2 días |
| **3. Canales** | Plataforma web responsive (navegador, cualquier dispositivo) / Notificaciones por correo electrónico institucional / Portal de anuncios y calendario académico digital |
| **4. Relación con clientes** | Autogestión (self-service) vía portal web / Soporte técnico a través de la Unidad de TI universitaria / Capacitaciones presenciales y tutoriales en línea durante el onboarding |
| **5. Fuentes de ingresos** | Financiamiento con presupuesto institucional universitario / Posible modelo de licenciamiento a otras universidades públicas del sistema CEUB / Ahorro operativo como retorno indirecto (reducción de horas-persona en DPA y facultades) |
| **6. Recursos clave** | Equipo de desarrollo de software / Infraestructura de servidores universitarios / Acceso a sistemas de nómina y sistema de información institucional / Reglamento interno y normativa CEUB como base de reglas de negocio |
| **7. Actividades clave** | Desarrollo e implementación del sistema / Integración con sistemas de nómina y ERP institucional / Capacitación y gestión del cambio / Mantenimiento, soporte y actualización continua |
| **8. Socios clave** | Unidad de TI de la universidad (infraestructura y soporte) / Proveedores de los sistemas de nómina y sistema institucional (APIs de integración) / DPA como sponsor operativo / CEUB (normativa y validación institucional) |
| **9. Estructura de costos** | Desarrollo de software (CAPEX: horas de ingeniería) / Infraestructura de hosting en servidores universitarios (OPEX) / Capacitación y gestión del cambio / Mantenimiento y soporte técnico post-lanzamiento |

---

## 8. Métricas Clave de Éxito

| ID | KPI | North Star? | Línea base | Meta | Horizonte | Fuente del dato |
|----|-----|-------------|------------|------|-----------|-----------------|
| KPI-01 | Tiempo medio de aprobación de oferta académica (días hábiles) | Sí | 5–15 días | ≤ 2 días hábiles | Q1 2027 | Logs del sistema SGAI |
| KPI-02 | Tasa de adopción digital de declaraciones juradas | No | 0 % (proceso en papel) | ≥ 90 % | Q1 2027 | Registros SGAI |
| KPI-03 | Satisfacción del docente con el sistema (escala 1–5) | No | Por medir antes del lanzamiento | ≥ 4/5 | Q2 2027 | Encuesta semestral |
| KPI-04 | Porcentaje de docentes que consultan boletas/horarios sin trámite presencial | No | 0 % | 100 % | Q2 2027 | Logs de acceso SGAI |

---

## 9. Objetivos de Negocio (SMART)

| ID | Objetivo | Métrica | Línea base | Meta | Horizonte |
|----|----------|---------|------------|------|-----------|
| BO-01 | Reducir el tiempo de aprobación del trámite de oferta académica | Días hábiles promedio por trámite | 5–15 días | ≤ 2 días hábiles | Q1 2027 |
| BO-02 | Eliminar la presencialidad en la gestión de declaraciones juradas | % de DJ gestionadas de forma digital | 0 % | 100 % | Q1 2027 |
| BO-03 | Garantizar acceso self-service a información laboral para el 100 % de docentes activos | % de docentes que acceden sin trámite presencial | 0 % | 100 % | Q2 2027 |
| BO-04 | Reducir la carga administrativa del DPA en gestión de oferta académica | Horas-persona mensuales dedicadas a revisión manual | Por medir (baseline pre-lanzamiento) | Reducción ≥ 60 % | Q2 2027 |

---

## 10. Stakeholders y Roles (Modelo RACI)

| Stakeholder | Interés | R / A / C / I |
|-------------|---------|----------------|
| Director DPA (Sponsor) | Estratégico: modernización y eficiencia institucional | A |
| Técnicos DPA | Operativo: revisión y aprobación de trámites | R |
| Administradores de Facultad | Operativo: planificación académica | R |
| Docentes | Experiencia: autogestión de información laboral | C |
| Unidad de TI | Técnico: infraestructura, seguridad y soporte | R |
| Equipo de Desarrollo | Técnico: construcción del sistema | R |
| Dirección Universitaria | Estratégico: alineación con plan institucional | I |
| Unidad Legal / Asesoría Jurídica | Cumplimiento: normativa CEUB y Ley 164 | C |
| Proveedores de sistemas legados (nómina, ERP) | Técnico: APIs de integración | C |

---

## 11. Requerimientos de Negocio

| ID | Requerimiento de negocio | Prioridad (MoSCoW) | Justificación | Métrica de aceptación |
|----|--------------------------|--------------------|-|-|
| BR-001 | El docente debe poder crear, enviar y hacer seguimiento a sus declaraciones juradas sin presencia física | Must | Elimina el principal cuello de botella presencial | ≥ 90 % de DJ procesadas digitalmente en el primer semestre |
| BR-002 | El administrador de facultad debe poder enviar el trámite de oferta académica de forma digital al DPA | Must | Digitaliza el proceso de mayor impacto en el DPA | 100 % de trámites de oferta enviados digitalmente |
| BR-003 | El técnico DPA debe poder aprobar, observar y devolver trámites con trazabilidad completa | Must | Garantiza auditoría y elimina re-trabajo sin registro | 100 % de decisiones del DPA registradas en el sistema |
| BR-004 | El docente debe poder consultar su carga horaria, horarios de clase y calendario académico en línea | Must | Elimina consultas presenciales a administración | 100 % de docentes activos con acceso self-service |
| BR-005 | El docente debe poder acceder a sus boletas de pago desde el sistema | Must | Cubre la necesidad de información financiera sin trámite | 100 % de boletas disponibles digitalmente |
| BR-006 | El sistema debe impedir la edición de declaraciones juradas aprobadas o en revisión | Must | Cumple reglamento interno; garantiza integridad documental | 0 ediciones no autorizadas en auditoría post-lanzamiento |
| BR-007 | Solo docentes con vinculación activa pueden generar declaraciones juradas | Must | Regla de negocio definida en reglamento interno | 0 excepciones detectadas en auditoría |
| BR-008 | El administrador de facultad debe poder gestionar el estado y roles de sus docentes (autoridad, investigador, administrativo) | Must | Refleja la estructura organizacional de la universidad | 100 % de roles configurables sin intervención del Administrador de sistema |
| BR-009 | El sistema debe integrarse con el sistema de nómina para mostrar boletas de pago actualizadas | Must | Fuente única de verdad para información financiera | Boletas sincronizadas en ≤ 24 h desde la liquidación |
| BR-010 | El sistema debe integrarse con el sistema de información institucional para sincronizar datos de materias, carreras y carga horaria | Must | Evita duplicación de datos y errores de consistencia | 0 inconsistencias entre SGAI y sistema institucional en auditoría mensual |
| BR-011 | El administrador del sistema debe poder crear cuentas, configurar materias con carga horaria y gestionar roles y permisos | Must | Requisito de operación y seguridad del sistema | Gestión de accesos centralizada, 100 % sin acceso directo a BD |
| BR-012 | El técnico DPA debe poder generar reportes consolidados de la gestión académica | Should | Herramienta de control y toma de decisiones institucional | Al menos 3 tipos de reporte exportables (PDF/Excel) disponibles en el lanzamiento |

---

## 12. Reglas de Negocio y Políticas

| ID | Regla | Tipo | Origen |
|----|-------|------|--------|
| RB-01 | Solo los docentes con vinculación activa pueden generar declaraciones juradas | Política | Reglamento interno universitario |
| RB-02 | Todo trámite de oferta académica debe ser revisado y validado por la Administración de Facultad antes de ser enviado al técnico DPA | Política | Reglamento interno universitario |
| RB-03 | Las declaraciones juradas aprobadas o en proceso de revisión no pueden ser editadas, salvo que sean devueltas con observaciones | Política | Reglamento interno universitario |
| RB-04 | El sistema debe cumplir con la Ley N° 164 de Telecomunicaciones y Tecnologías de Información y Comunicación de Bolivia (protección de datos, seguridad informática) | Normativa | Ley 164 – Estado Plurinacional de Bolivia |
| RB-05 | La planificación académica debe respetar los plazos y formatos establecidos por el Comité Ejecutivo de la Universidad Boliviana (CEUB) | Normativa | Disposiciones CEUB |
| RB-06 | El acceso a información financiera (boletas de pago) está restringido a cada docente para sus propios datos; los administradores de facultad no tienen acceso a boletas individuales | Política | Reglamento interno universitario / Privacidad laboral |

---

## 13. Supuestos, Restricciones y Dependencias

**Supuestos:**
- Los docentes cuentan con acceso a internet (móvil o fijo) y un navegador web moderno.
- Los sistemas de nómina y el sistema de información institucional exponen o pueden exponer APIs o mecanismos de integración documentados.
- La Dirección Universitaria aprobará el financiamiento del proyecto dentro del ciclo presupuestario 2026.
- La Unidad de TI proveerá infraestructura de servidores y soporte para el despliegue del sistema.
- Los usuarios aceptarán recibir capacitación y acompañamiento durante el período de transición.

**Restricciones:**
- El sistema debe cumplir la Ley N° 164 de Bolivia (seguridad informática, privacidad de datos) y las disposiciones normativas del CEUB.
- El plazo de entrega en producción es de 6 a 12 meses desde la aprobación del BRD.
- El presupuesto no está definido aún; el Business Case debe presentarse antes de la aprobación formal de financiamiento.
- El sistema debe ser accesible exclusivamente vía navegador web (sin app nativa en esta fase).
- Los sistemas de nómina y el sistema institucional son sistemas legados que no pueden ser modificados; el SGAI debe adaptarse a sus interfaces existentes.

**Dependencias:**
- Acceso técnico y documentación de APIs del sistema de nómina (integración de boletas de pago).
- Acceso técnico y documentación del sistema de información institucional (materias, carreras, carga horaria).
- Aprobación del reglamento interno por parte de la Unidad Legal para validar las reglas de negocio embebidas.
- Disponibilidad de la Unidad de TI para proveer entorno de desarrollo, staging y producción.

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

### 14.2 Fuera de Alcance
- Gestión financiera o contable de la universidad (pertenece al sistema de nómina/ERP institucional).
- Matrícula y gestión de estudiantes (fuera del alcance de este sistema; se gestiona en otro módulo institucional).
- Aplicación móvil nativa (iOS/Android) — se evaluará en fases posteriores.
- Módulo de videoconferencia o LMS (Learning Management System).
- Gestión de procesos de contratación o concurso de méritos docentes.

---

## 15. Beneficios Esperados y Business Case Resumido

> Nota: El presupuesto no está formalmente aprobado. Las cifras son estimaciones conservadoras basadas en benchmarks de digitalización en universidades públicas latinoamericanas y en el volumen institucional declarado (>1.500 docentes, >15 facultades, 2 semestres/año).

| Tipo | Año 1 | Año 2 | Año 3 |
|------|-------|-------|-------|
| Ahorro operativo (reducción horas-persona DPA + facultades) | USD 18.000 | USD 22.000 | USD 22.000 |
| Valor por eliminación de errores y re-trabajo | USD 5.000 | USD 8.000 | USD 8.000 |
| Inversión CAPEX (desarrollo, integración) | USD 45.000 | — | — |
| Costo OPEX (hosting, mantenimiento, soporte) | USD 6.000 | USD 6.000 | USD 6.000 |
| **Flujo neto del año** | **–USD 28.000** | **+USD 24.000** | **+USD 24.000** |
| **VAN estimado (3 años, 10 % descuento)** | **+USD 12.400** | | |
| **TIR estimada** | **~22 %** | | |
| **Payback** | **~20 meses** | | |

---

## 16. Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|--------|--------------|---------|------------|-------------|
| Integración con sistemas de nómina y ERP institucional falla o se retrasa | Alta | Alto | Levantar documentación técnica de sistemas legados en fase de análisis (sprint 0); definir contrato de integración formal con la Unidad de TI; diseñar el sistema con módulos desacoplados que permitan operar parcialmente sin la integración | Líder técnico + Unidad de TI |
| Resistencia al cambio de docentes y administradores acostumbrados al papel | Media | Alto | Plan de gestión del cambio con capacitaciones presenciales y tutoriales; período de transición paralela (papel + digital) durante el primer semestre | PM + DPA |
| Presupuesto no aprobado o reducido significativamente | Media | Alto | Presentar Business Case cuantificado antes de Q3 2026; diseñar el sistema en módulos priorizables (MVP reducible) | Sponsor + PM |
| Incumplimiento del plazo de 6–12 meses | Media | Medio | Definir MVP mínimo viable desde el inicio; adoptar metodología ágil con entregables incrementales; revisión de alcance mensual | PM |
| Brechas de seguridad o incumplimiento de la Ley 164 | Baja | Alto | Auditoría de seguridad en fase de diseño; revisión legal del sistema antes del lanzamiento; autenticación con credenciales institucionales | Unidad de TI + Asesoría Legal |

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
| BR-009 | MRD-N-04 | PRD-REQ-06 | FSD-UC-006 (Integración nómina) |
| BR-010 | MRD-N-05 | PRD-REQ-07 | FSD-UC-007 (Integración ERP) |

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

---

## Checklist de Entrega

- [x] Resumen ejecutivo de ½ página con problema, propuesta, valor y métricas.
- [x] Problema de negocio con evidencia cuantitativa.
- [x] 1–2 personas / usuarios objetivo caracterizadas (JTBD, dolores, ganancias).
- [x] Propuesta de valor explícita (formato VPC).
- [x] Panorama competitivo resumen con ≥ 3 alternativas (incluyendo do-nothing).
- [x] Business Model Canvas con los 9 bloques poblados, ≥ 3 elementos por bloque.
- [x] Métricas clave de éxito: ≥ 1 North Star + 2 KPIs de apoyo, con meta y horizonte.
- [x] ≥ 3 objetivos de negocio SMART.
- [x] Matriz RACI completa.
- [x] ≥ 8 requerimientos de negocio priorizados (MoSCoW).
- [x] Reglas, restricciones, supuestos y dependencias explícitos.
- [x] Business case cuantitativo (estimado).
- [x] Trazabilidad a MRD/PRD iniciada.
