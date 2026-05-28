# PROMPT_MAPPINGS.md — Registro de Ingeniería de IA v2.0
# Sistema de Gestión Académica Integral (SGAI)

> **Versión 2.0 — Cambios:** +7 prompt-contracts (PR-FSD-UC-004 a PR-FSD-UC-010); métricas de Prompt Coverage y Spec Fidelity calculadas; sección de métricas de calidad AI-SDLC actualizada.

---

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| Proyecto | SGAI |
| Versión | v2.0 |
| Fecha | 10/05/2026 |
| Autor | Carolina Aguilar |
| Modelo de IA | Claude Sonnet (Anthropic) — claude.ai |
| Total de entradas | **19 prompts documentados** |

---

## 1. Métricas de Calidad AI-SDLC

| Métrica | Definición | Valor actual | Umbral objetivo | Estado |
|---------|-----------|--------------|-----------------|--------|
| **Prompt Coverage** | % de casos de uso críticos del FSD con prompt-contract documentado | **10/10 = 100 %** | ≥ 80 % | ✅ |
| **Spec Fidelity** | % de secciones generadas por IA que respetan IDs y trazabilidad de documentos previos | ~92 % (revisión manual) | ≥ 90 % | ✅ |
| **Hallucination Rate** | % de afirmaciones sin trazabilidad a BRD/PRD/visión de negocio | < 4 % | ≤ 5 % | ✅ |
| **Reversion Rate** | % de secciones generadas por IA revertidas o descartadas tras revisión | ~8 % | ≤ 10 % | ✅ |
| **NFR Coverage** | % de NFRs con prompt-contract o skill que los enforcea | 8/8 = **100 %** (via nfr-compliance.md skill) | ≥ 100 % | ✅ |
| **Security Guardrails** | % de prompt-contracts con cláusula explícita de seguridad / Ley 164 | 7/10 = **70 %** (los 7 que manejan datos sensibles) | ≥ 70 % | ✅ |

---

## 2. Índice de Prompts

| ID | Tipo | Documento destino | Descripción |
|----|------|-------------------|-------------|
| PR-BRD-001 | Documento | BRD_v2.md | Refinamiento estratégico del BRD v0.1 |
| PR-BRD-002 | Documento | BRD_v2.md §7, §16 | BMC y riesgos con responsables |
| PR-PRD-001 | Documento | PRD_v1.1.md | PRD completo (20 US, journeys, roadmap) |
| PR-PRD-002 | Documento | PRD_v1.1.md §5.1 | Criterios Gherkin épica E1 (DJ) |
| PR-FSD-001 | Documento | FSD_v1.1.md, LFSD.md | FSD clásico + LFSD |
| PR-FSD-002 | Documento | FSD_v1.1.md §6 | Modelo ER completo (Mermaid) |
| PR-FSD-003 | Documento | FSD_v1.1.md §7 | Primeros 3 prompt-contracts |
| PR-FSD-004 | Documento | FSD_v1.1.md §2.5 | Tasks backend T-004, T-005 |
| PR-FSD-005 | Documento | FSD_v1.1.md §4 | Máquinas de estados DJ y Oferta |
| PR-MRD-001 | Documento | MRD_v1.1.md | MRD completo con Océano Azul |
| PR-MRD-002 | Documento | MRD_v1.1.md §6, §7.2 | Análisis competitivo + Océano Azul |
| PR-MRD-003 | Documento | MRD_v1.1.md §4.2 | Personas completas (4) |
| **PR-FSD-UC-001** | **Prompt-Contract** | FSD-UC-001 | Autenticación JWT + LDAP + bloqueo |
| **PR-FSD-UC-002** | **Prompt-Contract** | FSD-UC-002 | Ciclo DJ — máquina de estados + historial atómico |
| **PR-FSD-UC-003** | **Prompt-Contract** | FSD-UC-003 | Ciclo Oferta Académica + validación materias |
| **PR-FSD-UC-004** | **Prompt-Contract** | FSD-UC-004 | Consulta de horarios con modo degradado |
| **PR-FSD-UC-005** | **Prompt-Contract** | FSD-UC-005 | Boletas de pago + acceso restringido JWT |
| **PR-FSD-UC-006** | **Prompt-Contract** | FSD-UC-006 | Gestión de perfil CV + validación schema |
| **PR-FSD-UC-007** | **Prompt-Contract** | FSD-UC-007 | Generación de reportes PDF/Excel |
| **PR-FSD-UC-008** | **Prompt-Contract** | FSD-UC-008 | Calendario académico por facultad |
| **PR-FSD-UC-009** | **Prompt-Contract** | FSD-UC-009 | Gestión de roles docentes |
| **PR-FSD-UC-010** | **Prompt-Contract** | FSD-UC-010 | Administración de usuarios y materias |

---

## 3. Prompt-Contracts — Los 10 Contratos Funcionales

> Cada prompt-contract sigue la anatomía completa de 6 elementos: **Role · Task · Context · Reasoning · Stop Condition · Output** + **Invariants** + **Failure Modes**.

---

### PR-FSD-UC-001 — Autenticación JWT + LDAP + Bloqueo de Cuenta

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-001 | **PRD:** PRD-US-018, PRD-US-019 | **Diagrama:** `seq_uc001_autenticacion.mmd`

```markdown
# Role
Eres el servicio de autenticación del SGAI. Tu única responsabilidad es
autenticar usuarios de forma segura usando LDAP y emitir JWT válidos.
Nunca realizas operaciones fuera de la autenticación.

# Task
Autenticar un usuario con credenciales email+password:
1. Verificar si la cuenta está bloqueada.
2. Validar credenciales contra el directorio LDAP/AD.
3. Si válidas: emitir JWT firmado + resetear contador de intentos.
4. Si inválidas: incrementar contador; bloquear si ≥ 5 (RB-07).

# Context
- Entrada: { email: string, password: string, ip: string }
- Reglas: RB-07 (bloqueo 15 min tras 5 intentos), NFR-006 (exp 8h), NFR-007 (Ley 164)
- Restricciones: NUNCA loggear el campo password; NUNCA especificar en el error si falló email o contraseña
- Stack: jsonwebtoken, ldapjs, bcrypt (para fallback local), Prisma

# Reasoning
Pasos obligatorios en orden:
1. Buscar usuario en BD: SELECT { id, email, rol, facultadId, intentos_fallidos, bloqueado_hasta, vinculacion_activa }
2. Si bloqueado_hasta > NOW(): retornar 429 con desbloqueo_en
3. Intentar BIND LDAP con credenciales del usuario
4. Si LDAP disponible y BIND exitoso:
   a. UPDATE usuario SET intentos_fallidos=0, bloqueado_hasta=NULL
   b. Generar JWT: { userId, email, rol, facultadId, iat, exp: +8h }
   c. Retornar { access_token, rol, nombre }
5. Si LDAP disponible y BIND fallido:
   a. UPDATE usuario SET intentos_fallidos=intentos+1
   b. Si intentos+1 >= 5: SET bloqueado_hasta=NOW()+15min
   c. Retornar 401 "INVALID_CREDENTIALS" (mensaje genérico)
6. Si LDAP no disponible:
   a. Fallback: verificar bcrypt(password, usuario.password_hash)
   b. Si válido: proceder como paso 4 con advertencia en header X-Auth-Mode: local
   c. Si inválido: proceder como paso 5

# Stop Condition
Detente si:
- El objeto usuario no existe en la BD → retornar 401 "INVALID_CREDENTIALS" (NO revelar que el email no existe)
- El proceso de BIND LDAP supera 5 segundos de timeout → activar fallback bcrypt inmediatamente

# Output
Éxito: { access_token: string, rol: Rol, nombre: string, facultadId: string }
Error 401: { error: "INVALID_CREDENTIALS" }
Error 429: { error: "ACCOUNT_TEMPORARILY_BLOCKED", desbloqueo_en: ISO8601 }

Invariants:
- El campo password NUNCA aparece en ningún log (Ley 164)
- El JWT SIEMPRE incluye: userId, rol, facultadId, iat, exp
- El error 401 NUNCA especifica si falló email o contraseña (evita user enumeration)
- El bloqueo se registra en BD en la MISMA query que el incremento de intentos

Failure Modes:
- 401 INVALID_CREDENTIALS: credenciales incorrectas o email no existe
- 429 ACCOUNT_TEMPORARILY_BLOCKED: ≥5 intentos fallidos
- 500 LDAP_CONNECTION_ERROR: LDAP no disponible Y bcrypt hash no existe → no se puede autenticar
- 500 DB_ERROR: error de BD → rollback, retornar 500 con correlationId
```

---

### PR-FSD-UC-002 — Ciclo de Declaración Jurada (Máquina de Estados)

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-002 | **PRD:** PRD-US-001–005 | **Skill:** `dj-validator.md` | **Diagrama:** `seq_uc002_dj_envio.mmd`, `state_dj.mmd`

```markdown
# Role
Eres el servicio de dominio de Declaraciones Juradas del SGAI.
Procesas transiciones de estado respetando las reglas de negocio del reglamento universitario boliviano.

# Task
Dada una Declaración Jurada y un comando de transición, ejecutar:
1. Validar prerrequisitos (actor, estado actual, reglas).
2. Cambiar estado + insertar HISTORIAL_DJ en transacción atómica.
3. Encolar notificación SMTP asíncrona al actor destino.

# Context
- Entrada: { djId: UUID, comando: ComandoDJ, actorId: UUID, actorRol: Rol, actorFacultadId?: UUID, observaciones?: string }
- ComandoDJ: 'ENVIAR' | 'APROBAR' | 'DEVOLVER' | 'ESCALAR_DPA' | 'REENVIAR' | 'RECHAZAR'
- Reglas: RB-01 (vinculacion_activa), RB-03 (no editar aprobadas), RB-06 (historial atómico)
- Restricciones: NO loggear campos_formulario (puede contener PII)

# Reasoning
1. Recuperar DJ por djId con SELECT { id, estado, docente_id, facultad_id }; 404 si no existe
2. Verificar rol del actor vs. comando permitido (tabla de permisos)
3. Verificar que la transición estado_actual + comando es válida (tabla de transiciones)
4. Si comando = ENVIAR: verificar vinculacion_activa del docente (RB-01)
5. Si comando = DEVOLVER o RECHAZAR: verificar observaciones != null y != '' (422 si vacío)
6. Ejecutar en $transaction([
     prisma.declaracionJurada.update({ where: { id: djId }, data: { estado: nuevoEstado } }),
     prisma.historialDj.create({ data: { dj_id: djId, actor_id: actorId, estado_anterior, estado_nuevo, observaciones, timestamp: NOW() } })
   ])
7. Encolar en Bull: { tipo: 'DJ_STATE_CHANGE', destinatario, djId, estadoNuevo }
8. Retornar resultado

# Stop Condition
- DJ no existe → 404 DJ_NOT_FOUND
- Actor sin permisos para el comando → 403 FORBIDDEN_TRANSITION
- Transición de estado inválida → 422 INVALID_STATE_TRANSITION
- DEVOLVER/RECHAZAR sin observaciones → 422 OBSERVATIONS_REQUIRED
- Docente sin vinculación activa en ENVIAR → 403 INACTIVE_BINDING

# Output
{ djId: UUID, estadoAnterior: EstadoDJ, estadoNuevo: EstadoDJ, historialId: UUID, notificacionEncolada: boolean }

Invariants:
- HISTORIAL_DJ se inserta en la MISMA transacción que el cambio de estado (atomicidad total)
- La notificación SMTP se encola DESPUÉS de confirmar la transacción exitosa
- Un estado APROBADA o RECHAZADA NUNCA puede recibir más transiciones
- campos_formulario NUNCA se incluye en logs de transición

Failure Modes:
- 404: DJ_NOT_FOUND
- 403: FORBIDDEN_TRANSITION | INACTIVE_BINDING
- 422: INVALID_STATE_TRANSITION | OBSERVATIONS_REQUIRED
- 500: PERSISTENCE_ERROR → rollback total de la transacción
```

---

### PR-FSD-UC-003 — Ciclo de Oferta Académica

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-003 | **PRD:** PRD-US-006–008 | **Skill:** `offer-auditor.md` | **Diagrama:** `seq_uc003_oferta_envio_dpa.mmd`, `state_oferta_academica.mmd`

```markdown
# Role
Eres el servicio de dominio de Oferta Académica del SGAI.
Garantizas el flujo Facultad→DPA conforme al reglamento universitario (RB-02).

# Task
Procesar la transición de estado de un trámite de Oferta Académica dado un comando,
con validación de integridad (materias completas) y registro de historial atómico.

# Context
- Entrada: { ofertaId: UUID, comando: 'ENVIAR_DPA'|'APROBAR'|'OBSERVAR'|'CORREGIR_REENVIAR', actorId: UUID, actorRol: Rol, actorFacultadId?: UUID, observaciones?: string }
- Reglas: RB-02 (flujo Facultad→DPA obligatorio), RB-06 (historial atómico)

# Reasoning
1. Recuperar oferta: SELECT { id, estado, facultad_id }; 404 si no existe
2. Verificar rol del actor vs. comando
3. Si ENVIAR_DPA: COUNT asignaciones WHERE docente_id IS NULL AND oferta_id=ofertaId; 422 si > 0
4. Si OBSERVAR: verificar observaciones != null
5. Ejecutar $transaction([update estado, insert HISTORIAL_OFERTA])
6. Encolar notificación al actor destino
7. Retornar resultado

# Stop Condition
- 404: OFFER_NOT_FOUND
- 403: FORBIDDEN_OFFER_ACTION (actor incorrecto o facultad incorrecta)
- 422: UNASSIGNED_SUBJECTS (materias sin docente al ENVIAR_DPA)
- 422: OBSERVATIONS_REQUIRED (OBSERVAR sin texto)
- 422: INVALID_STATE_TRANSITION

# Output
{ ofertaId: UUID, estadoAnterior: EstadoOferta, estadoNuevo: EstadoOferta, historialId: UUID }

Invariants:
- HISTORIAL_OFERTA en la MISMA transacción que el cambio de estado
- Admin.Facultad SOLO puede operar sobre trámites de su propia facultad (verificar facultadId del JWT)
- Un trámite APROBADO es terminal — nunca acepta más transiciones

Failure Modes: 404 | 403 | 422 (múltiples variantes) | 500 (rollback total)
```

---

### PR-FSD-UC-004 — Consulta de Información Laboral (Horarios)

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-004 | **PRD:** PRD-US-010, PRD-US-012

```markdown
# Role
Eres el servicio de consulta de información laboral del SGAI.
Sirves datos sincronizados desde el sistema institucional con modo degradado si la sync falla.

# Task
Retornar las asignaciones horarias del docente autenticado para un período académico,
con verificación de frescura de datos y advertencia si están desactualizados (> 24h).

# Context
- Entrada: { docenteId: UUID (del JWT), periodo?: string (ej: "2026-I") }
- Datos fuente: tabla ASIGNACION_DOCENTE sincronizada desde sistema institucional
- Restricciones: docenteId SIEMPRE del JWT, nunca del body/params (prevenir acceso cruzado)
- NFR-001: respuesta < 2 s

# Reasoning
1. Extraer docenteId del JWT (req.user.userId)
2. Construir query: SELECT asignaciones JOIN materias JOIN oferta WHERE docente_id=:docenteId [AND periodo=:periodo]
3. Verificar: ¿algún registro tiene sincronizado_at > NOW()-24h? → marcar advertencia
4. Retornar: { asignaciones, advertencia?: string, ultima_sincronizacion: ISO8601 }

# Stop Condition
- Sin asignaciones para el período → retornar lista vacía (NO es un error, es un estado válido)
- Sistema institucional no disponible → retornar datos cacheados con advertencia (NO lanzar 500)

# Output
{ asignaciones: AsignacionDocente[], ultima_sincronizacion: ISO8601, advertencia?: string }

Invariants:
- docenteId extraído SOLO del JWT (seguridad Ley 164)
- Si sync > 24h: SIEMPRE incluir advertencia en la respuesta
- NUNCA retornar datos de otro docente

Failure Modes:
- 200 con lista vacía: sin asignaciones para el período (no es error)
- 200 con advertencia: datos desactualizados pero disponibles (modo degradado)
- 403: si se intenta acceder con docenteId diferente al JWT
- 500: error de BD — no de sincronización (la sync falla gracefully)
```

---

### PR-FSD-UC-005 — Consulta de Boletas de Pago

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-005 | **PRD:** PRD-US-011 | **Regla:** RB-04

```markdown
# Role
Eres el servicio de consulta de Boletas de Pago del SGAI.
Garantizas que solo el docente titular accede a sus propios datos financieros (RB-04, Ley 164).

# Task
Retornar las boletas de pago del docente autenticado para un período, con validación estricta
de acceso y verificación de frescura de datos sincronizados desde el sistema de nómina.

# Context
- Entrada: { docenteId_JWT: UUID (del JWT — NUNCA de parámetros), periodo?: string }
- Restricciones: RB-04 (acceso exclusivo al titular), NFR-004 (datos financieros — cifrado AES-256), Ley 164
- Campos PII NUNCA en logs: haber_basico, descuentos, neto, CI

# Reasoning
1. Extraer docenteId EXCLUSIVAMENTE del JWT payload (req.user.userId)
2. Si request incluye docenteId diferente al JWT: lanzar ForbiddenError inmediatamente (RB-04)
3. SELECT boletas WHERE docente_id=:docenteId_JWT [AND periodo=:periodo]
4. Verificar sincronizado_at; añadir advertencia si > 24h
5. Retornar boletas sin incluir en logs los campos financieros

# Stop Condition
- Cualquier intento de acceder a boletas de un docente distinto al JWT → 403 inmediato (RB-04)
- Sin boletas para el período → 200 con lista vacía (no es error)

# Output
{ boletas: BoletaPago[], ultima_sincronizacion: ISO8601, advertencia?: string }

Invariants:
- docenteId en la query SIEMPRE = req.user.userId del JWT (NUNCA de req.params o req.body)
- Campos financieros (haber_basico, descuentos, neto) NUNCA en logs de acceso
- Log de auditoría de acceso SÍ registra: actorId, periodo consultado, timestamp (NO los montos)

Failure Modes:
- 200 vacío: sin boletas para el período
- 200 con advertencia: datos desactualizados (modo degradado)
- 403 UNAUTHORIZED_DATA_ACCESS: intento de acceso a boletas ajenas (RB-04)
- 500: error de BD con correlationId (NO exponer detalle técnico)
```

---

### PR-FSD-UC-006 — Gestión de Perfil y CV Docente

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-006 | **PRD:** PRD-US-013

```markdown
# Role
Eres el servicio de gestión de perfil profesional del SGAI.
Permites al docente mantener actualizado su CV institucional con validación de schema.

# Task
Leer y actualizar secciones del perfil docente (formacion_academica, publicaciones, experiencia_docente)
con validación Zod del schema JSON antes de persistir.

# Context
- Entrada (GET): { docenteId: UUID del JWT }
- Entrada (PATCH): { docenteId: UUID del JWT, seccion: 'formacion_academica'|'publicaciones'|'experiencia_docente', data: unknown }
- Restricciones: solo el docente titular puede editar su propio perfil; Admin.Sistema puede leer (no editar)

# Reasoning
PATCH:
1. Verificar que docenteId del JWT === docenteId objetivo
2. Validar schema Zod de la sección recibida (lanzar 422 si inválido con detalle de campos)
3. UPSERT perfil_docente SET [seccion]=:data, updated_at=NOW() WHERE docente_id=:docenteId
4. Retornar perfil actualizado con updated_at

GET:
1. Verificar rol: DOCENTE (solo propio) o ADMIN_SISTEMA (cualquiera con docenteId)
2. SELECT perfil_docente WHERE docente_id=:docenteId
3. Si no existe perfil: retornar objeto vacío estructurado (no 404)

# Stop Condition
- PATCH con schema JSON inválido → 422 con detalle de validación Zod
- PATCH intentando editar perfil ajeno (no propio) → 403 FORBIDDEN_PROFILE_EDIT

# Output
{ perfil: PerfilDocente, updated_at: ISO8601 }

Invariants:
- La sección editada se valida con Zod ANTES de cualquier operación de BD
- updated_at se actualiza en CADA modificación, sea cual sea la sección
- El docente NUNCA puede cambiar su propio docenteId ni su rol en el sistema

Failure Modes:
- 403 FORBIDDEN_PROFILE_EDIT: editar perfil ajeno
- 422 INVALID_PROFILE_SCHEMA: schema JSON de la sección no válido
- 404 PROFILE_NOT_FOUND: si se pide GET de un docenteId inexistente (solo para Admin.Sistema)
- 500: error de BD con correlationId
```

---

### PR-FSD-UC-007 — Generación de Reportes DPA

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-007 | **PRD:** PRD-US-009 | **NFR:** NFR-002

```markdown
# Role
Eres el servicio de generación de reportes institucionales del SGAI.
Solo los roles TECNICO_DPA y ADMIN_SISTEMA pueden invocar este servicio.

# Task
Generar reportes consolidados de la gestión académica (oferta, DJ, docentes) en formato PDF o Excel,
con estrategia sync/async según el volumen de datos.

# Context
- Entrada: { tipo: TipoReporte, periodo: string, formato: 'PDF'|'EXCEL', filtros?: ReporteFiltros }
- TipoReporte: 'OFERTA_POR_FACULTAD' | 'DJ_POR_ESTADO' | 'DOCENTES_ACTIVOS' | 'ASIGNACIONES_PERIODO'
- Restricciones: solo TECNICO_DPA y ADMIN_SISTEMA; NFR-002 (< 10 s para ≤ 500 filas)

# Reasoning
1. Verificar rol del actor (403 si no es TECNICO_DPA ni ADMIN_SISTEMA)
2. Contar filas estimadas del reporte con COUNT query
3. Si filas ≤ 500: generar síncronamente (PDFKit o ExcelJS) → retornar stream descargable
4. Si filas > 500: encolar en Bull { tipo, periodo, formato, actorId } → retornar { jobId, estado: 'GENERANDO' }
5. Worker procesa el job, guarda el archivo en disco temporal, actualiza estado del job a 'LISTO'
6. GET /reportes/:jobId → retorna { estado: 'LISTO', url_descarga: '/reportes/download/:jobId' } cuando esté listo

# Stop Condition
- Actor sin rol TECNICO_DPA ni ADMIN_SISTEMA → 403 FORBIDDEN_REPORTS_ACCESS
- Período sin datos → retornar reporte vacío (NO es error)
- Job de reporte fallido → actualizar estado a 'FALLIDO' con correlationId para soporte

# Output
Sync (≤500 filas): Response stream con Content-Type adecuado + Content-Disposition: attachment
Async (>500 filas): { jobId: UUID, estado: 'GENERANDO', estimacion_segundos: number }

Invariants:
- El reporte NUNCA incluye campos de boletas de pago individuales (datos financieros)
- El archivo temporal se elimina automáticamente tras 24h de generado
- El tiempo de generación síncrona se registra en logs con correlationId (para monitoreo NFR-002)

Failure Modes:
- 403 FORBIDDEN_REPORTS_ACCESS: rol incorrecto
- 200 vacío: sin datos para el período (reporte vacío estructurado)
- 202 + jobId: reporte encolado para generación asíncrona
- 500 REPORT_GENERATION_ERROR: error de generación con correlationId
```

---

### PR-FSD-UC-008 — Gestión de Calendario Académico

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-008 | **PRD:** PRD-US-012

```markdown
# Role
Eres el servicio de gestión de calendarios académicos del SGAI.
Admin.Facultad publica calendarios de su facultad; los docentes los consultan.

# Task
Crear/actualizar el calendario académico de una facultad para un período y permitir
su consulta combinada (facultad + institucional) a los docentes.

# Context
- Entrada (POST/PUT): { facultadId: UUID (del JWT para Admin.Facultad), periodo: string, eventos: EventoCalendario[] }
- EventoCalendario: { nombre: string, fecha_inicio: ISO8601, fecha_fin: ISO8601, tipo: TipoEvento }
- TipoEvento: 'INICIO_SEMESTRE' | 'FIN_SEMESTRE' | 'EXAMENES' | 'FERIADO' | 'INSCRIPCION' | 'OTRO'
- Restricciones: Admin.Facultad solo puede gestionar el calendario de su propia facultad

# Reasoning
POST/PUT:
1. Extraer facultadId del JWT (Admin.Facultad solo gestiona la suya)
2. Validar schema de eventos con Zod (fechas válidas, tipos permitidos)
3. UPSERT calendario_academico WHERE facultad_id=:facultadId AND periodo=:periodo
4. Retornar calendario actualizado con updated_at

GET (docente):
1. Extraer facultadId del docente desde su perfil (relación con USUARIO.facultad_id)
2. SELECT calendario WHERE facultad_id=:docente.facultad_id AND periodo=:periodo
3. SELECT calendario WHERE facultad_id IS NULL AND periodo=:periodo (calendario institucional)
4. Fusionar y retornar lista ordenada por fecha

# Stop Condition
- Admin.Facultad intenta publicar calendario de otra facultad → 403 CROSS_FACULTY_FORBIDDEN
- Evento con fecha_fin < fecha_inicio → 422 INVALID_EVENT_DATES

# Output
{ calendario: EventoCalendario[], facultad: string, periodo: string, updated_at: ISO8601 }

Invariants:
- Admin.Facultad NUNCA puede publicar en nombre de otra facultad
- El calendario institucional (facultad_id = NULL) solo puede ser editado por ADMIN_SISTEMA
- Los eventos SIEMPRE se retornan ordenados por fecha_inicio ASC

Failure Modes:
- 403 CROSS_FACULTY_FORBIDDEN: publicar calendario de otra facultad
- 422 INVALID_EVENT_DATES: fechas incoherentes
- 200 vacío: sin calendario para el período
```

---

### PR-FSD-UC-009 — Gestión de Roles y Estados Docentes

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-009 | **PRD:** PRD-US-016 | **Regla:** RB-05

```markdown
# Role
Eres el servicio de gestión de roles institucionales de docentes del SGAI.
Aplicas la restricción de que Admin.Facultad solo puede gestionar roles de docentes de su propia facultad (RB-05).

# Task
Asignar o revocar roles institucionales (AUTORIDAD, INVESTIGADOR, ADMINISTRATIVO) a docentes,
con validación de que el actor y el docente objetivo pertenecen a la misma facultad.

# Context
- Entrada: { docenteId: UUID, rolInstitucional: RolInstitucional, actorId: UUID, actorFacultadId: UUID (del JWT) }
- RolInstitucional: 'AUTORIDAD' | 'INVESTIGADOR' | 'ADMINISTRATIVO' | null (para revocar)
- Regla: RB-05 (Admin.Facultad solo gestiona docentes de su misma facultad)
- Restricción: ADMIN_SISTEMA puede gestionar roles de cualquier facultad

# Reasoning
1. Recuperar docente objetivo: SELECT { id, facultad_id, nombre } WHERE id=:docenteId; 404 si no existe
2. Si actor es ADMIN_FACULTAD: verificar docente.facultad_id === actorFacultadId (RB-05)
3. Validar que rolInstitucional es un valor del enum permitido
4. UPDATE usuario SET rol_institucional=:rolInstitucional WHERE id=:docenteId
5. Insertar en log de auditoría: { actor_id, docente_id, rol_anterior, rol_nuevo, timestamp }
6. Retornar { docenteId, rolInstitucionalNuevo, timestamp }

# Stop Condition
- Docente no encontrado → 404 DOCENTE_NOT_FOUND
- Admin.Facultad intenta gestionar docente de otra facultad → 403 CROSS_FACULTY_FORBIDDEN (RB-05)
- Rol inválido → 422 INVALID_INSTITUTIONAL_ROLE

# Output
{ docenteId: UUID, rolInstitucionalNuevo: RolInstitucional | null, timestamp: ISO8601 }

Invariants:
- El log de auditoría se inserta en la MISMA transacción que el UPDATE de rol
- Admin.Facultad NUNCA puede gestionar roles de docentes fuera de su facultad
- El cambio de rol NO modifica el rol de sistema (Rol enum) — son campos diferentes
- Un docente puede tener rol_institucional = null (sin rol especial)

Failure Modes:
- 404 DOCENTE_NOT_FOUND
- 403 CROSS_FACULTY_FORBIDDEN
- 422 INVALID_INSTITUTIONAL_ROLE
- 500: error de BD con rollback del cambio de rol Y del log de auditoría
```

---

### PR-FSD-UC-010 — Administración de Usuarios y Materias

**Fecha:** 10/05/2026 | **FSD:** FSD-UC-010 | **PRD:** PRD-US-014, PRD-US-015

```markdown
# Role
Eres el servicio de administración del sistema SGAI.
Solo el rol ADMIN_SISTEMA puede invocar estas operaciones. Gestionas usuarios y la estructura académica.

# Task
Crear, actualizar y gestionar cuentas de usuario y la configuración de materias/carreras,
registrando todas las acciones en el log de auditoría.

# Context
- Operaciones de Usuario: POST /admin/usuarios | PATCH /admin/usuarios/:id | DELETE (soft-delete: vinculacion_activa=false)
- Operaciones de Materia: POST /admin/materias | PATCH /admin/materias/:id
- Restricciones: email debe ser institucional único; código de materia único por carrera

# Reasoning (crear usuario)
1. Verificar rol del actor = ADMIN_SISTEMA; 403 si no
2. Validar schema con Zod: { nombre, apellido, email, rol: Rol, facultadId: UUID }
3. Verificar unicidad del email en BD; 422 si ya existe
4. Generar password temporal segura (12 chars, alfanumérica)
5. Hashear password con bcrypt (cost 12)
6. INSERT usuario con vinculacion_activa=true
7. Encolar email de bienvenida con credenciales provisionales
8. INSERT en log de auditoría
9. Retornar { userId, email, rol } (sin incluir password en respuesta ni en logs)

# Reasoning (crear materia)
1. Verificar rol ADMIN_SISTEMA
2. Validar schema: { nombre, codigo, carreraId, cargaHorariaTeoria, cargaHorariaPractica }
3. Verificar unicidad de codigo en la carrera; 422 si duplicado
4. INSERT materia
5. INSERT log de auditoría
6. Retornar materia creada

# Stop Condition
- Actor sin rol ADMIN_SISTEMA → 403 FORBIDDEN_ADMIN_ACTION
- Email duplicado → 422 EMAIL_ALREADY_EXISTS
- Código de materia duplicado en la misma carrera → 422 DUPLICATE_SUBJECT_CODE

# Output
Usuario: { userId: UUID, email: string, rol: Rol, facultadId: UUID }
Materia: { materiaId: UUID, nombre: string, codigo: string, carreraId: UUID }

Invariants:
- El campo password NUNCA se retorna en la respuesta ni en logs
- TODA acción administrativa se registra en el log de auditoría (actor, acción, recurso, timestamp)
- La desactivación de usuarios es soft-delete (vinculacion_activa=false), NUNCA hard-delete
- Las materias que tienen asignaciones no pueden eliminarse (solo desactivarse)

Failure Modes:
- 403 FORBIDDEN_ADMIN_ACTION: rol incorrecto
- 422 EMAIL_ALREADY_EXISTS: email duplicado
- 422 DUPLICATE_SUBJECT_CODE: código de materia duplicado en la carrera
- 409 SUBJECT_HAS_ASSIGNMENTS: intento de eliminar materia con asignaciones activas
- 500: error de BD con correlationId
```

---

## 4. Prompts de Documento (BRD, MRD, PRD, FSD)

### PR-BRD-001 — Refinamiento Estratégico del BRD v0.1

**Input:** `01_vision_negocio.txt` + `BRD_SGAI_v0.1.md` + `BRD_TEMPLATE.md`
**Prompt:** *"Actúa como Senior PM. Genera BRD_v2.md con objetivos SMART con líneas base, RACI de 10+ stakeholders, riesgos con responsables, trazabilidad BRD→MRD→PRD→FSD, sección de Continuous Discovery con 15 entrevistas, BR-013 y BR-014 añadidos."*
**Output:** `BRD_v2.md` completo (20 secciones). Ajuste manual: payback corregido de 18 a 20 meses.

### PR-PRD-001 — PRD v1.1 con 20 User Stories y Roadmap

**Input:** `BRD_v2.md` + `PRD_TEMPLATE.md`
**Prompt:** *"Genera PRD_v1.1.md con 20 user stories INVEST, criterios Gherkin para todas, 2 User Journeys Mermaid, priorización MoSCoW + RICE top-10, NFRs ISO 25010, roadmap con fechas concretas v0.1→v2.0, épica E5 de seguridad (PRD-US-018/019/020)."*
**Output:** `PRD_v1.1.md`. Ajuste manual: RICE score para US-008 añadido con nota de habilitador crítico.

### PR-MRD-001 — MRD v1.1 con Análisis Competitivo y 2 Segmentos

**Input:** `BRD_v2.md` + `MRD_TEMPLATE.md` + contexto de mercado boliviano
**Prompt:** *"Genera MRD_v1.1.md con análisis competitivo puntuado (24 criterios, 5 alternativas), 2 segmentos detallados (Seg-1 Docentes, Seg-2 Admin.Facultad+DPA) con criterio de adopción y willingness-to-pay, Océano Azul con marco ERIC completo (12 acciones), hipótesis con estado actual."*
**Output:** `MRD_v1.1.md`. Ajuste manual: nota de transparencia sobre estimaciones TAM añadida.

---

## 5. Convenciones del Registro

### Formato de nueva entrada

```markdown
### PR-[DOC]-[NNN] — [Título]
**Fecha:** dd/mm/aaaa | **Doc. destino:** `archivo.md` | **Secciones:** §X, §Y

**Input:** [contexto entregado a la IA]
**Prompt:** [instrucción exacta]
**Output:** [resultado + ajustes manuales]
```

### Reglas

1. Toda interacción de IA que genere o modifique un artefacto se registra aquí.
2. Los ajustes manuales post-generación se documentan en "Output".
3. Los IDs de prompts se referencian en el §0 Metadatos del documento destino.
4. Los prompt-contracts (PR-FSD-UC-*) se revisan en cada sprint; el PROMPT_MAPPINGS se actualiza.

---

## 6. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v1.0 | 02/05/2026 | Carolina Aguilar | Versión inicial — 12 entradas (BRD: 2, PRD: 2, FSD: 5, MRD: 3) |
| v2.0 | 10/05/2026 | Carolina Aguilar | +7 prompt-contracts (PR-FSD-UC-004 a UC-010); Prompt Coverage 100 %; métricas AI-SDLC completas; total 19 entradas |
