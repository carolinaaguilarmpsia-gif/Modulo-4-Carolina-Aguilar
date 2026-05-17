# Matriz de Trazabilidad Completa — SGAI Release 1.0.0

> Cadena documental: **Visión** → **BRD** → **MRD** → **PRD** → **FSD** → **Diagramas / Prompts / Código**

---

## 1. Trazabilidad MRD → PRD → FSD (núcleo)

| MRD | Descripción mercado | PRD (REQ / US) | FSD-UC | Diagrama `.mmd` | Prompt-contract |
|-----|---------------------|----------------|--------|-----------------|-----------------|
| MRD-N-01 | Ciclo DJ multinivel | PRD-REQ-002, PRD-US-001–005 | FSD-UC-002 | `seq_uc002_dj_envio`, `state_dj` | PR-FSD-UC-002 |
| MRD-N-02 | Oferta académica digital | PRD-REQ-003, PRD-US-006–008 | FSD-UC-003 | `seq_uc003_oferta_envio_dpa`, `state_oferta_academica` | PR-FSD-UC-003 |
| MRD-N-03 | Self-service horarios | PRD-REQ-007, PRD-US-010, PRD-US-012 | FSD-UC-004, FSD-UC-008 | `seq_uc004_horario_consulta`, `seq_uc008_calendario` | PR-FSD-UC-004, PR-FSD-UC-008 |
| MRD-N-04 | Boletas integradas nómina | PRD-REQ-006, PRD-US-011, PRD-REQ-012 | FSD-UC-005 | `seq_uc005_boleta_consulta` | PR-FSD-UC-005 |
| MRD-N-05 | Integración sin modificar legados | PRD-REQ-007 | FSD-UC-004 (+ sync) | `seq_sync_legados` | PR-FSD-UC-004 |
| MRD-N-06 | Reportes DPA exportables | PRD-REQ-009, PRD-US-009 | FSD-UC-007 | `seq_uc007_reportes_dpa` | PR-FSD-UC-007 |
| MRD-N-07 | Ley 164 / servidores locales | PRD-NFR-004–007 | FSD-UC-001, UC-005 | `seq_uc001_autenticacion` | PR-FSD-UC-001 |
| MRD-N-08 | Flujos configurables | PRD-REQ-011, PRD-US-016 | FSD-UC-009 | `seq_uc009_roles_docente` | PR-FSD-UC-009 |
| MRD-N-09 | ≥ 200 usuarios concurrentes | PRD-NFR-008 | Todos (NFR transversal) | — | `nfr-compliance.md` skill |
| MRD-N-10 | Operable por TI on-premise | PRD-REQ-001, PRD-US-014–015 | FSD-UC-010 | `seq_uc010_admin_usuarios`, `c4_cont_sgai_v1` | PR-FSD-UC-010 |

---

## 2. Trazabilidad BRD → MRD → PRD → FSD

| BRD | MRD | PRD | FSD-UC |
|-----|-----|-----|--------|
| BR-001 | MRD-N-01 | PRD-REQ-002, PRD-US-001–003 | FSD-UC-002 |
| BR-002 | MRD-N-02 | PRD-REQ-003, PRD-US-006–007 | FSD-UC-003 |
| BR-003 | MRD-N-02 | PRD-REQ-003, PRD-US-008 | FSD-UC-003 |
| BR-004 | MRD-N-03 | PRD-REQ-007, PRD-US-010, PRD-US-012 | FSD-UC-004, FSD-UC-008 |
| BR-005 | MRD-N-04 | PRD-REQ-006, PRD-US-011 | FSD-UC-005 |
| BR-006 | MRD-N-01 | PRD-REQ-004, PRD-US-005 | FSD-UC-002 |
| BR-007 | MRD-N-01 | PRD-REQ-005, PRD-US-001 | FSD-UC-002 |
| BR-008 | MRD-N-08 | PRD-REQ-011, PRD-US-016 | FSD-UC-009 |
| BR-009 | MRD-N-04 | PRD-REQ-006 | FSD-UC-005 |
| BR-010 | MRD-N-05 | PRD-REQ-007 | FSD-UC-004 |
| BR-011 | MRD-N-10 | PRD-REQ-001, PRD-US-014–015 | FSD-UC-010 |
| BR-012 | MRD-N-06 | PRD-REQ-009, PRD-US-009 | FSD-UC-007 |
| BR-013 | MRD-N-01 | PRD-US-013 | FSD-UC-006 |
| BR-014 | MRD-N-01, N-02 | PRD-REQ-008, PRD-US-017 | FSD-UC-002, UC-003 (eventos) |

---

## 3. User Stories → Casos de uso

| PRD-US | Título resumido | FSD-UC |
|--------|-----------------|--------|
| PRD-US-001 | Crear DJ | FSD-UC-002 |
| PRD-US-002 | Enviar DJ | FSD-UC-002 |
| PRD-US-003 | Consultar estado DJ | FSD-UC-002 |
| PRD-US-004 | Revisar DJ (Facultad) | FSD-UC-002 |
| PRD-US-005 | Inmutabilidad DJ | FSD-UC-002 |
| PRD-US-006 | Crear oferta | FSD-UC-003 |
| PRD-US-007 | Enviar oferta al DPA | FSD-UC-003 |
| PRD-US-008 | Aprobar/observar oferta (DPA) | FSD-UC-003 |
| PRD-US-009 | Reportes DPA | FSD-UC-007 |
| PRD-US-010 | Consultar horario | FSD-UC-004 |
| PRD-US-011 | Boletas de pago | FSD-UC-005 |
| PRD-US-012 | Calendario académico | FSD-UC-008 |
| PRD-US-013 | Actualizar CV | FSD-UC-006 |
| PRD-US-014 | Gestionar usuarios | FSD-UC-010 |
| PRD-US-015 | Configurar materias | FSD-UC-010 |
| PRD-US-016 | Roles docentes | FSD-UC-009 |
| PRD-US-017 | Notificaciones email | FSD-UC-002, UC-003 |

---

## 4. NFRs → Verificación

| NFR | PRD-NFR | FSD §11 | Verificación |
|-----|---------|---------|--------------|
| NFR-001 | PRD-NFR-001 | Latencia CRUD p95 < 2s | k6 |
| NFR-002 | PRD-NFR-002 | Reportes < 10s | Jest + cronómetro |
| NFR-003 | PRD-NFR-003 | Uptime ≥ 99% | Uptime Robot |
| NFR-004 | PRD-NFR-004 | AES-256 reposo | Auditoría BD |
| NFR-005 | PRD-NFR-005 | TLS 1.2+ | SSL Labs |
| NFR-006 | PRD-NFR-006 | Sesión ≤ 8h | Test JWT |
| NFR-007 | PRD-NFR-007 | Ley 164 100% | Legal + OWASP |
| NFR-008 | PRD-NFR-008 | ≥ 200 VUs | k6 stress |
| NFR-009 | — | correlationId 100% | Logs staging |
| NFR-010 | — | Cobertura dominio ≥ 80% | Jest CI |

---

## 5. Registro

| Versión | Fecha | Autor |
|---------|-------|-------|
| 1.0 | 16/05/2026 | Carolina Aguilar |
