# Roadmap Técnico SGAI — Release 2.0.0 y Módulo Siguiente

**Grupo:** G01 · **Autora:** Carolina Aguilar · **Fecha:** 18/05/2026  
**Fuentes:** `docs/DTI.md` §19, POC-01/02, ADR-0005/0006, `docs/prd/PRD_vFinal.md` §3.3

---

## 1. Hitos consolidados

| Hito | Fecha objetivo | Entregable | ADR / POC |
|------|----------------|------------|-----------|
| R1.0 Documentación + arquitectura | Q2 2026 | BRD/MRD/PRD/FSD/DTI vFinal, 6 ADRs | ADR-0001–0004 |
| R1.0 POCs críticas | May 2026 | POC-01 pass, POC-02 pass | §12 DTI |
| R1.1 Backend MVP on-prem | Q3 2026 | API DJ + Auth + Docker Compose | ADR-0004 |
| R2.0 AWS staging | Q1 2027 | ECS + RDS + SQS (sa-east-1) | ADR-0005 |
| R2.0 Event-driven workers | Q1 2027 | Outbox + EventBridge | ADR-0006 |
| R2.0 Multi-sede CEUB | Q2 2027 | CloudFront + VPN LDAP | MRD-N-010 |

---

## 2. Riesgos técnicos (desde POCs)

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Legado sin API estable | Alta | Alto | ADR-0002; modo degradado; POC-01 pass |
| Concurrencia DJ | Media | Alto | RB-06; POC-02 pass |
| Costo AWS > presupuesto | Media | Medio | Fargate mínimo; staging Single-AZ |
| Latencia LDAP cross-VPN | Media | Medio | Cache usuarios; réplica read-only |

---

## 3. Métricas que alimentan el roadmap

| Métrica | Valor POC / AI-SDLC | Decisión |
|---------|---------------------|----------|
| POC-01 p95 lectura legado | 1,2 s (< 5 s) | Sprint 0 integración |
| POC-02 p95 transición DJ | 420 ms (< 2 s NFR-001) | No saga distribuida en DJ |
| Prompt Coverage | 100 % | Mantener 10 PR-FSD-UC-* |
| Spec Fidelity | ~92 % | Revisión humana en vFinal |

---

## 4. Pasos lógicos (próximo módulo)

1. Implementar `backend/domain/declaracion-jurada` + tests RB-01/06.
2. Terraform módulo `infra/aws/staging` (VPC, ECS, RDS) — gate CEUB.
3. Migrar publicador Bull → Outbox (ADR-0006) tras cutover RDS.
4. Playwright E2E FSD-UC-001–005 en CI.
5. Actualizar `docs/aportes/release-2.0.0.md` por sprint.

**Diagrama:** `docs/diagrams/gantt_roadmap_v2.mmd`
