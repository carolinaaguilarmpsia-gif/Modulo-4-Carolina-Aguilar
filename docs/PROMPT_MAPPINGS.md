# PROMPT_MAPPINGS.md — Registro de Ingeniería de IA
# Sistema de Gestión Académica Integral (SGAI)

> **Propósito:** Documentar con trazabilidad completa cada uso de inteligencia artificial en el proceso de construcción del SGAI, siguiendo el formato obligatorio Input → Prompt → Output. Este documento es la evidencia de un proceso de desarrollo AI-Native y garantiza la auditabilidad del AI-SDLC del proyecto.
>
> **Formato obligatorio por entrada:**
> - **Input:** Qué datos/contexto se le entregaron a la IA.
> - **Prompt:** Instrucción exacta utilizada (o reconstrucción fiel).
> - **Output:** Resultado obtenido y cómo se incorporó al artefacto.
>
> **Convención de IDs:** `PR-[DOCUMENTO]-[NNN]`
> Ejemplos: `PR-BRD-001`, `PR-PRD-002`, `PR-FSD-003`, `PR-MRD-001`, `PR-VIBE-001`

---

## Metadatos

| Campo | Valor |
|-------|-------|
| Proyecto | SGAI — Sistema de Gestión Académica Integral |
| Grupo | G01 |
| Versión | v1.0 |
| Fecha de inicio | 02/05/2026 |
| Última actualización | 10/05/2026 |
| Modelo de IA utilizado | Claude Sonnet (Anthropic) — interfaz claude.ai |
| Responsable del registro | Equipo de Desarrollo SGAI |

---

## Índice de Prompts

| ID | Documento generado | Propósito | Fecha |
|----|-------------------|-----------|-------|
| PR-BRD-001 | BRD_v2.md | Refinamiento estratégico del BRD v0.1 | 10/05/2026 |
| PR-BRD-002 | BRD_v2.md | Validación del Business Model Canvas y riesgos | 10/05/2026 |
| PR-PRD-001 | PRD_v1.md | Generación del PRD completo desde BRD v2 | 10/05/2026 |
| PR-PRD-002 | PRD_v1.md | Generación de user stories con criterios Gherkin | 10/05/2026 |
| PR-FSD-001 | FSD_v1.md, LFSD.md | Generación del FSD clásico y LFSD | 10/05/2026 |
| PR-FSD-002 | FSD_v1.md | Generación del modelo de datos ER (Mermaid) | 10/05/2026 |
| PR-FSD-003 | FSD_v1.md | Generación de prompt-contratos funcionales (§7) | 10/05/2026 |
| PR-FSD-004 | FSD_v1.md | Generación de endpoints backend (tasks T-004, T-005) | 10/05/2026 |
| PR-FSD-005 | FSD_v1.md | Máquina de estados de DJ y Oferta Académica | 10/05/2026 |
| PR-MRD-001 | MRD_v1.md | Generación del MRD completo desde BRD v2 + visión de negocio | 10/05/2026 |
| PR-MRD-002 | MRD_v1.md | Análisis competitivo y posicionamiento Océano Azul | 10/05/2026 |
| PR-MRD-003 | MRD_v1.md | Generación de personas (User Personas) | 10/05/2026 |

---

## Sección 1: BRD — Business Requirements Document

---

### PR-BRD-001 — Refinamiento estratégico del BRD v0.1

**Fecha:** 10/05/2026
**Documento destino:** `BRD_v2.md`
**Secciones afectadas:** §0 Metadatos, §3.3 Continuous Discovery, §9 Objetivos SMART, §10 RACI, §16 Riesgos, §18 Trazabilidad

---

**Input:**

```
Documentos entregados a la IA:
1. 01_vision_negocio.txt — Visión del negocio SGAI con usuarios, tareas y criterios de éxito.
2. BRD_SGAI_v0.1.md — BRD inicial con 20 secciones, métricas, riesgos y requerimientos de negocio.
3. BRD_TEMPLATE(1).md — Plantilla completa del BRD con instrucciones por sección.
```

**Prompt:**

```
Actúa como: Senior Product Manager & AI Solutions Architect con experiencia en metodologías ágiles y SDLC acelerado por IA.

Contexto del Proyecto:
Estoy desarrollando el SGAI (Sistema de Gestión Académica Institucional). Mi objetivo es transformar la visión de negocio en una serie de documentos técnicos y estratégicos que sigan el flujo de valor: Negocio -> Producto -> Ingeniería.

Tarea:
Genera el archivo BRD_v2.md (Business Requirements Document).
- Objetivo: Refinar la visión estratégica del BRD v0.1.
- Contenido: Justificación del proyecto, objetivos estratégicos (SMART) con líneas base explícitas, KPIs de éxito con horizonte, análisis de stakeholders completo (modelo RACI), riesgos de alto nivel con responsables.
- El BRD v2 debe incorporar:
  * Sección de Continuous Discovery (§3.3) con evidencia de entrevistas.
  * Objetivos SMART con métricas, líneas base y horizonte temporal.
  * RACI con 10+ stakeholders.
  * Riesgos con responsable explícito por riesgo.
  * BR-013 y BR-014 (notificaciones y CV docente) añadidos.
  * KPI-05 de reducción de horas-persona DPA.
  * Trazabilidad completa BRD → MRD → PRD → FSD.
- Debe responder al "Por qué".
- Usa el template BRD_TEMPLATE(1).md como estructura base.
- Formato: Markdown (.md) completo y listo para uso.
```

**Output:**

El modelo generó el `BRD_v2.md` completo con las siguientes mejoras respecto al v0.1:
- Sección §3.3 Continuous Discovery añadida con tabla de cadencia y evidencia de 15 entrevistas.
- 5 objetivos SMART (BO-01 a BO-05) con líneas base numéricas explícitas.
- RACI ampliado con 10 stakeholders, incluyendo descripción del rol de cada uno.
- Riesgos (§16) con columna `Responsable` explícita por riesgo.
- BR-013 (actualización de CV) y BR-014 (notificaciones automáticas) añadidos a §11.
- KPI-05 (reducción horas-persona DPA ≥ 60 %) añadido a §8.
- Trazabilidad §18 ampliada con 9 filas BRD → MRD → PRD → FSD.
- Registro de cambios actualizado con descripción de las diferencias entre v0.1 y v2.0.

**Incorporación al artefacto:** Resultado utilizado directamente como `BRD_v2.md`. Revisado por el equipo para verificar coherencia con el BRD v0.1 original. Se ajustó manualmente el payback del business case (de 18 a 20 meses) para mantener consistencia con el BRD v0.1.

---

### PR-BRD-002 — Validación del Business Model Canvas y riesgos

**Fecha:** 10/05/2026
**Documento destino:** `BRD_v2.md` — §7 (BMC) y §16 (Riesgos)

---

**Input:**

```
Contexto: BRD_SGAI_v0.1.md §7 (BMC) y §16 (Riesgos de negocio).
Solicitud de revisión crítica del Business Model Canvas existente y enriquecimiento de la sección de riesgos.
```

**Prompt:**

```
Revisa el Business Model Canvas del BRD v0.1 del SGAI (sección §7) y el análisis de riesgos (§16).

Tareas:
1. En el BMC: añade al menos 1 elemento adicional por bloque que no esté en el v0.1, con foco en la sostenibilidad del modelo (expansión a otras universidades CEUB como fuente de ingresos adicional, soberanía tecnológica como propuesta de valor).
2. En los riesgos: añade el riesgo de "datos inconsistentes en sistemas legados" que actualmente no está contemplado. Asigna un responsable explícito a cada riesgo.
3. Mantén el formato de tabla del template BRD.

Contexto de negocio: Universidad pública boliviana, normativa CEUB, Ley 164, integración con sistemas legados de nómina y ERP institucional.
```

**Output:**

- BMC enriquecido con elemento de "Posible licenciamiento a otras universidades CEUB" en bloque 5 (Fuentes de ingresos) y "Soberanía tecnológica (código propio, operación en servidores locales)" en bloque 2 (Propuesta de valor).
- Riesgo adicional añadido: "Datos inconsistentes en sistemas legados no documentados" (Probabilidad: Media, Impacto: Medio), con mitigación y responsable (Líder técnico).
- Columna `Responsable` añadida a todos los riesgos existentes.

**Incorporación al artefacto:** Integrado en `BRD_v2.md` §7 y §16.

---

## Sección 2: PRD — Product Requirements Document

---

### PR-PRD-001 — Generación del PRD completo desde BRD v2

**Fecha:** 10/05/2026
**Documento destino:** `PRD_v1.md`
**Secciones afectadas:** Todas (§0 a §16)

---

**Input:**

```
Documentos entregados a la IA:
1. BRD_v2.md — BRD refinado con objetivos SMART, stakeholders, requerimientos y reglas de negocio.
2. 01_vision_negocio.txt — Visión de negocio con 4 usuarios y 8 capacidades funcionales.
3. PRD_TEMPLATE.md — Plantilla completa del PRD con instrucciones por sección.
```

**Prompt:**

```
Usando el BRD_v2.md del SGAI y la visión de negocio como base, genera el PRD_v1.md completo.

El PRD debe:
- Responder al "Qué" (puente entre negocio y técnica).
- Incluir mínimo 15 user stories priorizadas con criterios de aceptación en formato Gherkin.
- Cubrir las 4 épicas principales: Gestión de DJ, Oferta Académica, Información Laboral, Administración.
- Incluir priorización MoSCoW + tabla RICE para las 10 historias top.
- Incluir ≥ 2 user journeys en formato Mermaid.
- Definir requerimientos funcionales (PRD-REQ-*) y no funcionales (PRD-NFR-*) de alto nivel.
- Incluir Constitution (principios no negociables) en §0.1.
- Mantener trazabilidad explícita a los IDs del BRD (BR-*, RB-*).
- Roadmap de versiones: v0.1 MVP → v1.0 → v1.1 → v2.0.
- Discovery track con hipótesis a validar por sprint.

Formato: Markdown (.md) completo, listo para entrega.
```

**Output:**

El modelo generó `PRD_v1.md` con:
- Constitution con 4 principios no negociables (§0.1).
- 5 objetivos de producto (OP-01 a OP-05) vinculados a objetivos de negocio del BRD.
- Roadmap de 4 versiones (v0.1 MVP → v2.0) con fechas objetivo.
- Discovery track con 4 hipótesis a validar por sprint.
- 4 épicas (E1–E4) con 17 user stories totales (PRD-US-001 a PRD-US-017).
- Criterios Gherkin para cada historia de alta prioridad.
- Priorización MoSCoW completa + tabla RICE con 10 historias.
- 12 requerimientos funcionales (PRD-REQ-001 a PRD-REQ-012).
- 10 NFRs (PRD-NFR-001 a PRD-NFR-010) con métricas y umbrales.
- 2 user journeys en Mermaid (Docente → DJ, Admin. Facultad → Oferta Académica).
- Trazabilidad completa PRD → BRD y PRD → FSD (próximo).

**Incorporación al artefacto:** Resultado utilizado directamente como `PRD_v1.md`. Se ajustó manualmente la tabla RICE para corregir unidades de cálculo en historias con Reach < 100 (actores administrativos), añadiendo la nota aclaratoria sobre PRD-US-014 y PRD-US-008 como "habilitadores críticos".

---

### PR-PRD-002 — Refinamiento de criterios Gherkin para épica E1 (DJ)

**Fecha:** 10/05/2026
**Documento destino:** `PRD_v1.md` — §5.1 (Épica E1)

---

**Input:**

```
Contexto: User stories PRD-US-001 a PRD-US-005 (Gestión de Declaraciones Juradas).
Reglas de negocio aplicables: RB-01 (vinculación activa), RB-03 (no edición de DJ aprobadas/en revisión).
Flujo esperado: Borrador → En revisión Facultad → Aprobada / Devuelta.
```

**Prompt:**

```
Para las user stories PRD-US-001 a PRD-US-005 del módulo de Declaraciones Juradas del SGAI, genera criterios de aceptación en formato Gherkin.

Cada historia debe tener:
- Al menos 1 escenario "happy path" (flujo exitoso).
- Al menos 1 escenario de error o flujo alternativo crítico.
- Los escenarios deben reflejar las reglas de negocio: RB-01 (solo docentes con vinculación activa crean DJ), RB-03 (DJ aprobada o en revisión no es editable).
- Usa bloques Gherkin estándar (Dado/Cuando/Entonces, o Given/When/Then).
- Los criterios deben ser verificables en testing automatizado (Playwright o similar).

Reglas adicionales:
- PRD-US-005 (seguridad de edición) debe tener un escenario específico de intento de edición via API directa (no solo UI).
- Los cambios de estado deben incluir notificación al actor destino como parte del criterio.
```

**Output:**

Criterios Gherkin generados para PRD-US-001 a PRD-US-005, incluyendo:
- Escenario de docente sin vinculación activa intentando crear DJ (PRD-US-001).
- Escenario de confirmación + número de seguimiento al enviar (PRD-US-002).
- Escenario de estado en tiempo real sin recarga de página (PRD-US-003).
- Escenario de devolución con texto de observación obligatorio (PRD-US-004).
- Escenario de intento de edición de DJ aprobada vía API retornando HTTP 403 con registro en log de auditoría (PRD-US-005).

**Incorporación al artefacto:** Integrado en `PRD_v1.md` §5.1.1 a §5.1.5.

---

## Sección 3: FSD — Functional Specification Document

---

### PR-FSD-001 — Generación del FSD clásico y LFSD

**Fecha:** 10/05/2026
**Documento destino:** `FSD_v1.md` y `LFSD.md`
**Secciones afectadas:** Todas

---

**Input:**

```
Documentos entregados a la IA:
1. PRD_v1.md — PRD completo con user stories, reqs. funcionales y NFRs.
2. BRD_v2.md — BRD refinado con reglas de negocio y restricciones.
3. FSD_TEMPLATE.md — Plantilla del FSD con soporte para modo clásico (🔧) y LFSD (⚡).
4. 01_vision_negocio.txt — Visión de negocio con actores y capacidades.
```

**Prompt:**

```
Usando el PRD_v1.md y el BRD_v2.md del SGAI, genera dos documentos:

1. FSD_v1.md (modo FSD clásico 🔧):
   - Resumen ejecutivo del sistema (150–250 palabras).
   - §2.4 Plan técnico: stack Node.js + React + PostgreSQL + Prisma; arquitectura en capas.
   - §2.5 Tasks: mínimo 10 tasks ejecutables con prompt asociado y dependencias.
   - §3 Actores: 7 actores (4 humanos + 3 sistemas).
   - §4 Casos de uso: mínimo 5 casos críticos con flujo principal, alternativos, Gherkin, datos de entrada/salida y reglas de negocio aplicables.
   - §5 Reglas de negocio: 7 reglas con tipo y origen.
   - §6 Modelo de datos ER completo en Mermaid + diccionario de datos.
   - §7 Prompt-contratos: 3 contratos (UC-002 DJ, UC-003 Oferta, UC-005 Boletas) con los 6 elementos de la anatomía del prompt.
   - §8 Integraciones externas: 4 sistemas (nómina, institucional, SMTP, LDAP).
   - §9 Mapa de pantallas con trazabilidad a wireframes M2.
   - §10 NFRs: 10 NFRs con métrica, umbral y verificación.
   - §11 Trazabilidad BRD → PRD → FSD → NFR → prueba.
   - §12 Plan de pruebas con Jest, Supertest, Playwright, k6.
   - §13 Riesgos funcionales: 5 riesgos.
   - §14 Glosario: 8 términos.

2. LFSD.md (modo LFSD ⚡):
   - Descripción del sistema en 5 frases.
   - Mapa de módulos con sprint objetivo y estado (semáforo).
   - 3 UC críticos en formato compacto con máquina de estados ASCII y Gherkin mínimo.
   - Tasks del Sprint 1 con responsable y estado.
   - Definition of Done.
   - NFRs críticos en tabla de referencia rápida.
   - Log de actualizaciones del LFSD.

Respeta los IDs de los docs previos: BR-*, RB-*, PRD-REQ-*, PRD-NFR-*, PRD-US-*.
Formato: Markdown completo para cada archivo.
```

**Output:**

Dos archivos generados:

**FSD_v1.md:**
- 5 casos de uso (FSD-UC-001 a FSD-UC-005) con flujo completo.
- Modelo ER con 11 entidades y relaciones en Mermaid.
- Diccionario de datos con 12 atributos clave.
- 3 prompt-contratos con los 6 elementos (Role, Task, Context, Reasoning, Stop condition, Output).
- 10 NFRs con umbral y verificación.
- 10 tasks en §2.5 con dependencias y prompt asociado.
- Plan de pruebas completo con 4 tipos de testing.

**LFSD.md:**
- Mapa de 9 módulos con sprint objetivo y estado semáforo.
- 3 UC en formato compacto con máquinas de estado ASCII.
- 8 tasks del Sprint 1 con responsable.
- Definition of Done con 7 criterios.
- Log de actualizaciones para mantenimiento sprint a sprint.

**Incorporación al artefacto:** Resultados utilizados directamente como `FSD_v1.md` y `LFSD.md`. Se ajustó manualmente el modelo ER para añadir la entidad `CALENDARIO_ACADEMICO` y la relación `PERFIL_DOCENTE` que no estaban en el primer borrador generado.

---

### PR-FSD-002 — Generación del modelo de datos ER (Mermaid)

**Fecha:** 10/05/2026
**Documento destino:** `FSD_v1.md` — §6 Modelo de datos

---

**Input:**

```
Capacidades funcionales del SGAI:
1. Gestión de DJ (creación, flujo de aprobación, historial).
2. Oferta Académica (asignación de docentes a materias, flujo de aprobación).
3. Información Laboral (horarios, calendario académico, carga horaria).
4. Boletas de Pago (sincronizadas desde nómina).
5. Perfil Docente (CV, formación, publicaciones).
6. Administración (usuarios, materias, carreras, facultades).

Reglas de negocio: RB-01 a RB-07 del BRD_v2.md.
Stack de BD: PostgreSQL 15 con ORM Prisma.
```

**Prompt:**

```
Genera el modelo de datos funcional (diagrama ER + diccionario) para el SGAI.

Requisitos del modelo:
- Entidades principales: USUARIO, FACULTAD, MATERIA, CARRERA, DECLARACION_JURADA, HISTORIAL_DJ, OFERTA_ACADEMICA, ASIGNACION_DOCENTE, HISTORIAL_OFERTA, BOLETA_PAGO, PERFIL_DOCENTE, CALENDARIO_ACADEMICO.
- Cada entidad debe tener: PK uuid, timestamps (created_at/updated_at donde aplique), campos funcionales clave.
- Los campos de estado (DECLARACION_JURADA.estado, OFERTA_ACADEMICA.estado) deben ser ENUM con los valores del flujo de aprobación.
- Las relaciones deben reflejar las reglas de negocio:
  * Un docente puede tener muchas DJ (1:N).
  * Una DJ tiene un historial de cambios (1:N HISTORIAL_DJ).
  * Una oferta académica tiene muchas asignaciones de docente (1:N ASIGNACION_DOCENTE).
  * Un docente tiene una sola boleta de pago por período.
- Formato del diagrama: Mermaid erDiagram (compatible con GitHub Markdown).
- Diccionario de datos: tabla Markdown con columnas Entidad | Atributo | Tipo | Obligatorio | Validaciones | Origen.
- Incluir los campos de auditoría (quién creó, cuándo) donde sean críticos.
```

**Output:**

- Diagrama ER en Mermaid con 11 entidades y 14 relaciones.
- ENUM de estados para DJ: `[BORRADOR, EN_REVISION_FACULTAD, APROBADA, DEVUELTA, EN_REVISION_DPA, RECHAZADA]`.
- ENUM de estados para Oferta Académica: `[EN_ELABORACION, EN_REVISION_DPA, APROBADO, OBSERVADO]`.
- Diccionario de 12 atributos clave con validaciones.

**Incorporación al artefacto:** Integrado en `FSD_v1.md` §6.1 y §6.2. Se añadió manualmente el campo `fuente_externa_id` en BOLETA_PAGO para mapear el ID del registro en el sistema de nómina.

---

### PR-FSD-003 — Generación de prompt-contratos funcionales

**Fecha:** 10/05/2026
**Documento destino:** `FSD_v1.md` — §7 Prompt como Contrato Funcional

---

**Input:**

```
Casos de uso críticos del SGAI:
- FSD-UC-002: Ciclo completo de Declaración Jurada (máquina de estados + notificaciones + auditoría).
- FSD-UC-003: Ciclo completo de Oferta Académica (máquina de estados + validaciones + auditoría).
- FSD-UC-005: Consulta de Boletas de Pago (acceso restringido al docente titular, RB-04).

Reglas de negocio aplicables: RB-01 (vinculación activa), RB-03 (DJ no editable), RB-04 (boletas solo docente titular), BR-006 (historial obligatorio).
Arquitectura: API REST Node.js + PostgreSQL. Transacciones atómicas para cambio de estado + registro en historial.
```

**Prompt:**

```
Genera los prompt-contratos funcionales para los casos de uso FSD-UC-002, FSD-UC-003 y FSD-UC-005 del SGAI.

Cada prompt-contrato debe tener los 6 elementos de la anatomía del prompt:
1. Role: Rol del servicio/agente que ejecuta el caso de uso.
2. Task: Qué debe producir operativamente.
3. Context: Entrada esperada, referencias de dominio (reglas BR/RB), restricciones.
4. Reasoning: Pasos obligatorios numerados (máx. 9 pasos por contrato).
5. Stop condition: Condiciones de parada verificables (errores, casos borde).
6. Output: Formato JSON del resultado + Invariants + Failure modes con códigos HTTP.

Restricciones de diseño:
- El historial de cambios de estado SIEMPRE se inserta en la misma transacción DB que el cambio de estado (invariante de atomicidad).
- Las notificaciones son asíncronas (encoladas), no sincrónias (no bloquean la respuesta al cliente).
- El docente_id para acceso a boletas se extrae SIEMPRE del JWT, nunca del body de la request (invariante de seguridad).
- Los errores siguen los códigos HTTP estándar: 404 (no encontrado), 403 (sin permisos), 422 (validación de negocio), 500 (error interno).
```

**Output:**

3 prompt-contratos completos:
- **UC-002 (DJ):** 9 pasos de razonamiento, invariantes de atomicidad y restricciones de estado. Failure modes: 404, 403, 422 (transición inválida + observaciones requeridas), 500 con rollback.
- **UC-003 (Oferta Académica):** 8 pasos, incluyendo validación de materias completas antes de ENVIAR_DPA. Failure modes: 404, 403, 422 (materias sin asignar + transición inválida), 500.
- **UC-005 (Boletas):** 4 pasos, invariante de seguridad (docente_id del JWT). Failure modes: 403, 404.

**Incorporación al artefacto:** Integrado en `FSD_v1.md` §7.1, §7.2 y §7.3.

---

### PR-FSD-004 — Generación de tasks de backend (T-004, T-005)

**Fecha:** 10/05/2026
**Documento destino:** `FSD_v1.md` — §2.5 y `LFSD.md` — §7

---

**Input:**

```
Contexto técnico:
- Stack: Node.js 20 + Express.js + Prisma ORM + PostgreSQL 15.
- Módulo: Declaraciones Juradas (M-DJ).
- Modelo de datos: Entidades DECLARACION_JURADA e HISTORIAL_DJ del modelo ER (FSD §6).
- Reglas de negocio: RB-01, RB-03 (del BRD_v2.md).
- Prompt-contrato de referencia: PR-FSD-003 (UC-002).
```

**Prompt:**

```
Genera las especificaciones de las tasks T-004 y T-005 para el módulo de Declaraciones Juradas del SGAI.

T-004 — Endpoint CRUD de Declaraciones Juradas:
- Operaciones: POST /declaraciones-juradas (crear en estado BORRADOR), GET /declaraciones-juradas (listar por docente), GET /declaraciones-juradas/:id (detalle).
- Validaciones: el docente_id se extrae del JWT; RB-01 (vinculación activa verificada en POST).
- Response format: JSON con dj_id, estado, created_at, campos_formulario.

T-005 — Endpoint de máquina de estados de DJ:
- Operación: PATCH /declaraciones-juradas/:id/estado
- Body: { comando: "ENVIAR" | "APROBAR" | "DEVOLVER", observaciones: string|null }
- Implementar la máquina de estados completa: BORRADOR → EN_REVISION_FACULTAD → APROBADA / DEVUELTA.
- Insertar en HISTORIAL_DJ en la misma transacción DB (atomicidad).
- Encolar notificación SMTP al actor destino de forma asíncrona.
- Validar rol del actor vs. comando permitido.

Para cada task, especifica: descripción, dependencias (task IDs previas), criterios de éxito verificables, y el prompt de implementación que usaría un desarrollador para generar el código.
```

**Output:**

Especificación completa de T-004 y T-005:
- T-004: Endpoints con validación de rol (solo el Docente titular puede ver sus propias DJ vía JWT), paginación básica en el listado, response schema JSON.
- T-005: Implementación de máquina de estados con Prisma transaction (cambio de estado + INSERT en HISTORIAL_DJ en una sola transacción), encolado asíncrono con Bull para notificaciones SMTP, validación de rol vs. comando con tabla de permisos.

**Incorporación al artefacto:** Especificaciones integradas en `FSD_v1.md` §2.5 (T-004 y T-005) y como referencia en `LFSD.md` §7.

---

### PR-FSD-005 — Máquina de estados de DJ y Oferta Académica

**Fecha:** 10/05/2026
**Documento destino:** `FSD_v1.md` — §4.2 y §4.3 / `LFSD.md` — §4

---

**Input:**

```
Flujos de aprobación definidos en el BRD:
- DJ: Solo docentes activos → envían a Facultad → Facultad aprueba o devuelve → (opcional DPA en algunas configuraciones).
- Oferta Académica: Facultad elabora → envía al DPA → DPA aprueba u observa → Facultad corrige y reenvía.
Reglas: RB-01, RB-02, RB-03.
```

**Prompt:**

```
Para el SGAI, diseña las máquinas de estados completas para:
1. Declaración Jurada (DJ): estados, transiciones válidas, actor que ejecuta cada transición, condiciones de guarda.
2. Oferta Académica: ídem.

Para cada máquina de estados:
- Lista todos los estados posibles con su descripción.
- Define todas las transiciones permitidas en formato: [ESTADO_ORIGEN] --comando--> [ESTADO_DESTINO] (actor, condición de guarda).
- Define explícitamente las transiciones NO permitidas que el sistema debe rechazar.
- Representa el flujo en formato ASCII (para el LFSD) y como diagrama de texto descriptivo (para el FSD clásico).
- Identifica los estados terminales (no tienen transiciones salientes).
```

**Output:**

**Máquina de estados DJ:**
- 6 estados: BORRADOR, EN_REVISION_FACULTAD, APROBADA, DEVUELTA, EN_REVISION_DPA, RECHAZADA.
- 7 transiciones válidas con actor y condición de guarda.
- 3 transiciones explícitamente prohibidas (ej.: DEVOLVER sobre DJ ya APROBADA).
- Estados terminales: APROBADA, RECHAZADA.

**Máquina de estados Oferta Académica:**
- 4 estados: EN_ELABORACION, EN_REVISION_DPA, APROBADO, OBSERVADO.
- 5 transiciones válidas.
- Condición de guarda en ENVIAR_DPA: todas las materias deben tener docente asignado.

**Incorporación al artefacto:** Máquinas de estados integradas en `FSD_v1.md` §4.2 (flujo principal UC-002) y §4.3 (flujo principal UC-003), y representadas en ASCII en `LFSD.md` §4.

---

## Sección 4: MRD — Market Requirements Document

---

### PR-MRD-001 — Generación del MRD completo

**Fecha:** 10/05/2026
**Documento destino:** `MRD_v1.md`
**Secciones afectadas:** Todas (§0 a §16)

---

**Input:**

```
Documentos entregados a la IA:
1. BRD_v2.md — BRD refinado con contexto de negocio, stakeholders, personas y requerimientos.
2. 01_vision_negocio.txt — Visión de negocio SGAI.
3. PRD_v1.md — PRD con user stories y requerimientos funcionales.
4. MRD_TEMPLATE.md — Plantilla completa del MRD.
```

**Prompt:**

```
Actúa como Senior Product Manager especializado en mercados de software educativo latinoamericano.

Usando el BRD_v2.md y la visión de negocio del SGAI, genera el MRD_v1.md completo.

El MRD debe:
1. Responder al "Qué pide el mercado y por qué este producto ganará".
2. Sección §1 Resumen Ejecutivo: análisis del mercado universitario público boliviano (CEUB), oportunidad y diferenciación.
3. Sección §2 Visión del producto: frase de máx. 25 palabras con el formato del template.
4. Sección §3 Análisis de mercado:
   - TAM: sistema universitario público latinoamericano / boliviano.
   - SAM: universidades públicas bolivianas (CEUB, 11 universidades).
   - SOM: universidad piloto + expansión 2–3 universidades.
   - ≥ 5 tendencias del sector relevantes.
   - Factores regulatorios: Ley 164, CEUB, Estatuto Orgánico.
   - Tabla de Continuous Discovery con cadencia quincenal.
5. Sección §4 Segmentación y Personas:
   - 4 segmentos de clientes con tamaño, necesidad y disposición.
   - 4 personas completas (Docente, Admin. Facultad, Técnico DPA, Admin. Sistema) con todos los atributos del template: demografía, objetivos, dolores, comportamiento digital, frase representativa, willingness-to-pay.
6. Sección §5 JTBD: ≥ 8 JTBD en formato tabla.
7. Sección §6 Análisis competitivo:
   - Comparar vs.: SIU-Guaraní, Google Workspace (Forms+Drive), ERP genérico (Banner/Ellucian), proceso actual (do-nothing).
   - ≥ 10 criterios de comparación.
   - Positioning statement.
   - Ventaja competitiva sostenible.
8. Sección §7 Propuesta de valor:
   - Value Proposition Canvas resumido con tabla por segmento (Docente, Admin. Facultad, Técnico DPA).
   - Análisis de Océano Azul con tabla Eliminar/Reducir/Aumentar/Crear.
9. Sección §8 Pricing: modelo de licencia institucional con estructura de precios.
10. Sección §9 Go-to-Market: canales, estrategia pre-launch/launch/post-launch, funnel AARRR.
11. Sección §10 Métricas: North Star + 4 KPIs secundarios fechados.
12. Sección §11 Requerimientos de mercado: 10 MRD-N-* priorizados.
13. Sección §12 Hipótesis: 6 hipótesis con criterio de éxito.
14. Sección §13 Riesgos: 6 riesgos con prob., impacto y mitigación.
15. Sección §14 Trazabilidad: tabla MRD-N-* → BRD ID → PRD ID.

Formato: Markdown (.md) completo, coherente con el BRD y PRD previos, IDs trazables.
```

**Output:**

`MRD_v1.md` completo con:
- TAM/SAM/SOM cuantificados con fuentes declaradas.
- 4 segmentos + 4 personas completas con frase representativa.
- 8 JTBD en tabla.
- Análisis competitivo con 11 criterios comparando 5 alternativas.
- Positioning statement de 1 párrafo.
- Value Proposition Canvas por segmento + análisis Océano Azul con 9 acciones.
- Pricing: licencia institucional USD 45.000 CAPEX + USD 6.000 OPEX/año + adaptación CEUB USD 15.000–20.000.
- Funnel AARRR completo.
- 10 requerimientos MRD-N-* priorizados.
- 6 hipótesis a validar con criterio de éxito.
- 6 riesgos de mercado.
- Trazabilidad MRD-N-* → BR-* → PRD-REQ-* completa.

**Incorporación al artefacto:** Resultado utilizado directamente como `MRD_v1.md`. Se añadió manualmente la nota de transparencia sobre las estimaciones de TAM (para claridad académica sobre el origen de las cifras).

---

### PR-MRD-002 — Análisis competitivo y posicionamiento Océano Azul

**Fecha:** 10/05/2026
**Documento destino:** `MRD_v1.md` — §6 y §7.2

---

**Input:**

```
Competidores identificados en el BRD v0.1 §6:
- SIU-Guaraní (Argentina) — sistema universitario público argentino.
- Google Workspace (Forms + Drive + Sheets) — herramienta colaborativa genérica.
- ERP universitario genérico (Ellucian, Banner) — sistema empresarial de alto costo.
- Proceso actual (papel + correo + presencial) — do-nothing.

Contexto del mercado: universidades públicas bolivianas, normativa CEUB, Ley 164, sistemas de nómina locales, presupuestos institucionales limitados.

Diferencial del SGAI: diseñado para normativa boliviana, integración con legados locales sin modificarlos, operación en servidores locales, costo total de propiedad competitivo.
```

**Prompt:**

```
Para el MRD del SGAI, genera:

1. Tabla comparativa extendida (§6.1) con al menos 11 criterios de comparación entre:
   - SGAI (nuestro producto)
   - SIU-Guaraní
   - Google Workspace (Forms + Drive)
   - ERP genérico (Banner/Ellucian)
   - Proceso actual (do-nothing)

   Criterios sugeridos (puedes añadir más relevantes):
   - Adaptación a normativa CEUB Bolivia
   - Flujo de aprobación multinivel (Docente → Facultad → DPA)
   - Integración con sistemas legados de nómina
   - Acceso self-service docente
   - Costo de implementación (CAPEX)
   - Tiempo de implementación
   - Cumplimiento Ley 164 Bolivia
   - Operación en servidores locales
   - Soporte en contexto boliviano
   - Curva de aprendizaje usuarios no técnicos
   - Mantenimiento por la propia universidad

   Usa ✅ / ⚠️ / ❌ con texto explicativo breve.

2. Análisis de Océano Azul (§7.2) — tabla Eliminar / Reducir / Aumentar / Crear:
   - Aplicar el marco de Kim & Mauborgne al SGAI vs. la industria de software de gestión académica universitaria.
   - Mínimo 3 acciones por categoría.
   - Enfocarse en los atributos que crean diferenciación real y sostenible en el mercado boliviano.

3. Ventaja competitiva sostenible (§6.3):
   - 3 fuentes de ventaja competitiva sostenible.
   - Justificar por qué son difíciles de replicar por competidores extranjeros o genéricos.
```

**Output:**

- Tabla comparativa con 11 criterios, 5 alternativas, usando ✅/⚠️/❌ con contexto explicativo.
- Análisis Océano Azul con 9 acciones distribuidas en las 4 categorías (3 Eliminar + 2 Reducir + 2 Aumentar + 3 Crear).
- Ventaja competitiva sostenible en 3 puntos: especificidad normativa CEUB/Ley 164, conocimiento de sistemas legados locales (barrera de entrada), modelo de expansión CEUB con efectos de red institucionales.

**Incorporación al artefacto:** Integrado en `MRD_v1.md` §6.1, §6.3 y §7.2.

---

### PR-MRD-003 — Generación de User Personas para el MRD

**Fecha:** 10/05/2026
**Documento destino:** `MRD_v1.md` — §4.2

---

**Input:**

```
Personas definidas en el BRD_v2.md §4:
- Docente universitario (titular, interino, investigador): 1.500+ usuarios.
- Administrador de Facultad: 15–20 usuarios.
- Técnico DPA: 3–5 usuarios.
- Administrador del Sistema (TI): 1–2 usuarios.

Evidencia de entrevistas (BRD §3.3): 15 contactos — 8 docentes, 4 administradores, 2 técnicos DPA, 1 director DPA.
Contexto de mercado: Universidad pública boliviana, usuarios con nivel tecnológico variable, acceso a internet móvil y WiFi universitario.
```

**Prompt:**

```
Para el MRD del SGAI, genera 4 User Personas completas con perspectiva de mercado (no solo operativa).

Cada persona debe incluir:
- Nombre ficticio representativo del contexto boliviano.
- Rol en el sistema y en la institución.
- Demografía: edad, formación, tecnología que usa, conectividad.
- Objetivos (4–5, orientados a tareas en el sistema).
- Dolores actuales (4–5, específicos del proceso manual).
- Comportamiento digital: dispositivos, apps que usa, nivel de competencia digital.
- Frase representativa (cita que captura su frustración o aspiración en 1–2 oraciones).
- Willingness-to-pay (cómo se materializa para un usuario de institución pública).
- Criterio de adopción: qué necesita ver/sentir para adoptar el sistema.

Las personas deben ser coherentes con los usuarios definidos en el BRD y añadir la perspectiva de mercado:
- ¿Cuántos de ellos hay en el segmento (scaling potential)?
- ¿Qué los hace adoptar o rechazar una solución nueva?
- ¿Cómo se relacionan con las alternativas actuales (SIU-Guaraní, Google, papel)?
```

**Output:**

4 personas completas:
- **Prof. Carmen Villalba** (Docente): 42 años, Android, WhatsApp. Frase: "Si pudiera hacer todo desde mi celular, me ahorraría media jornada por semestre." Adopción: si el primer flujo (crear DJ) tarda < 10 min sin capacitación.
- **Lic. Roberto Mamani** (Admin. Facultad): 38 años, Office, Outlook. Frase: "Cada inicio de semestre es un caos. Tengo mi propio Excel para rastrear quién me entregó qué." Adopción: si puede ver el estado de todos sus docentes en una pantalla.
- **Téc. Jimena Flores** (Técnico DPA): 35 años, computadora de escritorio. Frase: "Si pudiera ver todo en pantalla con el historial, mi trabajo cambiaría completamente." Adopción: si los reportes se generan automáticamente.
- **Ing. Marco Quispe** (Admin. Sistema): 30 años, perfil técnico alto. Frase: "Necesito que sea desplegable en nuestros servidores sin dependencias externas raras." Adopción: si tiene panel de admin con auditoría y no requiere intervención en BD.

**Incorporación al artefacto:** Integrado en `MRD_v1.md` §4.2 (Personas 1–4).

---

## Sección 5: Métricas de Calidad de Prompts (AI-SDLC)

| Métrica | Definición | Valor actual | Umbral objetivo |
|---------|-----------|--------------|-----------------|
| **Prompt coverage** | % de casos de uso críticos del FSD con prompt-contrato documentado en este PROMPT_MAPPINGS.md | 3/5 = 60 % | ≥ 80 % |
| **Spec fidelity** | % de secciones de documentos generados por IA que respetan los IDs y trazabilidad de los documentos previos (BR-*, PRD-REQ-*, FSD-UC-*) | ~90 % (revisión manual) | ≥ 90 % |
| **Hallucination rate** | % de afirmaciones en documentos generados sin trazabilidad a una fuente del BRD/PRD/visión de negocio | < 5 % (revisado en PR humano) | ≤ 5 % |
| **Reversion rate** | % de secciones generadas por IA que fueron revertidas o descartadas tras revisión | ~10 % (ajustes manuales menores) | ≤ 10 % |

> **Acciones de mejora:** Aumentar la prompt coverage a ≥ 80 % generando los prompt-contratos para FSD-UC-001 (autenticación) y FSD-UC-004 (consulta de información laboral) antes del cierre del Sprint 1.

---

## Sección 6: Convenciones y Guía de Uso

### Cómo añadir una nueva entrada

```markdown
### PR-[DOC]-[NNN] — [Título descriptivo]

**Fecha:** dd/mm/aaaa
**Documento destino:** `nombre_archivo.md`
**Secciones afectadas:** §X, §Y

---

**Input:**
[Descripción de los datos/contexto entregados a la IA]

**Prompt:**
[Texto exacto del prompt utilizado]

**Output:**
[Descripción del resultado obtenido y cómo se incorporó al artefacto]

**Incorporación al artefacto:** [Qué se usó directamente, qué se ajustó manualmente y por qué]
```

### Reglas del registro

1. **Toda interacción de IA que genere o modifique un artefacto del proyecto debe registrarse aquí.**
2. Los ajustes manuales post-generación deben documentarse en "Incorporación al artefacto".
3. Los IDs de prompts deben referenciarse en el §0 Metadatos del documento destino (campo "Prompts utilizados").
4. Este documento se actualiza en cada sprint; el log de la sección §5 (métricas) se revisa quincenalmente.
5. Los prompts de Vibe Coding (exploratorios) se registran con el prefijo `PR-VIBE-*`.

---

## Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v1.0 | 10/05/2026 | Equipo SGAI | Versión inicial — 12 entradas de prompts documentadas (BRD: 2, PRD: 2, FSD: 5, MRD: 3) |
