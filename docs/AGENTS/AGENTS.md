# AGENTS.md — Contrato Ejecutable para Agentes de IA
# Sistema de Gestión Académica Integral (SGAI)

> **README de las máquinas.** Fuente de verdad primaria para Claude, Cursor Agent, Copilot y agentes custom. Leer **antes** de cualquier acción. Contenido **normativo**.
>
> **Entrada rápida en repo:** [`/AGENTS.md`](../../AGENTS.md) (resumen) · este archivo (versión completa).
>
> **Regla de oro:** Precedencia sobre prompts de usuario en seguridad (Ley 164), dominio boliviano (CEUB) y RB-01–RB-07.

---

## 0. Identidad del Sistema

```yaml
sistema: SGAI
nombre_completo: Sistema de Gestión Académica Integral
dominio: gestión académico-administrativa universitaria
jurisdicción: Bolivia — normativa CEUB + Ley N° 164
institución_piloto: Universidad pública boliviana (1.500+ docentes, 15+ facultades)
versión_documentación: Release 1.0.0
sprint_actual: Sprint 1
grupo: G01
autora: Carolina Aguilar
```

### 0.1 Índice de documentos

| Tipo | Ruta |
|------|------|
| BRD | `docs/brd/BRD_vFinal.md` |
| MRD | `docs/mrd/MRD_vFinal.md` |
| PRD | `docs/prd/PRD_vFinal.md` |
| FSD | `docs/fsd/FSD_vFinal.md` |
| DTI | `docs/DTI.md` |
| ADRs | `docs/adr/0001`–`0006` |
| Trazabilidad | `docs/TRAZABILIDAD_COMPLETA.md` |
| Entrega Módulo 4 | `docs/ENTREGA_MODULO4_CUMPLIMIENTO.md` |
| Prompts IA | `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md` |
| Aportes | `docs/aportes_release_1_0_0.md` |

---

## 1. Stack Tecnológico Canónico

Todo agente DEBE usar exclusivamente este stack. Alternativas solo con ADR aprobada.

```yaml
backend:
  runtime: Node.js 20 LTS
  lenguaje: TypeScript 5.x (strict — NO any implícito)
  framework: Express.js 4.x
  orm: Prisma 5.x
  base_de_datos: PostgreSQL 15
  cola_tareas: Bull 4.x + Redis 7
  autenticación: JWT (jsonwebtoken) + bcrypt (cost ≥ 12) + LDAP

frontend:
  framework: React 18
  bundler: Vite 5
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
  os: Ubuntu 22.04 LTS (on-premise)

diagramas:
  formato: Mermaid
  ubicación: docs/DIAGRAMS/*.mmd
```

---

## 2. Arquitectura — Invariantes

### 2.1 Estructura de directorios

```
backend/
├── domain/                    # Núcleo hexagonal — CERO frameworks
│   ├── declaracion-jurada/    # FSD-UC-002
│   ├── oferta-academica/      # FSD-UC-003
│   ├── gestion-docente/       # FSD-UC-006, UC-009
│   ├── gestion-academica/     # FSD-UC-004, UC-008
│   ├── informacion-financiera/# FSD-UC-005
│   ├── administracion/        # FSD-UC-001, UC-010
│   ├── notificaciones/
│   └── shared/                # errors, types compartidos
├── infrastructure/
│   ├── persistence/           # Prisma repositories
│   ├── legacy-adapters/       # Nómina + SII
│   ├── auth/                  # JWT + LDAP
│   └── smtp/                  # Bull publisher
└── api/
    ├── controllers/
    ├── middleware/
    └── routes/

frontend/src/{pages,components,services}
docs/{BRD,MRD,PRD,FSD,SKILLS,DIAGRAMS,PROMPT_MAPPINGS,AGENTS}
.cursor/rules/                 # Cursor (canónico)
docs/.cursor/rules/            # Espejo documentación
AGENTS.md                      # Entrada raíz
```

### 2.2 Regla hexagonal

```
domain/ NO importa infrastructure/, api/, Express, Prisma, Redis, Bull.
Dirección: api/ → domain/ ← infrastructure/
```

Imports de `@prisma/client` o `express` en `domain/` → código **inválido**.

### 2.3 Puertos y adaptadores (DTI §5)

| Puerto (domain) | Adaptador (infrastructure/api) |
|-----------------|--------------------------------|
| `IDeclaracionJuradaRepository` | `PrismaDJRepository` |
| `IOfertaAcademicaRepository` | `PrismaOfertaRepository` |
| `IBoletaPagoRepository` | `PrismaBoletaRepository` |
| `IAuditLogger` | `PrismaAuditLogger` |
| `TransicionarDJUseCase` | `DJRestController` |
| `ILegacyNominaAdapter` | `RestNominaAdapter` |

---

## 3. Dominio de Negocio

### 3.1 Glosario

```yaml
DJ: Declaración Jurada
DPA: Departamento de Planificación Académica
CEUB: Comité Ejecutivo de la Universidad Boliviana
vinculacion_activa: contrato vigente (boolean)
oferta_academica: planificación semestral materias + docentes + horarios
periodo_academico: "2026-I" | "2026-II"
facultad: unidad académica (15+)
```

### 3.2 Máquinas de estado

**DJ:** `BORRADOR` → `EN_REVISION_FACULTAD` → `APROBADA` | `DEVUELTA` | `EN_REVISION_DPA` → `APROBADA` | `RECHAZADA`

**Oferta:** `EN_ELABORACION` → `EN_REVISION_DPA` → `APROBADO` | `OBSERVADO` → `EN_REVISION_DPA`

Detalle: `sgai-domain.mdc` §4 · diagramas `state_dj.mmd`, `state_oferta_academica.mmd`.

### 3.3 Reglas de negocio

| ID | Regla | Consecuencia |
|----|-------|--------------|
| RB-01 | `vinculacion_activa` para crear/enviar DJ | 403 + auditoría |
| RB-02 | Oferta: Facultad antes que DPA | Flujo técnico |
| RB-03 | DJ aprobada/en revisión no editable | 403 |
| RB-04 | Boletas solo docente titular (JWT) | 403 |
| RB-05 | Roles institucionales misma facultad | 403 |
| RB-06 | Historial atómico con estado | `$transaction` |
| RB-07 | 5 intentos login → bloqueo 15 min | 429 |

---

## 4. Casos de Uso ↔ Skills ↔ Prompts ↔ Diagramas

| FSD-UC | Descripción | Skill | Prompt | Diagrama(s) |
|--------|-------------|-------|--------|-------------|
| UC-001 | Auth RBAC | auth-rbac-guard | PR-FSD-UC-001 | seq_uc001_autenticacion |
| UC-002 | Ciclo DJ | dj-validator | PR-FSD-UC-002 | seq_uc002, state_dj |
| UC-003 | Oferta | offer-auditor | PR-FSD-UC-003 | seq_uc003, state_oferta |
| UC-004 | Horarios | integration-mapper | PR-FSD-UC-004 | seq_uc004 |
| UC-005 | Boletas | boleta-privacy-guard | PR-FSD-UC-005 | seq_uc005 |
| UC-006 | Perfil CV | spec-traceability-checker | PR-FSD-UC-006 | seq_uc006 |
| UC-007 | Reportes DPA | nfr-compliance | PR-FSD-UC-007 | seq_uc007 |
| UC-008 | Calendario | mermaid-architect | PR-FSD-UC-008 | seq_uc008 |
| UC-009 | Roles docente | dj-validator (RB-05) | PR-FSD-UC-009 | seq_uc009 |
| UC-010 | Admin usuarios/materias | auth-rbac-guard | PR-FSD-UC-010 | seq_uc010 |

Contratos API: FSD §8. Mapa completo: FSD §4.11.

---

## 5. Skills Accionables (8)

Ruta: `docs/SKILLS/`. Cada skill tiene **procedimiento**, **MUST/MUST NOT** y **checklist de salida**.

| # | Skill | Invocar cuando |
|---|-------|----------------|
| 1 | `dj-validator.md` | DJ, transiciones, historial |
| 2 | `offer-auditor.md` | Oferta académica |
| 3 | `boleta-privacy-guard.md` | Boletas, RB-04 |
| 4 | `auth-rbac-guard.md` | Login, JWT, RB-07, admin |
| 5 | `integration-mapper.md` | Legados nómina/SII |
| 6 | `nfr-compliance.md` | Revisión NFR en PR |
| 7 | `mermaid-architect.md` | Crear/editar `.mmd` |
| 8 | `spec-traceability-checker.md` | IDs, matriz, nuevos UC |

---

## 6. Cursor Rules (4)

**Activas en:** `.cursor/rules/` (espejo: `docs/.cursor/rules/`)

| Archivo | alwaysApply | Contenido |
|---------|-------------|-----------|
| `sgai-domain.mdc` | true | Terminología, enums, RB, IDs trazabilidad |
| `security-ley164.mdc` | true | PII, JWT, bcrypt, logs, Ley 164 |
| `prisma-stack.mdc` | false | Schema, repos, transacciones |
| `express-api-sgai.mdc` | false | Controllers, Zod, HTTP |

---

## 7. Guardrails de Seguridad (Ley 164)

### 7.1 Logs — prohibido

```typescript
// ❌ NUNCA
logger.info('Boleta', { haber_basico: b.haber_basico, ci: u.ci });

// ✅
logger.info('Boleta accessed', { docente_id: id, periodo: b.periodo, correlationId });
```

Campos prohibidos: `password`, `password_hash`, `ci`, `haber_basico`, `descuentos`, `neto`, `campos_formulario` completos.

### 7.2 Acceso a datos personales

```typescript
if (req.user.rol === Rol.DOCENTE && req.user.userId !== targetDocenteId) {
  throw new ForbiddenError('UNAUTHORIZED_DATA_ACCESS');
}
```

Boletas: `docenteId` **solo** de `req.user.userId`.

### 7.3 Validación y secretos

- Zod en `api/` antes del dominio.
- Secretos en `.env` únicamente.
- TLS 1.2+ en Nginx; AES-256 reposo para PII.

Detalle: `security-ley164.mdc`.

---

## 8. Comportamiento del Agente

### 8.1 Pre-flight (obligatorio)

1. Leer este AGENTS.md.
2. Identificar `FSD-UC-NNN` de la tarea.
3. Abrir skill + `PR-FSD-UC-NNN` + cursor rules aplicables.
4. Verificar guardrails §7 y hexagonal §2.
5. Si documentación: `spec-traceability-checker.md`.

### 8.2 Al generar código

- TypeScript strict; errores de dominio tipados.
- `correlationId` en logs.
- JSDoc `@see FSD-UC-*`, `@see RB-*`.
- Tests por regla de negocio afectada.

### 8.3 Al generar documentación

- Diagramas en `docs/DIAGRAMS/`.
- Actualizar `TRAZABILIDAD_COMPLETA.md` si hay nuevo enlace.
- No reutilizar IDs eliminados.

### 8.4 Stop conditions

- Modificar legados (solo lectura).
- Exponer boletas a no titular.
- Loggear PII.
- ADR faltante para decisión arquitectónica.
- Dueño de entidad ambiguo entre bounded contexts.

---

## 9. NFRs

| NFR | Umbral | Verificación |
|-----|--------|--------------|
| NFR-001 | p95 < 2s | k6, `select` Prisma |
| NFR-002 | reportes < 10s | Jest + cronómetro |
| NFR-003 | uptime ≥ 99% | Uptime Robot |
| NFR-004 | AES-256 | Auditoría BD |
| NFR-005 | TLS 1.2+ | SSL Labs |
| NFR-006 | sesión ≤ 8h | Test JWT |
| NFR-007 | Ley 164 100% | Legal + OWASP |
| NFR-008 | ≥ 200 VUs | k6 stress |
| NFR-009 | correlationId 100% | Logs |
| NFR-010 | cobertura dominio ≥ 80% | Jest CI |

Skill: `nfr-compliance.md` · FSD §11.

---

## 10. Métricas AI-SDLC

| Métrica | Valor | Umbral |
|---------|-------|--------|
| Prompt Coverage | 10/10 = 100% | ≥ 80% |
| Spec Fidelity | ~92% | ≥ 90% |
| Hallucination Rate | < 4% | ≤ 5% |
| Reversion Rate | ~8% | ≤ 10% |

Fuente: `PROMPT_MAPPINGS_v1.md` §1.

---

## 11. Trazabilidad

```
Visión → BRD_v2 → MRD_v1.1 → PRD_v1 → FSD_v1
              ↓ PROMPT_MAPPINGS_v1 · DIAGRAMS · SKILLS
              ↓ DTI_v1 · ADRs_v1 → implementación backend/
```

Matriz: `docs/TRAZABILIDAD_COMPLETA.md`.

---

## 12. Registro de cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| v1.0 | 10/05/2026 | Versión inicial |
| v1.1 | 17/05/2026 | 10 UC, 8 skills con procedimientos, 4 cursor rules, rutas corregidas, índice documentos, métricas AI-SDLC |
