# Skill: Spec Traceability Checker — Trazabilidad MRD → PRD → FSD → Código

> **Cuándo usar:** Al crear PRs, documentación, nuevos endpoints, user stories o antes de cerrar un sprint; valida que los IDs y enlaces de la cadena spec no se rompan.

---

## Identidad

```yaml
skill_id: spec-traceability-checker
versión: v1.0
referencia_matriz: docs/TRAZABILIDAD_COMPLETA.md
referencia_entrega: docs/ENTREGA_MODULO4_CUMPLIMIENTO.md
```

---

## Procedimiento de ejecución

1. Identificar el **artefacto tocado** (código, FSD, PRD, diagrama).
2. Localizar el ID canónico: `FSD-UC-NNN`, `PRD-US-NNN`, `PRD-REQ-NNN`, `MRD-N-NN`, `BR-NNN`.
3. Consultar `docs/TRAZABILIDAD_COMPLETA.md` — verificar cadena ascendente y descendente.
4. Si falta enlace: actualizar matriz + sección §14 del doc afectado (MRD/PRD/FSD).
5. En código: añadir JSDoc `@see FSD-UC-NNN` y `@see RB-NN` en funciones de dominio públicas.
6. Si nuevo UC: crear entrada en FSD §4, prompt-contract en `PROMPT_MAPPINGS_v1.md`, diagrama `seq_ucNNN_*.mmd`.
7. Recalcular **Prompt Coverage** si aplica (UC críticos / prompts documentados).

---

## Prefijos de ID (no inventar)

| Prefijo | Documento |
|---------|-----------|
| BR-NNN | `docs/BRD/BRD_v2.md` |
| MRD-N-NN | `docs/MRD/MRD_v1.1.md` |
| PRD-US-NNN, PRD-REQ-NNN | `docs/PRD/PRD_v1.md` |
| FSD-UC-NNN | `docs/FSD/FSD_v1.md` |
| NFR-NNN | FSD §11 |
| PR-FSD-UC-NNN | `docs/PROMPT_MAPPINGS/PROMPT_MAPPINGS_v1.md` |

---

## Checklist de salida

- [ ] Todo cambio funcional referencia al menos 1 `FSD-UC-*`
- [ ] Reglas de negocio citan `RB-*` existentes (no renumerar sin ADR)
- [ ] Diagrama `.mmd` actualizado si cambia flujo o estados
- [ ] Prompt-contract existe para UC crítico nuevo
- [ ] `ENTREGA_MODULO4_CUMPLIMIENTO.md` sigue válido tras el cambio
