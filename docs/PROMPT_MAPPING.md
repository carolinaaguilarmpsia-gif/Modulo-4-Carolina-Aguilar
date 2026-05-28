# PROMPT_MAPPING — SGAI vFinal

**Flujo:** Input → Prompt (`prompts/PR-*.md`) → Output · **Detalle:** `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md`

---

## 1. Métricas AI-SDLC (Antes vs Después)

| Métrica | Antes (sin contratos) | Después (vFinal) | Umbral | § |
|---------|----------------------|------------------|--------|---|
| Prompt Coverage | 3/10 UC (30 %) | **10/10 (100 %)** | ≥ 80 % | §9 |
| Spec Fidelity | ~70 % | **~92 %** | ≥ 90 % | §9 |
| Hallucination Rate | ~12 % | **< 4 %** | ≤ 5 % | §9 |
| p95 latencia DJ (POC-02) | ~890 ms (est.) | **420 ms** | < 2000 ms | §9 |
| Tiempo redacción FSD UC | ~4 h/UC | **~1,5 h/UC** | — | §9 |
| Security guardrails en PR-UC | 2/10 | **7/10** (PII) | ≥ 70 % | §3.5.1 |

---

## 2. Tabla completa — Símbolo → Archivo → Métricas

| Símbolo | Archivo / Sección | FSD-UC | Skill | Antes | Después |
|---------|-------------------|--------|-------|-------|---------|
| PR-FSD-UC-001 | `prompts/PR-FSD-UC-001.md` | UC-001 | auth-rbac-guard | Sin RB-07 explícito | Bloqueo 5×/15 min testeable |
| PR-FSD-UC-002 | `prompts/PR-FSD-UC-002.md` | UC-002 | dj-validator | Historial no atómico en borrador | RB-06 `$transaction` |
| PR-FSD-UC-003 | `prompts/PR-FSD-UC-003.md` | UC-003 | offer-auditor | — | RB-02 + materias asignadas |
| PR-FSD-UC-004 | `prompts/PR-FSD-UC-004.md` | UC-004 | integration-mapper | — | Modo degradado |
| PR-FSD-UC-005 | `prompts/PR-FSD-UC-005.md` | UC-005 | boleta-privacy-guard | docenteId en params (riesgo) | RB-04 JWT only |
| PR-FSD-UC-006 | `prompts/PR-FSD-UC-006.md` | UC-006 | spec-traceability | — | Zod perfil |
| PR-FSD-UC-007 | `prompts/PR-FSD-UC-007.md` | UC-007 | nfr-compliance | — | Reportes async |
| PR-FSD-UC-008 | `prompts/PR-FSD-UC-008.md` | UC-008 | mermaid-architect | — | Calendario facultad |
| PR-FSD-UC-009 | `prompts/PR-FSD-UC-009.md` | UC-009 | dj-validator | — | RB-05 misma facultad |
| PR-FSD-UC-010 | `prompts/PR-FSD-UC-010.md` | UC-010 | auth-rbac-guard | — | Admin CRUD |
| PR-BRD-001 | PROMPT_MAPPINGS §4 | BRD | — | BRD v0.1 | BRD_vFinal |
| PR-PRD-001 | PROMPT_MAPPINGS §4 | PRD | — | 8 US | 17 US + Gherkin |

---

## 3. Trazabilidad MRD → PRD → FSD → DTI

| MRD | PRD | FSD | DTI | Prompt |
|-----|-----|-----|-----|--------|
| MRD-N-003 | PRD-REQ-002 | FSD-UC-002 | §5, §7 | PR-FSD-UC-002 |
| MRD-N-005 | PRD-REQ-005 | FSD-UC-005 | §13 RB-04 | PR-FSD-UC-005 |
| MRD-N-010 | PRD roadmap v2.0 | — | §8.5 AWS | ADR-0005 |

Ver `docs/TRAZABILIDAD_COMPLETA.md`.
