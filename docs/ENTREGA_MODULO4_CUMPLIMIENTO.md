# Cumplimiento Rúbrica — Módulo 4 · SGAI Release 1.0.0
**Docente:** Edson Terceros

**Autora:** Carolina Aguilar · **Grupo:** G01 · **Fecha:** 17/05/2026

---

## Resumen ejecutivo
En este resumen se encuentra descritos los archivos finales del avance que se presenta, en el repositorio se puede ver otras versiones de las pruebas y cambios realizados.

| Área | Requisito rúbrica | Estado | Evidencia principal |
|------|-------------------|--------|---------------------|
| BRD | ≥ 10 elementos de negocio desarrollados | ✅ | `docs/BRD/BRD_v2.md` §1–21 |
| MRD | ≥ 7 elementos + ≥ 2 segmentos | ✅ | `docs/MRD/MRD_v1.1.md` |
| PRD | US INVEST + ≥ 2 journeys + roadmap | ✅ | `docs/PRD/PRD_v1.md` |
| FSD | ≥ 30 elementos totales | ✅ | `docs/FSD/FSD_v1.md` §16 (94 elementos) |
| UC + Gherkin | ≥ 10 UC críticos verificables | ✅ | FSD §4.1–4.10 |
| NFR ISO 25010 | ≥ 8 cuantificables, ≥ 5 características | ✅ | FSD §11 |
| Diagramas | ≥ 10 `.mmd`, UC mapeados | ✅ | `docs/DIAGRAMS/` (16 archivos) |
| Trazabilidad | MRD → PRD → FSD completa | ✅ | `docs/TRAZABILIDAD_COMPLETA.md` |
| AI-SDLC | Prompt coverage + spec fidelity + 1+ | ✅ | `PROMPT_MAPPINGS_v1.md` §1 |
| AGENTS.md completo | Contrato agentes | ✅ | `AGENTS.md` + `docs/AGENTS/AGENTS.md` |
| Skills accionables | ≥ 5 | ✅ | **8** en `docs/SKILLS/` |
| Cursor rules dominio | ≥ 3 | ✅ | **4** en `.cursor/rules/` |

---

## 1. BRD — 10+ elementos de negocio

| # | Elemento | Sección BRD_v2 | Cumple |
|---|----------|----------------|--------|
| 1 | Objetivos SMART (5 BO con línea base y meta) | §9 | ✅ |
| 2 | Stakeholders + RACI (10 filas) | §10 | ✅ |
| 3 | Business case ROI / VAN / TIR / payback | §15 | ✅ |
| 4 | Alcance en / fuera | §14 | ✅ |
| 5 | KPIs North Star + 4 de apoyo | §8 | ✅ |
| 6 | Restricciones | §13 | ✅ |
| 7 | Supuestos | §13 | ✅ |
| 8 | Riesgos de negocio (6) | §16 | ✅ |
| 9 | Gobernanza (comités, gates, datos) | §19 | ✅ |
| 10 | Criterios de éxito | §17 | ✅ |
| 11 | Requerimientos BR-001–014 | §11 | ✅ |
| 12 | Reglas RB-01–07 | §12 | ✅ |

---

## 2. MRD — 7+ elementos y segmentos

| Elemento | Sección | Cumple |
|----------|---------|--------|
| Segmentación (4 segmentos; **Seg-1** y **Seg-2** detallados) | §4.1 | ✅ |
| Personas (4 completas) | §4.2 | ✅ |
| Jobs-to-be-Done (8) | §5 | ✅ |
| **Voz del Cliente** (8 entrevistas, citas, temas) | §4.3 | ✅ |
| Competencia (matriz 24 criterios) | §6 | ✅ |
| Posicionamiento + Océano Azul ERIC | §6–7 | ✅ |
| Hipótesis H-01–H-06 | §12 | ✅ |
| TAM/SAM/SOM | §3.1 | ✅ |
| Go-to-market | §9 | ✅ |

---

## 3. PRD

| Criterio | Cantidad | Evidencia |
|----------|----------|-----------|
| User stories INVEST + criterios Gherkin | **17** (PRD-US-001–017) | PRD §5 |
| User journeys Mermaid | **2** (docente + admin facultad) | PRD §4.2 |
| Roadmap versiones | v0.1 → v2.0 | PRD §3.3 |
| Roadmap validación (Discovery) | 4 sprints | PRD §3.4 |

---

## 4. FSD — inventario (≥ 30)

| Tipo | Cantidad |
|------|----------|
| Casos de uso FSD-UC-001–010 | 10 |
| Reglas de negocio (tabla §5) | 7 |
| Escenarios Gherkin (bloques) | 12 |
| Contratos API (endpoints) | 16 |
| NFR cuantificables | 10 |
| Tasks Spec Kit | 14 |
| Actores | 7 |
| Modelo ER + diccionario | 1 + 10 entidades |
| Prompt-contratos | 10 |
| Integraciones externas | 4 |
| Riesgos funcionales | 5 |
| Glosario | 8 términos |
| Anexos referenciados | 5 |
| **Total documentado** | **94** |

---

## 5. Casos de uso críticos + Gherkin (≥ 10)

Todos en `docs/FSD/FSD_v1.md` §4: flujo principal, alternos/excepciones, datos, **≥ 1 bloque Gherkin verificable** por UC.

| UC | Gherkin | Diagrama |
|----|---------|----------|
| FSD-UC-001 | Login + bloqueo 5 intentos | `seq_uc001_autenticacion.mmd` |
| FSD-UC-002 | Enviar DJ + DJ aprobada no editable | `seq_uc002_dj_envio.mmd`, `state_dj.mmd` |
| FSD-UC-003 | Enviar oferta + reenvío desde OBSERVADO | `seq_uc003_oferta_envio_dpa.mmd`, `state_oferta_academica.mmd` |
| FSD-UC-004 | Mi horario < 2s | `seq_uc004_horario_consulta.mmd` |
| FSD-UC-005 | Boleta propia + 403 ajena | `seq_uc005_boleta_consulta.mmd` |
| FSD-UC-006 | PATCH perfil + 403 ajeno | `seq_uc006_perfil_cv.mmd` |
| FSD-UC-007 | Reporte sync + 403 docente | `seq_uc007_reportes_dpa.mmd` |
| FSD-UC-008 | Publicar calendario + cross-faculty | `seq_uc008_calendario.mmd` |
| FSD-UC-009 | Asignar rol + RB-05 | `seq_uc009_roles_docente.mmd` |
| FSD-UC-010 | Crear usuario + código materia duplicado | `seq_uc010_admin_usuarios.mmd` |

---

## 6. NFRs ISO/IEC 25010 (8+, 5+ características)

| NFR | Característica ISO 25010 |
|-----|--------------------------|
| NFR-001, NFR-002, NFR-008 | Eficiencia de rendimiento |
| NFR-003 | Fiabilidad (disponibilidad) |
| NFR-004, NFR-005, NFR-006 | Seguridad |
| NFR-007 | Cumplimiento normativo |
| NFR-009, NFR-010 | Mantenibilidad |

Fuente: `docs/FSD/FSD_v1.md` §11 — cada fila con **métrica, umbral y verificación**.

---

## 7. Diagramas Mermaid (16 archivos)

| Tipo | Archivos |
|------|----------|
| Secuencia (10 UC) | `seq_uc001` … `seq_uc010` |
| Estado | `state_dj.mmd`, `state_oferta_academica.mmd` |
| ER | `er_sgai_core.mmd` |
| Gantt / roadmap | `gantt_roadmap_v1.mmd` |
| C4 contenedor | `c4_cont_sgai_v1.mmd` |
| Integración | `seq_sync_legados.mmd` |

Mapa UC ↔ diagrama: FSD §4.11.

---

## 8. Trazabilidad MRD → PRD → FSD

- Matriz maestra: `docs/TRAZABILIDAD_COMPLETA.md`
- Resumen en FSD: §12
- MRD §14, PRD §14, BRD §18

---

## 9. Métricas AI-SDLC

Fuente: `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md` §1

| Métrica | Valor | Umbral | Estado |
|---------|-------|--------|--------|
| **Prompt Coverage** | 10/10 = **100 %** | ≥ 80 % | ✅ |
| **Spec Fidelity** | **~92 %** | ≥ 90 % | ✅ |
| **Hallucination Rate** (adicional) | **< 4 %** | ≤ 5 % | ✅ |
| Reversion Rate (adicional) | ~8 % | ≤ 10 % | ✅ |
| NFR Coverage (adicional) | 100 % vía skill | 100 % | ✅ |

---

## 10. Índice de documentos para el revisor

| Documento | Ruta |
|-----------|------|
| BRD v2 | `docs/BRD/BRD_v2.md` |
| MRD v1.1 | `docs/MRD/MRD_v1.1.md` |
| PRD v1 | `docs/PRD/PRD_v1.md` |
| FSD v1.1 | `docs/FSD/FSD_v1.md` |
| DTI | `DTI_v1.md` |
| ADRs | `ADRs_v1.md` |
| Prompt mappings | `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md` |
| AGENTS | `docs/AGENTS/AGENTS.md` |
| Diagramas | `docs/DIAGRAMS/*.mmd` |
| Trazabilidad | `docs/TRAZABILIDAD_COMPLETA.md` |
| Aportes | `docs/aportes_release_1_0_0.md` |
