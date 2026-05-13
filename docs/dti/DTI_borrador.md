# Documento Técnico Inicial del Producto (DTI) — Borrador v0.1
# Sistema de Gestión Académica Integral (SGAI)

> **Estado:** BORRADOR — Secciones §0 y §1 esbozadas. Secciones §2–§21 contienen estructura esqueleto lista para completar en iteraciones siguientes. Este documento es el **contrato técnico inicial** del SGAI: legible tanto por ingenieros humanos como por agentes de IA que operen sobre este repositorio.

---

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| Producto | Sistema de Gestión Académica Integral (SGAI) |
| Grupo | G01 |
| Versión | v0.1 — Borrador |
| Fecha | 10/05/2026 |
| Arquitecto responsable | Líder Técnico — Equipo de Desarrollo SGAI |
| Stakeholders | Director DPA (Sponsor), Unidad de TI (infraestructura), Administradores de Facultad (usuarios clave), Equipo de Desarrollo |
| Estado | **Borrador** — Pendiente de revisión por arquitecto y sponsor |
| Repositorio | `https://github.com/[org]/sgai` *(pendiente de crear)* |
| Enlace al BRD | `docs/brd/BRD_v2.md` |
| Enlace al MRD | `docs/mrd/MRD_v1.md` |
| Enlace al PRD | `docs/prd/PRD_v1.md` |
| Enlace al FSD | `docs/fsd/FSD_v1.md` |
| Enlace al LFSD | `docs/fsd/LFSD.md` |
| Enlace a `AGENTS.md` | `/AGENTS.md` *(pendiente de crear — ver §21)* |
| Enlace a `PROMPT_MAPPING.md` | `docs/PROMPT_MAPPINGS.md` |
| Diagrama C4 Nivel 1 | `docs/architecture/C4_nivel_1.md` ✅ |
| ADR registradas | `docs/adr/ADR_candidatas.md` ✅ |

### 0.1 Alcance de este borrador

Este borrador cubre:
- **§0 Metadatos:** completo.
- **§1 Visión del Producto:** completo — define el problema, usuarios, propuesta de valor, métricas y restricciones.
- **§2–§21:** Estructura esqueleto con notas de qué debe completarse en cada sección y referencias a los documentos de la cadena (BRD → MRD → PRD → FSD).

Las secciones §2 (Contexto del Sistema con C4 completo), §3 (Arquitectura de alto nivel), §4 (Modelo de Dominio), §5 (Arquitectura Hexagonal), §8 (Despliegue), §9 (Capa de IA) y §12 (POCs) se desarrollan en detalle en la siguiente iteración del DTI (v0.2).

---

## 1. Visión del Producto

> **Guía de lectura:** Esta sección responde al "¿por qué existe el SGAI y qué lo hace diferente?". Está escrita en lenguaje de negocio, es la fuente de verdad para cualquier agente de IA que opere sobre este repositorio, y es coherente con el BRD_v2.md §3 y el MRD_v1.md §1.

---

### 1.1 Problema

Las universidades públicas bolivianas (sistema CEUB) operan con más de 1.500 docentes por institución gestionando su ciclo académico-administrativo completo —declaraciones juradas, planificación de oferta académica, información laboral y financiera— **100 % en papel y de forma presencial**. Esto genera:

- **Ciclos de aprobación de 5 a 15 días hábiles** por trámite de oferta académica (30+ trámites por semestre), con una tasa de devolución por errores del ~30 %.
- **Cero trazabilidad** de decisiones: observaciones escritas a mano sobre documentos físicos, sin historial auditable.
- **800+ horas-persona anuales** invertidas por el DPA en gestión manual de documentación.
- **Imposibilidad de trabajo remoto** para los técnicos DPA, ya que toda la documentación es física.
- **Docentes sin acceso self-service** a su información laboral (horarios, boletas de pago): deben desplazarse físicamente para cualquier consulta.

El costo de no actuar es la perpetuación de esta ineficiencia, el deterioro de la planificación académica y el incumplimiento progresivo de los plazos normativos del CEUB.

**Fuente de evidencia:** 15 entrevistas con usuarios (8 docentes, 4 administradores de facultad, 2 técnicos DPA, 1 director DPA) — BRD_v2.md §3.3.

---

### 1.2 Usuarios Objetivo

El SGAI tiene cuatro usuarios primarios, siguiendo la abstracción de **Person** del C4 Model (c4model.com/abstractions):

| Usuario | Descripción | Volumen | Criticidad de adopción |
|---------|-------------|---------|------------------------|
| **Docente** | Docente universitario (titular, interino, investigador) | 1.500+ | Alta — es el usuario final de mayor volumen |
| **Administrador de Facultad** | Secretario académico de facultad | 15–20 | Muy alta — multiplica el impacto en sus 80+ docentes |
| **Técnico DPA** | Técnico del Departamento de Planificación Académica | 3–5 | Crítica — es el cuello de botella del proceso actual |
| **Administrador del Sistema** | Técnico de la Unidad de TI | 1–2 | Alta — habilita el acceso de todos los demás usuarios |

**Descripción detallada de personas:** MRD_v1.md §4.2 (4 personas completas con demografía, dolores y comportamiento digital).

---

### 1.3 Propuesta de Valor

El SGAI es una **plataforma web institucional** que digitaliza y centraliza el ciclo académico-administrativo docente, diseñada específicamente para el contexto normativo boliviano (CEUB, Ley N° 164). Su propuesta de valor diferenciada en tres dimensiones:

1. **Digitalización completa del flujo de aprobación:**
   El SGAI convierte el proceso manual de 5–15 días en un flujo digital trazable con aprobación multinivel (Docente → Facultad → DPA), con historial auditable de cada decisión y notificaciones automáticas. El objetivo es reducir el ciclo a **≤ 2 días hábiles**.

2. **Acceso self-service para el docente:**
   Los 1.500+ docentes acceden desde cualquier navegador a sus declaraciones juradas, horarios de clase, carga horaria, calendario académico y boletas de pago —sin presencialidad ni trámites intermediados.

3. **Integración sin modificar los sistemas legados:**
   El SGAI se conecta al sistema de nómina y al sistema de información institucional mediante adaptadores desacoplados de solo lectura, preservando la integridad de los sistemas existentes y respetando los límites de la Unidad de TI.

**Diferencial clave vs. competencia:** Ninguna solución disponible (SIU-Guaraní, Google Workspace, ERPs genéricos) combina las tres dimensiones anteriores con cumplimiento nativo de la normativa boliviana y operación en servidores locales. Análisis completo: MRD_v1.md §6 y §7.2 (Océano Azul).

---

### 1.4 Métricas de Éxito del Producto

**North Star Metric:**

> **Tiempo medio de aprobación de oferta académica** (días hábiles) — Línea base: 5–15 días → Meta: **≤ 2 días hábiles** — Horizonte: Q1 2027.

**Métricas secundarias:**

| ID | KPI | Línea base | Meta | Horizonte | Fuente del dato |
|----|-----|------------|------|-----------|-----------------|
| KPI-02 | Tasa de adopción digital de DJ (% procesadas digitalmente) | 0 % (papel) | ≥ 90 % | Q1 2027 | Logs del sistema SGAI |
| KPI-03 | Satisfacción del docente (CSAT, escala 1–5) | Por medir antes del lanzamiento | ≥ 4/5 | Q2 2027 | Encuesta semestral |
| KPI-04 | % de docentes que consultan horarios/boletas sin trámite presencial | 0 % | 100 % | Q2 2027 | Logs de acceso SGAI |

**Métricas técnicas de referencia para el DTI:**

| ID | NFR | Umbral | Verificación |
|----|-----|--------|--------------|
| NFR-001 | Latencia de operaciones CRUD (p95) | < 2 s | k6 en staging |
| NFR-003 | Uptime en horario hábil (7:00–22:00) | ≥ 99 % mensual | Uptime Robot |
| NFR-008 | Usuarios concurrentes soportados | ≥ 200 simultáneos | k6 stress test |

NFRs completos con umbrales y mecanismo de verificación: FSD_v1.md §10 y §11 de este DTI (pendiente de completar en v0.2).

---

### 1.5 Restricciones de Negocio

Las siguientes restricciones son **no negociables** y deben reflejarse en toda decisión arquitectónica:

| ID | Restricción | Origen | Impacto arquitectónico |
|----|-------------|--------|------------------------|
| RES-01 | El sistema debe cumplir la **Ley N° 164 de Telecomunicaciones y TIC de Bolivia** (seguridad, privacidad de datos, soberanía de la información) | Normativo — Estado Plurinacional de Bolivia | Cifrado AES-256 en reposo, TLS 1.2+ en tránsito, sin exfiltración de datos a servidores externos no aprobados |
| RES-02 | El sistema debe **operar en servidores locales de la universidad** — sin infraestructura cloud pública sin aprobación explícita de la Unidad de TI | Política institucional de la Unidad de TI | Stack tecnológico desplegable on-premise; no se puede asumir servicios AWS/GCP/Azure sin autorización |
| RES-03 | Los **sistemas legados de nómina y el sistema institucional no pueden modificarse** — el SGAI solo los consume en modo solo lectura | Restricción técnica-organizacional | Adaptadores de integración desacoplados con interfaz `ILegacyAdapter`; operación en modo degradado si el legado no está disponible |
| RES-04 | **Presupuesto CAPEX máximo: USD 45.000** para el desarrollo completo (v1.0) | Presupuesto institucional aprobado | Stack de tecnologías open-source sin costos de licencia; equipo de desarrollo reducido (2–4 devs) |
| RES-05 | **Plazo de entrega de MVP (v0.1): Q3 2026** | Plan estratégico institucional 2024–2028 | Desarrollo incremental con entregas funcionales cada 2–3 semanas; priorización agresiva del backlog |
| RES-06 | El sistema debe ser **mantenible por la Unidad de TI universitaria** sin dependencia de proveedor externo post-lanzamiento | Soberanía tecnológica institucional | Código fuente propio; documentación técnica completa; stack tecnológico conocido por el equipo de TI local |
| RES-07 | Los flujos de aprobación deben cumplir el **reglamento interno universitario y las normativas del CEUB** (Comité Ejecutivo de la Universidad Boliviana) | Normativo institucional | Reglas de negocio embebidas en el dominio (no en la UI); versionado de reglas de negocio configurable |

---

### 1.6 Principios de Diseño (Constitution del Producto)

Los siguientes principios son **invariantes del producto** — ninguna decisión técnica, de diseño o de implementación puede violarlos:

1. **Las reglas de negocio viven en el dominio, no en la UI.** Las máquinas de estados de DJ y Oferta Académica son responsabilidad del dominio; cualquier canal (web, API, agente) obtiene el mismo resultado.
2. **Ningún flujo crítico requiere presencia física.** El sistema es el reemplazo completo del proceso presencial, no un complemento.
3. **Los datos sensibles (PII, boletas de pago, CI) nunca se loggean en texto plano**, ni en desarrollo, ni en staging, ni en producción.
4. **La información de un docente solo es visible para ese docente y para los roles con permisos explícitos definidos en el dominio.** Especialmente: las boletas de pago son exclusivas del docente titular (validación a nivel de API con JWT, no solo a nivel de UI).
5. **El sistema opera en modo degradado si los sistemas legados no están disponibles**, mostrando los últimos datos sincronizados con timestamp visible y advertencia al usuario.

---

## 2. Contexto del Sistema

> **Estado:** Sección §2.1 (Diagrama C4 Nivel 1) se encuentra en el documento externo `docs/architecture/C4_nivel_1.md` ✅. Las subsecciones §2.2 (tabla de actores externos) y los diagramas C4 Niveles 2 y 3 se completan en DTI v0.2.

### 2.1 Diagrama C4 — Nivel 1 (Contexto)

**→ Ver documento completo:** `docs/architecture/C4_nivel_1.md`

**Resumen ejecutivo del contexto:**
El SGAI es el sistema central. Cuatro tipos de personas lo usan (Docente, Administrador de Facultad, Técnico DPA, Administrador del Sistema) exclusivamente vía navegador web. El SGAI consume —sin modificar— cuatro sistemas externos: Sistema de Nómina (boletas de pago), Sistema de Información Institucional (materias y asignaciones), Servidor SMTP (notificaciones) y Directorio LDAP/AD (autenticación).

### 2.2 Actores Externos y Dependencias

| Actor / Sistema | Tipo | Dirección | Criticidad | Protocolo tentativo |
|-----------------|------|-----------|------------|---------------------|
| Sistema de Nómina | Sistema externo legado | Entrada (datos de boletas) | Alta | REST / BD solo lectura / batch — *por confirmar en Sprint 0* |
| Sistema de Información Institucional | Sistema externo legado | Entrada (materias, asignaciones) | Alta | REST / BD solo lectura / batch — *por confirmar en Sprint 0* |
| Servidor SMTP Institucional | Infraestructura institucional | Salida (notificaciones) | Media | SMTP / SMTPS |
| Directorio LDAP/AD | Infraestructura institucional | Entrada (autenticación) | Alta | LDAP / LDAPS |

> **TODO DTI v0.2:** Completar con protocolos confirmados tras el Sprint 0 de análisis técnico de sistemas legados (Task T-008 del LFSD.md).

### 2.3 Diagramas C4 Niveles 2 y 3

> **TODO DTI v0.2:** Añadir aquí el Diagrama C4 Nivel 2 (Contenedores del SGAI: SPA React, API Node.js, BD PostgreSQL, Worker de notificaciones, Adaptadores de integración) y el Diagrama C4 Nivel 3 del módulo M-DJ (componentes: DJ Controller, DJ Application Service, DJ Domain Service, DJ Repository, State Machine Service).

---

## 3. Arquitectura de Alto Nivel

> **Estado:** Borrador — decisión tomada, justificación pendiente de expansión en DTI v0.2.

### 3.1 Estilo Arquitectónico Adoptado

- [x] **Monolito modular** con **arquitectura hexagonal (Clean Architecture)** en el núcleo de dominio.

**Justificación ejecutiva:**
Dado el contexto del SGAI —equipo de desarrollo pequeño (2–4 devs), presupuesto CAPEX de USD 45.000, necesidad de mantenimiento por Unidad de TI local con capacidades técnicas estándar, y dominio de negocio con reglas de negocio fuertes y bien delimitadas— el monolito modular es la elección óptima. Los microservicios añadirían complejidad operativa (service discovery, distributed tracing, contratos de API entre servicios) sin beneficio real para el volumen esperado (≤ 200 usuarios concurrentes). La arquitectura hexagonal en el core garantiza que las reglas de negocio sean independientes del stack tecnológico y testeables de forma unitaria.

**ADR asociado:** `docs/adr/ADR_candidatas.md` — ADR-0001 (Adopción de monolito modular con arquitectura hexagonal).

> **TODO DTI v0.2:** Añadir diagramas C4 Nivel 2 y Nivel 3, diagrama de flujo de datos del caso de uso más crítico (Ciclo de DJ — FSD-UC-002).

---

## 4. Modelo de Dominio

> **Estado:** Borrador — entidades y bounded contexts identificados. Desarrollo completo en DTI v0.2.

### 4.1 Bounded Contexts (Identificados)

| Contexto | Responsabilidad | Entidades principales | Tipo de integración |
|----------|-----------------|-----------------------|---------------------|
| `DeclaracionJurada` | Ciclo de vida completo de las DJ (máquina de estados, historial) | `DeclaracionJurada`, `HistorialDJ` | Síncrona con `GestionDocente`; evento a `Notificaciones` |
| `OfertaAcademica` | Ciclo de vida de la oferta académica (elaboración, revisión, aprobación) | `OfertaAcademica`, `AsignacionDocente`, `HistorialOferta` | Síncrona con `GestionAcademica`; evento a `Notificaciones` |
| `GestionDocente` | Perfil, CV, roles y estado de vinculación del docente | `Docente`, `PerfilDocente`, `RolDocente` | Consumidor de `SistemaInstitucional` (adaptador) |
| `GestionAcademica` | Materias, carreras, horarios, carga horaria, calendario (datos sincronizados) | `Materia`, `Carrera`, `AsignacionHoraria`, `CalendarioAcademico` | Consumidor de `SistemaInstitucional` (adaptador) |
| `InformacionFinanciera` | Boletas de pago (datos sincronizados desde nómina) | `BoletaPago` | Consumidor de `SistemaNomina` (adaptador) |
| `Administracion` | Usuarios, roles, permisos, auditoría del sistema | `Usuario`, `Rol`, `Permiso`, `LogAuditoria` | Transversal — todos los bounded contexts |
| `Notificaciones` | Envío de correos institucionales ante cambios de estado | `NotificacionPendiente` | Consumidor de eventos de DJ y OfertaAcademica; productor hacia SMTP |

> **TODO DTI v0.2:** Desarrollar §4.2 (Aggregates, Entities, Value Objects) y §4.3 (DTOs principales) con el detalle del modelo ER de FSD_v1.md §6.

---

## 5. Arquitectura Hexagonal del Core

> **Estado:** Borrador — puertos y adaptadores identificados. Diagrama y tabla completos en DTI v0.2.

### 5.1 Decisión arquitectónica

El módulo de dominio (`domain/`) es totalmente independiente de Express, Prisma, React o cualquier framework. Los casos de uso son clases/funciones puras que solo dependen de interfaces (puertos). Los adaptadores implementan esas interfaces y viven fuera del dominio.

### 5.2 Puertos Identificados (Borrador)

| Puerto | Tipo | Propósito |
|--------|------|-----------|
| `EnviarDeclaracionJuradaUseCase` | Input | Ejecuta la transición de estado de una DJ |
| `ProcesarOfertaAcademicaUseCase` | Input | Ejecuta la transición de estado de un trámite de oferta |
| `ConsultarBoletasPagoUseCase` | Input | Obtiene las boletas del docente autenticado |
| `DeclaracionJuradaRepository` | Output | Persistencia de DJ e historial |
| `OfertaAcademicaRepository` | Output | Persistencia de ofertas e historial |
| `NotificacionPublisher` | Output | Publicación de eventos de notificación |
| `LegacyNominaAdapter` | Output | Lectura de boletas desde el sistema de nómina |
| `LegacySistemaInstitucionalAdapter` | Output | Lectura de materias y asignaciones |

> **TODO DTI v0.2:** Completar §5.1 (tabla de puertos completa), §5.2 (tabla de adaptadores), §5.3 (diagrama Mermaid de puertos y adaptadores).

---

## 6. Arquitectura Distribuida

> **No aplica en v1.0.** El SGAI es un monolito modular. No hay microservicios, mensajería distribuida ni sagas. La comunicación asíncrona (notificaciones SMTP) se implementa con una cola en proceso (Bull + Redis) dentro del monolito, no como servicios distribuidos independientes.

**Si en una versión futura se decide separar el Worker de notificaciones como servicio independiente, se creará un ADR antes de ejecutar esa separación.**

---

## 7. Arquitectura Asíncrona / Event-Driven

> **Estado:** Borrador — mecanismo identificado. Detalle completo en DTI v0.2.

El SGAI usa procesamiento asíncrono limitado y bien delimitado:

- **Notificaciones SMTP:** Encoladas con Bull (Redis) dentro del monolito. Retries automáticos con backoff exponencial (3 intentos). Dead Letter Queue para mensajes que fallaron 3 veces, con log de error para monitoreo.
- **Sincronización con sistemas legados:** Proceso batch programado (cron job) que ejecuta los adaptadores de nómina y sistema institucional. No hay publicación de eventos hacia sistemas externos.

No se implementa event sourcing ni CQRS en v1.0. La trazabilidad de cambios de estado se garantiza mediante tablas de historial (HISTORIAL_DJ, HISTORIAL_OFERTA) en la base de datos relacional.

> **TODO DTI v0.2:** Añadir catálogo de eventos internos y diagrama de flujo del Worker de notificaciones.

---

## 8. Despliegue — On-Premise Universitario

> **Estado:** Borrador — contexto y restricciones definidas. Diagrama y configuraciones en DTI v0.2.

### 8.1 Contexto de Despliegue

El SGAI se despliega **on-premise en servidores de la Unidad de TI universitaria** (RES-02). No se usa infraestructura cloud pública sin aprobación. El stack de despliegue debe ser:

- Desplegable con Docker Compose en un servidor Linux Ubuntu 22.04 LTS.
- Operado por el equipo de TI universitario sin conocimientos avanzados de Kubernetes o cloud.
- Mínimo 2 entornos: staging y producción.

### 8.2 Componentes de Despliegue (Identificados)

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| Servidor web / proxy inverso | Nginx | Maneja HTTPS, sirve el frontend SPA, hace proxy a la API |
| API Backend | Node.js 20 LTS + Express | Runtime estable, familiar para el equipo de TI local |
| Base de datos | PostgreSQL 15 | Relacional con transacciones ACID; soporte nativo en Ubuntu |
| Cola de tareas | Redis 7 + Bull | Liviano; requerido solo para notificaciones asíncronas |
| Frontend | React 18 (build estático, servido por Nginx) | SPA sin servidor de renderizado; bajo costo operativo |

### 8.3 Entornos

| Entorno | Propósito | Infraestructura |
|---------|-----------|-----------------|
| `dev` | Desarrollo local de los devs | Docker Compose en laptop/workstation |
| `staging` | QA, pruebas de integración, demo al sponsor | Servidor de la Unidad de TI — VM dedicada |
| `production` | Uso en producción institucional | Servidor de la Unidad de TI — VM dedicada (diferente de staging) |

### 8.4 Estrategia de Disaster Recovery

- **RPO objetivo:** ≤ 24 horas (backup diario de la BD PostgreSQL).
- **RTO objetivo:** ≤ 4 horas (restauración desde backup + reinicio de contenedores Docker).
- **Estrategia:** Backup-Restore (apropiada para el presupuesto y los recursos de TI disponibles).

> **TODO DTI v0.2:** Diagrama de despliegue Mermaid, scripts de Docker Compose, configuración de Nginx, política de backups.

---

## 9. Capa de IA / Agentes

> **Estado:** Borrador — el SGAI v1.0 no incluye capa de IA en el producto final. Esta sección documenta el uso de IA en el proceso de desarrollo (AI-SDLC).

### 9.1 IA en el Producto (v1.0)

El SGAI v1.0 **no incluye componentes de inteligencia artificial** en la plataforma entregada al usuario. No hay agentes, RAG, chatbots ni clasificadores automáticos en el producto.

**Evaluación para versiones futuras (v2.0+):**
- Clasificación automática de tipos de DJ para pre-completar formularios.
- Detección de anomalías en la oferta académica (materias sin docente asignado, carga horaria inconsistente).
- Chatbot de soporte para el docente (consultas de estado de trámites en lenguaje natural).

### 9.2 IA en el Proceso de Desarrollo (AI-SDLC)

El SGAI fue construido con un proceso **AI-Native** documentado en `docs/PROMPT_MAPPINGS.md`. El modelo de IA utilizado es **Claude Sonnet (Anthropic)** a través de la interfaz claude.ai.

Artefactos generados con asistencia de IA (con revisión humana obligatoria):
- BRD_v2.md, MRD_v1.md, PRD_v1.md, FSD_v1.md, LFSD.md — cadena documental completa.
- Modelo de datos ER (FSD_v1.md §6).
- Prompt-contratos funcionales (FSD_v1.md §7).
- C4_nivel_1.md (este ciclo).

**Política de revisión:** Todo artefacto generado por IA pasa por revisión humana antes de ser considerado válido. Las correcciones manuales se documentan en la sección "Incorporación al artefacto" del `PROMPT_MAPPINGS.md`.

> **TODO DTI v0.2:** Si se incorpora IA en el producto, completar §9.1 con arquitectura agéntica, herramientas y guardrails. Si no, esta sección permanece como documentación del AI-SDLC.

---

## 10. Estrategia de Prompt Mapping

El catálogo completo de prompts utilizados en el desarrollo del SGAI vive en:

**`docs/PROMPT_MAPPINGS.md`** — 12 entradas documentadas (BRD: 2, PRD: 2, FSD: 5, MRD: 3).

| Artefacto | Prompts asociados | IDs |
|-----------|-------------------|-----|
| BRD_v2.md | Refinamiento estratégico, BMC y riesgos | PR-BRD-001, PR-BRD-002 |
| PRD_v1.md | PRD completo, criterios Gherkin E1 | PR-PRD-001, PR-PRD-002 |
| FSD_v1.md / LFSD.md | FSD+LFSD, modelo ER, prompt-contratos, tasks backend, máquina de estados | PR-FSD-001 a PR-FSD-005 |
| MRD_v1.md | MRD completo, análisis competitivo, personas | PR-MRD-001, PR-MRD-002, PR-MRD-003 |
| C4_nivel_1.md | Diagrama de contexto C4 | PR-DTI-001 *(añadir en siguiente sesión)* |

---

## 11. NFRs Consolidados

> Espejo de FSD_v1.md §10. Fuente de verdad para todos los agentes que operen sobre este repositorio.

| ID | Categoría | Umbral | Mecanismo de verificación |
|----|-----------|--------|---------------------------|
| NFR-001 | Rendimiento | Latencia CRUD p95 < 2 s | k6 en staging |
| NFR-002 | Rendimiento | Generación de reportes < 10 s | Test funcional automatizado |
| NFR-003 | Disponibilidad | Uptime ≥ 99 % mensual (horario hábil) | Uptime Robot |
| NFR-004 | Seguridad | Cifrado en reposo AES-256 (PII, financiero) | Auditoría de configuración BD |
| NFR-005 | Seguridad | Cifrado en tránsito TLS 1.2+ | SSL Labs |
| NFR-006 | Seguridad | Expiración de sesión por inactividad ≤ 8 h | Test automatizado de sesión |
| NFR-007 | Cumplimiento | Ley 164 Bolivia — 100 % cumplimiento | Revisión legal + auditoría |
| NFR-008 | Escalabilidad | ≥ 200 usuarios concurrentes | k6 stress test |
| NFR-009 | Observabilidad | 100 % de requests con correlationId | Revisión de logs en producción |
| NFR-010 | Mantenibilidad | Cobertura de tests ≥ 80 % en dominio core | Reporte Jest/Vitest en CI |

---

## 12. POCs Críticas

> **Estado:** Identificadas. Detalle completo siguiendo `POC_TEMPLATE.md` en DTI v0.2.

### 12.1 POC-01 — Integración con Sistemas Legados

- **Riesgo que mitiga:** Los sistemas legados de nómina y sistema institucional no tienen documentación de API; el mecanismo de integración es desconocido. Si no se puede integrar, el módulo de boletas y horarios no tiene datos.
- **Hipótesis:** Es posible leer datos del sistema de nómina y del sistema institucional mediante al menos un mecanismo (REST API, consulta directa a BD solo lectura, o archivo de exportación programado) sin modificar los sistemas de origen.
- **Criterio de éxito medible:** En un entorno de prueba provisto por la Unidad de TI, el adaptador del SGAI recupera al menos 10 boletas de pago reales y 20 asignaciones docentes correctamente en < 5 s de latencia.
- **Alcance (scope reducido):** Solo la capa de integración (adaptador + prueba de lectura). No incluye la UI del SGAI.
- **Cronograma:** Sprint 0 — 5 días hábiles.
- **Resultado:** ⬜ Pendiente de ejecución.

### 12.2 POC-02 — Máquina de Estados de DJ bajo Concurrencia

- **Riesgo que mitiga:** Si dos administradores de facultad intentan aprobar/devolver la misma DJ en el mismo instante, puede generarse un estado inconsistente en la base de datos (race condition).
- **Hipótesis:** La transacción de Prisma que ejecuta el cambio de estado + INSERT en HISTORIAL_DJ de forma atómica previene estados inconsistentes incluso bajo carga concurrente moderada.
- **Criterio de éxito medible:** Bajo 50 requests concurrentes sobre la misma DJ con distintos comandos (APROBAR/DEVOLVER), la DJ termina en exactamente 1 estado final (sin estados duplicados ni entradas de historial huérfanas). Verificado con k6 + consulta a BD post-test.
- **Alcance:** Solo el endpoint `PATCH /declaraciones-juradas/:id/estado` con BD PostgreSQL en Docker. No incluye UI.
- **Cronograma:** Sprint 1 — 3 días hábiles.
- **Resultado:** ⬜ Pendiente de ejecución.

---

## 13. Seguridad

> **Estado:** Borrador — modelo de amenazas y controles identificados. Detalle en DTI v0.2.

### 13.1 Modelo de Amenazas (STRIDE resumido)

| Amenaza STRIDE | Superficie en el SGAI | Control mitigante |
|----------------|----------------------|-------------------|
| **Spoofing** (suplantación) | Endpoint de autenticación `/auth/login` | JWT firmado + bloqueo tras 5 intentos fallidos (RB-07) |
| **Tampering** (manipulación) | DJ aprobada/en revisión modificada sin autorización | Validación de estado en capa de dominio (RB-03); HTTP 403 + log de auditoría |
| **Repudiation** (repudio) | Actor niega haber aprobado/observado un trámite | Historial de auditoría con actor, timestamp y estado (BR-006); inmutable post-inserción |
| **Information Disclosure** (divulgación) | Acceso a boletas de pago de otro docente | Validación de `docente_id` JWT vs. `docente_id` de boleta (RB-04); HTTP 403 |
| **Denial of Service** | Saturación del endpoint de login o de generación de reportes | Rate limiting en API; generación de reportes asíncrona con cola |
| **Elevation of Privilege** | Docente que intenta ejecutar acciones de Admin. Facultad | Middleware de roles en cada endpoint; validación en capa de dominio; JWT con rol embebido |

### 13.2 AuthN / AuthZ

- **Autenticación:** JWT (JSON Web Tokens) con firma HS256. Expiración: 8 horas de inactividad. Bloqueo temporal (15 min) tras 5 intentos fallidos.
- **Autorización:** RBAC (Role-Based Access Control) con 4 roles: DOCENTE, ADMIN_FACULTAD, TECNICO_DPA, ADMIN_SISTEMA. El rol se embebe en el JWT y se valida en cada endpoint mediante middleware de Express.
- **Integración con LDAP/AD:** El bind LDAP se usa para validar credenciales en el login; las cuentas se almacenan localmente en la BD del SGAI después del primer login exitoso.

### 13.3 Gestión de Secretos

- Secretos (JWT secret, credenciales de BD, credenciales SMTP, credenciales LDAP) almacenados en variables de entorno (`.env` nunca commiteado al repositorio).
- En staging y producción: variables de entorno en el archivo de Docker Compose, gestionado por la Unidad de TI.
- **No usar AWS Secrets Manager** en v1.0 (restricción on-premise).

### 13.4 Cumplimiento Ley 164 Bolivia

- Cifrado AES-256 en reposo para datos PII (CI, datos laborales, financieros).
- TLS 1.2+ para todos los endpoints.
- Datos personales almacenados exclusivamente en servidores locales de la universidad.
- Política de retención de datos: según reglamento universitario (a definir con Asesoría Legal antes del lanzamiento).

> **TODO DTI v0.2:** Completar con análisis de seguridad específico de la capa de integración con sistemas legados.

---

## 14. Observabilidad

> **Estado:** Borrador — estrategia definida. Implementación en Sprint 2.

- **Logs estructurados:** JSON con campos: `timestamp`, `level`, `correlationId`, `userId`, `action`, `module`, `durationMs`. Ningún campo PII en los logs.
- **Métricas:** Contador de requests por endpoint, latencia p50/p95/p99, tasa de errores 4xx/5xx, longitud de la cola Bull. Exportadas a un archivo de métricas en formato Prometheus-compatible.
- **Trazas:** `correlationId` generado en cada request y propagado a todos los módulos y logs de esa request.
- **Dashboards:** Panel Grafana básico desplegado junto al sistema en el entorno de producción (Grafana + Prometheus en Docker Compose).
- **Alertas mínimas:** Alerta si el uptime cae por debajo del 99 %; alerta si la cola de notificaciones tiene > 100 mensajes pendientes; alerta si la sincronización con sistemas legados falla 3 veces consecutivas.

---

## 15. DevOps y Ciclo de Vida

> **Estado:** Borrador — estrategia definida. Pipelines a implementar en Sprint 1.

- **Branching:** `main` (producción) + `develop` (integración) + `feature/[nombre]` (desarrollo). No se hace merge a `main` sin PR aprobado y CI verde.
- **CI/CD:** GitHub Actions. Pipeline de CI: lint → tests unitarios → tests de integración → build. Pipeline de CD: build Docker image → push a registry → deploy a staging (manual) → deploy a producción (manual con aprobación).
- **Testing:** Pirámide: unitarios (dominio, Jest, ≥ 80 % cobertura) → integración (endpoints, Supertest) → E2E (flujos críticos, Playwright) → carga (k6, antes de go-live).
- **Feature flags:** No en v1.0 por simplicidad. Si se necesita en v1.1, se evalúa una solución simple (variable de entorno o tabla de configuración en BD).
- **Rollback:** Si el deploy a producción falla, el rollback es manual: la Unidad de TI vuelve a la imagen Docker anterior. Tiempo estimado de rollback: < 15 min.

---

## 16. Antipatrones Auditados

| Antipatrón | ¿Se detectó? | Mitigación |
|------------|--------------|------------|
| Big Ball of Mud | No | Módulos separados por bounded context con interfaces explícitas |
| God Service / God Class | Riesgo identificado en `DeclaracionJuradaService` | Separar el servicio de dominio del servicio de aplicación; máx. 5 responsabilidades por clase |
| Distributed Monolith | No aplica | El SGAI es un monolito modular intencionalmente; no hay servicios distribuidos en v1.0 |
| Leaky Abstraction | Riesgo en adaptadores de legados | Interfaz `ILegacyAdapter` con contrato estricto; los detalles del sistema legado no se filtran al dominio |
| Shared Database (entre servicios) | No aplica | Una sola BD; el acceso está mediado por repositorios del dominio |
| Hardcoded Business Rules en la UI | Riesgo identificado | Principio de diseño #1: las reglas de negocio viven en el dominio, no en la UI |
| Data Swamp | Riesgo en sincronización de legados | Data contracts definidos en los adaptadores; logs de errores de sincronización; validación de schema en la ingesta |

---

## 17. Trade-offs Arquitectónicos

| Decisión | Opción elegida | Alternativas descartadas | Razones | Consecuencias | ADR |
|----------|----------------|--------------------------|---------|---------------|-----|
| Estilo arquitectónico | Monolito modular + hexagonal | Microservicios | Equipo pequeño, presupuesto limitado, operación por TI local | Mayor acoplamiento entre módulos; escalabilidad horizontal limitada (mitigable con réplicas de lectura) | ADR-0001 |
| Stack de backend | Node.js 20 + Express | Spring Boot (Java), Django (Python) | Familiaridad del equipo, ecosistema npm maduro, menor footprint de memoria en servidores locales | Sin tipado estático nativo (mitigado con TypeScript); concurrencia I/O no bloqueante adecuada para el patrón de uso | ADR-0001 |
| Base de datos | PostgreSQL 15 | MongoDB, DynamoDB, MySQL | Transacciones ACID requeridas por las máquinas de estados; JSON nativo para campos dinámicos de DJ; soporte robusto en Ubuntu | Escalar escrituras requiere sharding (no necesario en v1.0) | ADR-0001 |
| Integración con legados | Adaptadores de solo lectura | Replicación completa de datos, modificación del sistema legado | RES-03 (no modificar legados); menor riesgo institucional | Dependencia de disponibilidad del sistema legado; modo degradado requerido | ADR-0002 |
| Autenticación | JWT stateless | Sesiones en servidor, OAuth2 externo | Sin servidor de estado adicional; operación on-premise simple; compatible con el LDAP institucional | Revocación de tokens requiere blacklist (aceptable con expiración corta de 8 h) | ADR-0003 |

---

## 18. Riesgos Técnicos

| Riesgo | Prob. | Impacto | Mitigación | Plan de contingencia |
|--------|-------|---------|------------|----------------------|
| Sistemas legados sin API ni documentación técnica | Alta | Alto | Sprint 0 dedicado a análisis técnico (T-008); POC-01 | Diseñar módulos de boletas y horarios con modo degradado; v1.0 puede lanzarse sin estas integraciones si POC-01 falla |
| Race condition en máquina de estados de DJ bajo concurrencia | Media | Alto | POC-02 + transacciones atómicas Prisma; test k6 pre-launch | Agregar `SELECT FOR UPDATE` si las transacciones no son suficientes |
| Capacidad insuficiente de los servidores de TI universitarios | Media | Medio | Solicitar especificaciones de hardware antes de Q3 2026; Docker Compose permite escalar verticalmente | Optimizar queries y reducir footprint de memoria si el hardware es limitado |
| Acoplamiento entre bounded contexts que dificulta el mantenimiento | Media | Medio | Code review con foco en dependencias entre módulos; tests de integración que detecten regresiones cross-module | Refactorizar el módulo acoplado en v1.1 si se detecta en sprints tempranos |
| Incumplimiento de Ley 164 por configuración incorrecta de cifrado | Baja | Alto | Revisión legal antes del go-live; auditoría de configuración de BD en staging | Rollback inmediato si se detecta en producción; notificación al sponsor y Asesoría Legal |

---

## 19. Roadmap Técnico

| Fase | Actividades técnicas principales | Entregables |
|------|----------------------------------|-------------|
| **Ahora — Sprint 0 (Q2 2026)** | DTI borrador, C4 Nivel 1, POC-01 (análisis de integración con legados), POC-02 (máquina de estados), ADRs candidatas | `DTI_borrador.md`, `C4_nivel_1.md`, `ADR_candidatas.md`, resultado de POC-01 y POC-02 |
| **Sprint 1–2 (Q3 2026 inicio)** | Setup del proyecto, autenticación JWT, módulo M-DJ (CRUD + máquina de estados), módulo M-ADMIN básico | MVP parcial con DJ y autenticación operativos |
| **Sprint 3–4 (Q3 2026)** | Módulo M-OFERTA, adaptadores de integración (resultado de POC-01), notificaciones SMTP | MVP completo — todos los módulos críticos operativos |
| **Sprint 5–6 (Q4 2026)** | Módulos M-BOLETAS, M-INFO-LABORAL, M-PERFIL, M-REPORTES, pruebas E2E y de carga | v1.0 completa lista para producción |
| **Post-lanzamiento (Q1 2027)** | Monitoreo, corrección de errores, medición de KPIs, planificación de v1.1 | Reporte de KPIs Q1 2027 (North Star: ≤ 2 días hábiles) |

---

## 20. Glosario y Referencias

### Glosario

| Término | Definición |
|---------|------------|
| DJ | Declaración Jurada — documento institucional obligatorio para docentes con vinculación activa |
| DPA | Departamento de Planificación Académica — unidad institucional que supervisa la planificación académica |
| CEUB | Comité Ejecutivo de la Universidad Boliviana — organismo rector del sistema universitario público boliviano |
| Bounded Context | Límite explícito dentro del cual un modelo de dominio es internamente consistente (DDD — Domain Driven Design) |
| Puerto (Port) | Interfaz que define cómo el dominio interactúa con el mundo exterior (Arquitectura Hexagonal) |
| Adaptador (Adapter) | Implementación concreta de un puerto que conecta el dominio con una tecnología específica (BD, API externa, SMTP, etc.) |
| Modo degradado | Estado del sistema en el que opera sin conexión a un sistema legado, mostrando los últimos datos sincronizados con advertencia al usuario |
| JWT | JSON Web Token — mecanismo de autenticación stateless; el token contiene el rol del usuario y no requiere consultar la BD en cada request |
| ILegacyAdapter | Interfaz común que implementan todos los adaptadores de sistemas legados; permite intercambiarlos sin cambiar el dominio |

### Referencias

- **C4 Model (oficial):** https://c4model.com — Simon Brown. CC BY 4.0.
- **Clean Architecture:** Robert C. Martin — *Clean Architecture: A Craftsman's Guide to Software Structure and Design* (2017).
- **Domain-Driven Design:** Eric Evans — *Domain-Driven Design: Tackling Complexity in the Heart of Software* (2003).
- **Hexagonal Architecture:** Alistair Cockburn — *Hexagonal Architecture* (2005). https://alistair.cockburn.us/hexagonal-architecture/
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Bull (Cola de tareas Node.js):** https://github.com/OptimalBits/bull
- **Prisma ORM:** https://www.prisma.io/docs
- **Documentación de la cadena documental SGAI:** BRD_v2.md, MRD_v1.md, PRD_v1.md, FSD_v1.md, LFSD.md, PROMPT_MAPPINGS.md.

---

## 21. Registro de Decisiones Arquitectónicas (ADR)

> Detalle completo de las decisiones candidatas en `docs/adr/ADR_candidatas.md`.

| ADR | Título | Estado | Fecha |
|-----|--------|--------|-------|
| ADR-0001 | Adopción de monolito modular con arquitectura hexagonal y stack Node.js + PostgreSQL | **Propuesta** — Pendiente de aprobación en Sprint 0 | 10/05/2026 |
| ADR-0002 | Estrategia de integración con sistemas legados: adaptadores de solo lectura con modo degradado | **Propuesta** — Pendiente de validación en POC-01 | 10/05/2026 |
| ADR-0003 | Mecanismo de autenticación: JWT stateless + integración LDAP/AD institucional | **Propuesta** — Pendiente de revisión de seguridad | 10/05/2026 |
| ADR-0004 | *(Reservada)* Estrategia de despliegue on-premise con Docker Compose | **Propuesta** — Pendiente de revisión Unidad de TI | 10/05/2026 |

---

## Checklist de Entrega del DTI (Estado Actual — Borrador v0.1)

- [x] Visión del producto + métricas de éxito (§1 completo).
- [x] Diagrama C4 Nivel 1 en documento externo (`C4_nivel_1.md`).
- [ ] **TODO v0.2:** Diagramas C4 Niveles 2 y 3 del módulo crítico.
- [ ] **TODO v0.2:** Data flow diagram del caso de uso más crítico (Ciclo de DJ).
- [x] Modelo de dominio — bounded contexts identificados (§4.1 borrador).
- [ ] **TODO v0.2:** Aggregates, Entities, VOs, DTOs (§4.2, §4.3).
- [x] Arquitectura hexagonal — puertos y adaptadores identificados (§5 borrador).
- [ ] **TODO v0.2:** Tabla de puertos y adaptadores completa + diagrama Mermaid.
- [x] Arquitectura distribuida: no aplica en v1.0 (§6, justificado).
- [x] Despliegue on-premise — estrategia y componentes identificados (§8 borrador).
- [ ] **TODO v0.2:** Diagrama de despliegue Mermaid + Docker Compose sketch.
- [x] Capa de IA: no aplica en producto; uso en AI-SDLC documentado (§9).
- [x] NFRs completos con umbrales y verificación (§11).
- [x] 2 POCs críticas identificadas con criterio de éxito medible (§12).
- [x] Seguridad: modelo STRIDE, AuthN/AuthZ, Ley 164 (§13 borrador).
- [x] Observabilidad: estrategia definida (§14 borrador).
- [x] DevOps: estrategia de branching, CI/CD, testing, rollback (§15 borrador).
- [x] Antipatrones auditados (§16).
- [x] Trade-offs arquitectónicos con justificación (§17).
- [x] Riesgos técnicos (§18).
- [x] 3+ ADRs candidatas registradas (`ADR_candidatas.md`).
- [ ] **TODO:** `AGENTS.md` por crear (sincronizado con este DTI).
- [x] `PROMPT_MAPPING.md` sincronizado.

---

## Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v0.1 | 10/05/2026 | Equipo SGAI | Borrador inicial — §0 y §1 completos; §2–§21 en borrador estructurado |
