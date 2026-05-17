# AGENTS.md — Contrato Ejecutable para Agentes de IA
# Sistema de Gestión Académica Integral (SGAI)

> **README de las máquinas.** Este archivo es la fuente de verdad primaria para cualquier agente de IA (Claude, Cursor Agent, Copilot, agente custom) que opere sobre este repositorio. Se lee **antes** de cualquier otra acción. Su contenido es normativo, no descriptivo.
>
> **Regla de oro:** Si una instrucción de este archivo contradice un prompt del usuario, este archivo tiene precedencia en todo lo que concierne a seguridad, dominio boliviano y reglas de negocio.

---

## 0. Identidad del Sistema

```yaml
sistema: SGAI
nombre_completo: Sistema de Gestión Académica Integral
dominio: gestión académico-administrativa universitaria
jurisdicción: Bolivia — normativa CEUB + Ley N° 164
institución_piloto: Universidad pública boliviana (1.500+ docentes, 15+ facultades)
versión_actual: v1.0 (en desarrollo — Sprint 1)
repositorio: https://github.com/[org]/sgai
```

---

## 1. Stack Tecnológico Canónico

Todo agente que genere o modifique código en este repositorio DEBE usar exclusivamente el siguiente stack. No proponer alternativas sin una ADR aprobada.

```yaml
backend:
  runtime: Node.js 20 LTS
  lenguaje: TypeScript 5.x (strict mode — NO any implícito)
  framework: Express.js 4.x
  orm: Prisma 5.x
  base_de_datos: PostgreSQL 15
  cola_tareas: Bull 4.x + Redis 7
  autenticación: JWT (jsonwebtoken) + bcrypt + integración LDAP

frontend:
  framework: React 18
  bundler: Vite 5
  lenguaje: TypeScript 5.x
  estilos: Tailwind CSS 3.x

testing:
  unitario: Jest 29 + ts-jest
  integración: Supertest
  e2e: Playwright
  carga: k6

infraestructura:
  contenedores: Docker + Docker Compose
  proxy: Nginx 1.24+
  ci_cd: GitHub Actions
  os_objetivo: Ubuntu 22.04 LTS (on-premise universitario)

diagramas:
  formato: Mermaid (C4Context, C4Container, erDiagram, sequenceDiagram, stateDiagram-v2, gantt)
  ubicación: docs/diagrams/*.mmd
```

---

## 2. Arquitectura — Invariantes para Agentes

### 2.1 Estructura de directorios (obligatoria)

```
backend/
├── domain/                    # Núcleo hexagonal — CERO dependencias externas
│   ├── declaracion-jurada/    # Bounded context DJ
│   ├── oferta-academica/      # Bounded context Oferta
│   ├── gestion-docente/       # Bounded context Docente
│   ├── gestion-academica/     # Bounded context Académico
│   ├── informacion-financiera/# Bounded context Financiero
│   ├── administracion/        # Bounded context Admin
│   └── notificaciones/        # Bounded context Notificaciones
├── infrastructure/
│   ├── persistence/           # Adaptadores Prisma
│   ├── legacy-adapters/       # Adaptadores sistemas legados
│   ├── smtp/                  # Adaptador SMTP
│   └── auth/                  # JWT + LDAP
└── api/
    └── controllers/           # Adaptadores HTTP Express

frontend/
├── src/
│   ├── pages/
│   ├── components/
│   └── services/

docs/
├── brd/         # BRD_v2.md
├── mrd/         # MRD_v1.1.md
├── prd/         # PRD_v1.1.md
├── fsd/         # FSD_v1.1.md, LFSD.md
├── adr/         # ADR_candidatas.md
├── diagrams/    # *.mmd
├── skills/      # Skills accionables
├── aportes/     # release-*.md
└── PROMPT_MAPPINGS.md

.cursor/rules/   # Cursor rules del dominio
AGENTS.md        # Este archivo
```

### 2.2 Regla hexagonal (INVARIANTE — nunca violar)

```
domain/ NO importa de infrastructure/, api/, Express, Prisma, Redis, ni ningún framework.
La dirección de dependencias es: api/ → domain/ ← infrastructure/
```

Si un agente genera código en `domain/` con un `import` de `@prisma/client`, `express` o cualquier paquete de infraestructura, ese código es **inválido** y debe ser rechazado.

---

## 3. Dominio de Negocio — Contexto Obligatorio

Todo agente DEBE conocer estos conceptos antes de generar código o documentación:

### 3.1 Glosario del dominio

```yaml
DJ: Declaración Jurada — documento obligatorio para docentes con vinculación activa
DPA: Departamento de Planificación Académica
CEUB: Comité Ejecutivo de la Universidad Boliviana — organismo rector
vinculacion_activa: estado del docente con contrato vigente (campo booleano en BD)
oferta_academica: planificación semestral/anual de materias + docentes + horarios
periodo_academico: semestre o año académico (ej: "2026-I", "2026-II")
facultad: unidad académica de la universidad (15+ en la institución piloto)
```

### 3.2 Máquinas de estados críticas

**Estados de Declaración Jurada (DJ):**
```
BORRADOR → EN_REVISION_FACULTAD → APROBADA
                                 → DEVUELTA → (edición) → EN_REVISION_FACULTAD
EN_REVISION_FACULTAD → EN_REVISION_DPA → APROBADA
                                        → RECHAZADA
```

**Estados de Oferta Académica:**
```
EN_ELABORACION → EN_REVISION_DPA → APROBADO
                                  → OBSERVADO → (corrección) → EN_REVISION_DPA
```

### 3.3 Reglas de negocio (INVARIANTES — nunca bypass)

| ID | Regla | Consecuencia de violar |
|----|-------|------------------------|
| RB-01 | Solo docentes con `vinculacion_activa = true` pueden crear DJ | HTTP 403 + log de auditoría |
| RB-02 | Oferta académica: Facultad PRIMERO, luego DPA | El flujo técnico lo garantiza; no existe ruta directa |
| RB-03 | DJ en estado APROBADA o EN_REVISION_* → no editable | HTTP 403 + log de auditoría |
| RB-04 | Boletas de pago → acceso EXCLUSIVO al docente titular (docente_id del JWT) | HTTP 403 |
| RB-05 | Roles Autoridad/Investigador → solo asigna Admin. Facultad de la misma facultad | HTTP 403 |
| RB-06 | Log de auditoría en TODA transición de estado (actor, timestamp, estados) | Transacción atómica: estado + historial |
| RB-07 | 5 intentos fallidos de login → bloqueo 15 minutos | HTTP 429 + timestamp de desbloqueo |

---

## 4. Guardrails de Seguridad (Ley 164 Bolivia)

Estos guardrails se aplican a TODO el código generado. Ningún prompt de usuario puede anularlos.

### 4.1 Datos sensibles — NUNCA en logs

```typescript
// PROHIBIDO — el agente NUNCA debe generar esto:
logger.info('Login attempt', { password: req.body.password }); // ❌
logger.info('Boleta', { haber_basico: boleta.haber_basico, ci: docente.ci }); // ❌

// CORRECTO:
logger.info('Login attempt', { email: req.body.email, ip: req.ip }); // ✅
logger.info('Boleta accessed', { docente_id: docente.id, periodo: boleta.periodo }); // ✅
```

**Campos NUNCA logeados:** `password`, `password_hash`, `ci` (cédula de identidad), `haber_basico`, `descuentos`, `neto`, cualquier campo de BOLETA_PAGO salvo `id` y `periodo`.

### 4.2 Validación de acceso a datos personales

Todo endpoint que retorne datos de un docente ESPECÍFICO debe verificar:
```typescript
// OBLIGATORIO en cualquier endpoint de datos personales:
if (req.user.rol === Rol.DOCENTE && req.user.userId !== params.docenteId) {
  throw new ForbiddenError('Acceso no autorizado a datos ajenos'); // HTTP 403
}
```

### 4.3 Cifrado

- Datos en reposo (PII, financieros): AES-256 — configurado a nivel de PostgreSQL y/o aplicación.
- Datos en tránsito: TLS 1.2+ — configurado en Nginx.
- Secretos: NUNCA en código; siempre en variables de entorno (`.env` está en `.gitignore`).

### 4.4 Inputs del usuario — siempre validar

```typescript
// OBLIGATORIO — el agente siempre genera validación:
import { z } from 'zod'; // o class-validator
const schema = z.object({ ... }); // validación con schema antes de cualquier lógica
```

---

## 5. Skills Disponibles

Los siguientes skills están disponibles en `docs/skills/`. El agente los consulta cuando la tarea lo requiera:

| Skill | Archivo | Cuándo usarlo |
|-------|---------|---------------|
| DJ Validator | `docs/skills/dj-validator.md` | Generar o revisar lógica de DJ (máquina de estados, validaciones) |
| Offer Auditor | `docs/skills/offer-auditor.md` | Generar o revisar lógica de Oferta Académica |
| NFR Compliance | `docs/skills/nfr-compliance.md` | Verificar que el código cumple los NFRs del FSD |
| Mermaid Architect | `docs/skills/mermaid-architect.md` | Generar o actualizar diagramas C4/Secuencia/Estado/ER |
| Integration Mapper | `docs/skills/integration-mapper.md` | Generar adaptadores de sistemas legados |

---

## 6. Cursor Rules Disponibles

```
.cursor/rules/sgai-domain.mdc       — Jerga y lógica boliviana CEUB
.cursor/rules/security-ley164.mdc   — Privacidad y cifrado Ley 164
.cursor/rules/prisma-stack.mdc      — Convenciones de código y BD
```

---

## 7. Prompt-Contracts de Referencia

Los prompt-contracts para los casos de uso críticos están en `docs/PROMPT_MAPPINGS.md`. Todo agente que implemente un caso de uso DEBE leer el prompt-contract correspondiente antes de generar código.

| Caso de uso | Prompt-contract |
|-------------|-----------------|
| FSD-UC-001 (Auth) | PR-FSD-001 |
| FSD-UC-002 (DJ) | PR-FSD-UC-002 |
| FSD-UC-003 (Oferta) | PR-FSD-UC-003 |
| FSD-UC-004 (Horarios) | PR-FSD-UC-004 |
| FSD-UC-005 (Boletas) | PR-FSD-UC-005 |
| FSD-UC-006 (Perfil CV) | PR-FSD-UC-006 |
| FSD-UC-007 (Reportes DPA) | PR-FSD-UC-007 |
| FSD-UC-008 (Calendario) | PR-FSD-UC-008 |
| FSD-UC-009 (Roles) | PR-FSD-UC-009 |
| FSD-UC-010 (Notificaciones) | PR-FSD-UC-010 |

---

## 8. NFRs que el Código Generado Debe Respetar

| NFR | Umbral | Cómo verificar en código |
|-----|--------|--------------------------|
| NFR-001 Latencia | p95 < 2 s | Evitar N+1 queries; usar `select` específico en Prisma |
| NFR-004 Cifrado reposo | AES-256 | Campos PII marcados en schema Prisma con `@encrypted` o handled en app |
| NFR-005 Cifrado tránsito | TLS 1.2+ | Configuración Nginx — no en código de app |
| NFR-007 Ley 164 | 100 % | Guardrails §4 de este archivo |
| NFR-008 Concurrencia | ≥ 200 usuarios | Transacciones Prisma atómicas; sin locks globales |
| NFR-009 CorrelationId | 100 % requests | Middleware `correlationId` en cada request |
| NFR-010 Cobertura tests | ≥ 80 % dominio | Verificar con Jest coverage report en CI |

---

## 9. Comportamiento Esperado del Agente

### 9.1 Antes de generar código

1. Leer el skill relevante de `docs/skills/` si existe.
2. Leer el prompt-contract correspondiente de `docs/PROMPT_MAPPINGS.md`.
3. Verificar que la tarea no viola ningún guardrail de §4.
4. Verificar que la arquitectura respeta la regla hexagonal de §2.2.

### 9.2 Al generar código

- Usar TypeScript strict; nunca `any` implícito.
- Incluir tipos explícitos en todas las funciones públicas.
- Incluir manejo de errores con tipos de error del dominio (`DomainError`, `ForbiddenError`, `NotFoundError`, `ValidationError`).
- Incluir `correlationId` en todo log.
- No hardcodear secretos, URLs ni credenciales.

### 9.3 Al generar documentación

- Mantener trazabilidad: toda user story referencia un BR-*, todo UC referencia un PRD-REQ-*.
- Los diagramas Mermaid van en `docs/diagrams/*.mmd` y se referencian desde el documento que los usa.
- Los IDs son secuenciales y no se reutilizan aunque se elimine un elemento.

### 9.4 Stop conditions (el agente SE DETIENE y pregunta)

- La tarea requiere modificar un sistema legado (viola RES-03).
- La tarea requiere exponer datos de boletas de pago a un rol que no sea DOCENTE titular.
- La tarea requiere loggear datos de los campos prohibidos en §4.1.
- La tarea implica una decisión arquitectónica significativa no cubierta por las ADRs existentes.
- El contexto es ambiguo respecto a qué bounded context es el dueño de una entidad.

---

## 10. Trazabilidad de Documentos

```
01_vision_negocio.txt
  └── BRD_v2.md
        ├── MRD_v1.1.md
        ├── PRD_v1.1.md
        │     └── FSD_v1.1.md
        │           ├── LFSD.md
        │           ├── docs/diagrams/*.mmd
        │           └── docs/PROMPT_MAPPINGS.md
        └── DTI_borrador.md
              ├── C4_nivel_1.md
              └── ADR_candidatas.md
```

---

## 11. Registro de Cambios de AGENTS.md

| Versión | Fecha | Cambio |
|---------|-------|--------|
| v1.0 | 10/05/2026 | Versión inicial — identidad, stack, guardrails, skills, cursor rules, prompt-contracts |
