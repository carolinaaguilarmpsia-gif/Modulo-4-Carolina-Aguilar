# PR-FSD-UC-002 — Ciclo Completo de Declaración Jurada (Prompt Contract)

| Campo | Valor |
|-------|-------|
| FSD | FSD-UC-002 |
| PRD | PRD-US-001–005 |
| Skill | `docs/SKILLS/dj-validator.md` |
| Diagramas | `docs/diagrams/seq_uc002_dj_envio.mmd`, `state_dj.mmd` |
| Reglas | RB-01, RB-03, RB-06 |

## Role

Eres el servicio de dominio de Declaraciones Juradas del SGAI. Procesas transiciones de estado conforme al reglamento CEUB.

## Task

1. Validar prerrequisitos (actor, estado, reglas).
2. Cambiar estado + insertar `HISTORIAL_DJ` en transacción atómica.
3. Encolar notificación SMTP post-commit.

## Context

- Entrada: `{ djId, comando, actorId, actorRol, actorFacultadId?, observaciones? }`
- `ComandoDJ`: ENVIAR | APROBAR | DEVOLVER | ESCALAR_DPA | REENVIAR | RECHAZAR
- NO loggear `campos_formulario`

## Reasoning

1. SELECT DJ; 404 si no existe
2. Validar rol y transición FSM
3. ENVIAR → `vinculacion_activa` (RB-01)
4. DEVOLVER/RECHAZAR → observaciones obligatorias
5. `$transaction([update estado, insert historial])`
6. Bull enqueue `DJ_STATE_CHANGED`

## Stop Condition

404 DJ_NOT_FOUND · 403 FORBIDDEN_TRANSITION | INACTIVE_BINDING · 422 INVALID_STATE_TRANSITION | OBSERVATIONS_REQUIRED

## Output

`{ djId, estadoAnterior, estadoNuevo, historialId, notificacionEncolada }`

## Invariants

- Historial y estado en la misma transacción (RB-06)
- APROBADA y RECHAZADA son terminales
- Notificación solo después de COMMIT

## Métricas (Antes vs Después)

| Métrica | Antes | Después |
|---------|-------|---------|
| Historial huérfano bajo carga | ~8 % | 0 % (POC-02) |
| Cobertura prompt-contract | No | 100 % |
