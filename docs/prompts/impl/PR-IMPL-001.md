# PR-IMPL-001 — Dominio de Declaraciones Juradas (Prompt de Implementación)

| Campo | Valor |
|-------|-------|
| FSD-UC | FSD-UC-002 |
| Design Doc | `DD-UC-001` |
| PRD | PRD-REQ-002, PRD-REQ-004, PRD-REQ-005, PRD-REQ-010 |
| Skill | `docs/SKILLS/dj-validator.md` |
| Reglas | RB-01, RB-03, RB-05, RB-06 |
| Diagramas | `docs/DIAGRAMS/state_dj.mmd` |
| Release | `release/3.0.0` |
| Estado | ejecutado — ver artefactos generados |

## Role

Eres el implementador del núcleo de dominio (hexagonal, sin frameworks) del módulo de Declaraciones Juradas del SGAI, siguiendo `DD-UC-001` y el DTI vFinal §5.

## Task

1. Definir la entidad `DeclaracionJurada` y los tipos (`EstadoDJ`, `ComandoDJ`, `CrearDJCommand`, `TransicionDJCommand/Result`) sin ninguna dependencia de infraestructura.
2. Implementar `DJStateMachine` como tabla de reglas de transición pura (`resolveTransition`, `assertCamposEditables`), validando rol, misma facultad, vinculación activa y observaciones obligatorias.
3. Implementar `DeclaracionJuradaService` orquestando `crear`, `listar`, `obtenerDetalle`, `actualizarCampos`, `transicionarEstado` contra los puertos `IDeclaracionJuradaRepository` e `INotificacionPublisher`.
4. Definir la jerarquía de errores de dominio (`DomainError`, `ForbiddenError`, `NotFoundError`, `ValidationError`) con mensajes en español boliviano, sin PII.
5. Escribir tests unitarios de `DJStateMachine` cubriendo al menos RB-01 y RB-03.

## Context

- Entrada de transición: `{ djId, comando, actorId, actorRol, actorFacultadId?, observaciones? }`.
- `ComandoDJ`: ENVIAR | APROBAR | DEVOLVER | ESCALAR_DPA | REENVIAR | RECHAZAR.
- Estados terminales: `APROBADA`, `RECHAZADA` — ninguna transición posible desde ellos.
- NO loggear ni incluir en errores `campos_formulario` completo, `password`, `ci`.
- `domain/` no puede importar `express`, `@prisma/client`, `bull` ni ningún framework (invariante hexagonal, ADR-0001).

## Reasoning

1. Buscar en `REGLAS` la fila `(estadoActual, comando)`; si no existe → `ValidationError('INVALID_STATE_TRANSITION')`.
2. Si el estado actual es terminal → `ForbiddenError('FORBIDDEN_TRANSITION')` antes de mirar la tabla.
3. Verificar `actorRol` contra `rolesPermitidos` de la regla → si no coincide, `ForbiddenError('FORBIDDEN_TRANSITION')`.
4. Si `requiereMismaFacultad` → comparar `actorFacultadId` vs `djFacultadId` (RB-05 aplicado a Admin. Facultad).
5. Si `requiereVinculacionActiva` (ENVIAR) y `docenteVinculacionActiva === false` → `ForbiddenError('INACTIVE_BINDING')` (RB-01).
6. Si `requiereObservaciones` (DEVOLVER/RECHAZAR) y no hay observaciones no vacías → `ValidationError('OBSERVATIONS_REQUIRED')`.
7. Devolver `{ estadoAnterior, estadoNuevo }`; el `Service` delega la persistencia atómica al repositorio (RB-06) y luego intenta notificar sin bloquear el resultado si falla.

## Stop Condition

- 404 `DJ_NOT_FOUND` (resuelto en el `Service`, no en el FSM).
- 403 `FORBIDDEN_TRANSITION` | `INACTIVE_BINDING`.
- 422 `INVALID_STATE_TRANSITION` | `OBSERVATIONS_REQUIRED`.
- Detener si se detecta un import de `express`/`@prisma/client`/`bull` dentro de `domain/` — violación del invariante hexagonal.

## Output

- `backend/domain/declaracion-jurada/entities/DeclaracionJurada.ts`
- `backend/domain/declaracion-jurada/types/{ComandoDJ,EstadoDJ,CrearDJ,TransicionDJ}.ts`
- `backend/domain/declaracion-jurada/services/{DJStateMachine.ts,DeclaracionJuradaService.ts}`
- `backend/domain/declaracion-jurada/ports/out/{IDeclaracionJuradaRepository.ts,INotificacionPublisher.ts}`
- `backend/domain/shared/errors/DomainError.ts`
- `backend/domain/declaracion-jurada/services/DJStateMachine.test.ts`

## Invariants

- `domain/` cero dependencias de infraestructura (ADR-0001).
- Historial y estado se resuelven en una sola llamada atómica al puerto de salida (RB-06) — la atomicidad real la garantiza el adaptador (Prisma `$transaction`), no el dominio.
- `APROBADA` y `RECHAZADA` son estados terminales.
- Ninguna regla de negocio vive en el controller ni en la UI.

## Trazabilidad

`FSD-UC-002` → `DD-UC-001` §2, §5 → `PR-IMPL-001` → `backend/domain/declaracion-jurada/**` → `DJStateMachine.test.ts` → `docs/product/DTP.md` §A.3.

## Métricas (Antes vs Después)

| Métrica | Antes | Después |
|---------|-------|---------|
| Reglas de transición cubiertas por test | 0/7 | 3/7 (RB-01 envío, terminal, RB-03 edición) — resto pendiente |
| Dependencias externas en `domain/declaracion-jurada` | — | 0 (verificado por lectura de imports) |
