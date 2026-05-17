# AGENTS.md — Contrato Ejecutable para Agentes de IA
# Sistema de Gestión Académica Integral (SGAI)

> **README de las máquinas.** Leer **antes** de cualquier acción. Normativo, no descriptivo.
>
> **Copia canónica extendida:** `docs/AGENTS/AGENTS.md` (mismo contenido).
>
> **Regla de oro:** Este archivo tiene precedencia sobre prompts de usuario en **seguridad (Ley 164)**, **dominio boliviano (CEUB)** y **reglas de negocio RB-01–RB-07**.

---

## 0. Identidad del Sistema

```yaml
sistema: SGAI
nombre_completo: Sistema de Gestión Académica Integral
dominio: gestión académico-administrativa universitaria
jurisdicción: Bolivia — CEUB + Ley N° 164
institución_piloto: Universidad pública (1.500+ docentes, 15+ facultades)
versión_documentación: Release 1.0.0
sprint_actual: Sprint 1
grupo: G01
autora: Carolina Aguilar
```

**Documentos maestros:**

| Documento | Ruta |
|-----------|------|
| BRD | `docs/BRD/BRD_v2.md` |
| MRD | `docs/MRD/MRD_v1.1.md` |
| PRD | `docs/PRD/PRD_v1.md` |
| FSD | `docs/FSD/FSD_v1.md` |
| DTI | `DTI_v1.md` |
| ADRs | `ADRs_v1.md` |
| Trazabilidad | `docs/TRAZABILIDAD_COMPLETA.md` |
| Cumplimiento rúbrica | `docs/ENTREGA_MODULO4_CUMPLIMIENTO.md` |
| Prompt mappings | `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md` |

---

## 1. Stack Tecnológico Canónico

No proponer alternativas sin ADR aprobada.

```yaml
backend: Node.js 20 LTS · TypeScript 5.x strict · Express 4 · Prisma 5 · PostgreSQL 15
async: Bull 4 + Redis 7
auth: JWT + bcrypt (cost ≥12) + LDAP bind
frontend: React 18 · Vite 5 · Tailwind 3
testing: Jest · Supertest · Playwright · k6
infra: Docker Compose · Nginx 1.24+ · GitHub Actions · Ubuntu 22.04 on-premise
diagramas: Mermaid en docs/DIAGRAMS/*.mmd
```

---

## 2. Arquitectura Hexagonal (INVARIANTE)

### 2.1 Estructura obligatoria

```
backend/
├── domain/                 # CERO imports de frameworks
│   ├── declaracion-jurada/ # FSD-UC-002
│   ├── oferta-academica/   # FSD-UC-003
│   ├── gestion-docente/    # FSD-UC-006, UC-009
│   ├── gestion-academica/  # FSD-UC-004, UC-008
│   ├── informacion-financiera/ # FSD-UC-005
│   ├── administracion/     # FSD-UC-001, UC-010
│   └── notificaciones/
├── infrastructure/         # Prisma, LDAP, legados, SMTP, Bull
└── api/                    # Controllers + middleware Express

frontend/src/{pages,components,services}
docs/{BRD,MRD,PRD,FSD,SKILLS,DIAGRAMS,PROMPT_MAPPINGS,AGENTS}
.cursor/rules/              # Reglas Cursor activas
```

### 2.2 Regla de dependencias

```
api/ → domain/ ← infrastructure/
domain/ NUNCA importa Express, Prisma, Redis, Bull, axios
```

Código con `import` de `@prisma/client` en `domain/` → **inválido**.

---

## 3. Casos de Uso y Skills

| FSD-UC | Nombre | Skill principal | Prompt-contract |
|--------|--------|-----------------|-----------------|
| UC-001 | Autenticación RBAC | `auth-rbac-guard.md` | PR-FSD-UC-001 |
| UC-002 | Ciclo DJ | `dj-validator.md` | PR-FSD-UC-002 |
| UC-003 | Oferta académica | `offer-auditor.md` | PR-FSD-UC-003 |
| UC-004 | Horarios / carga | `integration-mapper.md` | PR-FSD-UC-004 |
| UC-005 | Boletas de pago | `boleta-privacy-guard.md` | PR-FSD-UC-005 |
| UC-006 | Perfil / CV | `spec-traceability-checker.md` | PR-FSD-UC-006 |
| UC-007 | Reportes DPA | `nfr-compliance.md` | PR-FSD-UC-007 |
| UC-008 | Calendario académico | `mermaid-architect.md` | PR-FSD-UC-008 |
| UC-009 | Roles docentes | `dj-validator.md` (RB-05) | PR-FSD-UC-009 |
| UC-010 | Admin usuarios/materias | `auth-rbac-guard.md` | PR-FSD-UC-010 |

**Skills accionables (8)** — carpeta `docs/SKILLS/`:

| Skill | Cuándo invocarlo |
|-------|------------------|
| `dj-validator.md` | DJ, estados, historial RB-06 |
| `offer-auditor.md` | Oferta académica, asignaciones |
| `boleta-privacy-guard.md` | Boletas, RB-04, Ley 164 financiero |
| `auth-rbac-guard.md` | Login, JWT, roles, RB-07 |
| `integration-mapper.md` | Adaptadores nómina / SII |
| `nfr-compliance.md` | Revisión NFR en PR |
| `mermaid-architect.md` | Diagramas `.mmd` |
| `spec-traceability-checker.md` | IDs BR/MRD/PRD/FSD, docs, PRs |

Cada skill incluye **procedimiento paso a paso** y **checklist de salida**.

---

## 4. Cursor Rules (4 dominio-específicas)

Ubicación activa: **`.cursor/rules/`** (espejo en `docs/.cursor/rules/`).

| Rule | Alcance |
|------|---------|
| `sgai-domain.mdc` | Terminología CEUB, enums, RB-01–07, trazabilidad IDs |
| `security-ley164.mdc` | PII, JWT, bcrypt, logs, Ley 164 — **alwaysApply** |
| `prisma-stack.mdc` | Schema, repos, transacciones, NFR-001 |
| `express-api-sgai.mdc` | Controllers, Zod, middleware, HTTP |

---

## 5. Reglas de Negocio (nunca bypass)

| ID | Regla | HTTP típico |
|----|-------|-------------|
| RB-01 | Solo `vinculacion_activa` crea/envía DJ | 403 |
| RB-02 | Oferta: Facultad → DPA (sin atajo) | Flujo |
| RB-03 | DJ aprobada/en revisión no editable | 403 |
| RB-04 | Boletas solo docente titular (JWT) | 403 |
| RB-05 | Roles institucionales misma facultad | 403 |
| RB-06 | Historial atómico con cambio de estado | Tx |
| RB-07 | 5 logins fallidos → bloqueo 15 min | 429 |

---

## 6. Guardrails Ley 164 (resumen)

- **Nunca logear:** `password`, `ci`, `haber_basico`, `descuentos`, `neto`, `campos_formulario` completos.
- **Boletas:** `docenteId` solo del JWT.
- **Validación:** Zod en `api/` antes del dominio.
- **Errores prod:** `{ error, correlationId }` — sin stack ni SQL.
- Detalle completo: `security-ley164.mdc`.

---

## 7. Workflow del Agente

### 7.1 Antes de codificar

```
1. Leer AGENTS.md (este archivo)
2. Leer skill de docs/SKILLS/ según FSD-UC
3. Leer PR-FSD-UC-NNN en PROMPT_MAPPINGS_v1.md
4. Verificar .cursor/rules/ aplicables
5. Consultar TRAZABILIDAD_COMPLETA.md si el ID no está claro
```

### 7.2 Al codificar

- TypeScript strict; errores tipados (`ForbiddenError`, `ValidationError`, …).
- `correlationId` en todos los logs.
- JSDoc: `@see FSD-UC-NNN`, `@see RB-NN`.
- Tests: ≥ 1 por regla de negocio tocada; dominio ≥ 80 % (NFR-010).

### 7.3 Al documentar

- Diagramas en `docs/DIAGRAMS/`.
- IDs: `BR-*`, `MRD-N-*`, `PRD-REQ-*`, `FSD-UC-*` — no inventar.
- Actualizar matriz de trazabilidad si hay nuevo enlace.

### 7.4 Stop conditions (detenerse y preguntar)

- Modificar sistema legado (solo lectura).
- Exponer boletas a rol no titular.
- Loggear campos prohibidos.
- Decisión arquitectónica sin ADR.
- Bounded context ambiguo para una entidad.

---

## 8. NFRs en código

| NFR | Umbral | Acción en código |
|-----|--------|------------------|
| NFR-001 | p95 < 2s | `select` Prisma, índices |
| NFR-002 | reportes < 10s | sync ≤500 filas; Bull si más |
| NFR-004 | AES-256 reposo | PII cifrado |
| NFR-006 | sesión ≤ 8h | JWT `expiresIn: '8h'` |
| NFR-007 | Ley 164 | §6 + security rule |
| NFR-008 | 200 VUs | `$transaction`, sin lock global |
| NFR-009 | correlationId 100% | middleware obligatorio |
| NFR-010 | cobertura ≥ 80% | Jest en `domain/` |

---

## 9. Métricas AI-SDLC

Fuente: `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md` §1

| Métrica | Valor | Umbral |
|---------|-------|--------|
| Prompt Coverage | 10/10 = 100% | ≥ 80% |
| Spec Fidelity | ~92% | ≥ 90% |
| Hallucination Rate | < 4% | ≤ 5% |

---

## 10. Trazabilidad documental

```
01_vision_negocio → BRD_v2 → MRD_v1.1 → PRD_v1 → FSD_v1
                                    ↓
              PROMPT_MAPPINGS_v1 · DIAGRAMS/*.mmd · SKILLS/*.md
                                    ↓
                            DTI_v1 · ADRs_v1 · código backend/
```

---

## 11. Registro de cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| v1.0 | 10/05/2026 | Versión inicial |
| v1.1 | 17/05/2026 | 8 skills, 4 cursor rules, 10 UC, rutas corregidas, workflow y métricas AI-SDLC |
