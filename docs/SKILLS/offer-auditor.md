# Skill: Offer Auditor — Validador de Oferta Académica

> **Cuándo usar:** Siempre que el agente genere lógica de Oferta Académica: flujo de aprobación, asignaciones, endpoints o tests.

---

## Procedimiento de ejecución

1. Leer `PR-FSD-UC-003` y diagramas `seq_uc003_oferta_envio_dpa.mmd`, `state_oferta_academica.mmd`.
2. Servicio de dominio en `domain/oferta-academica/` con `EstadoOferta` canónico.
3. Antes de `ENVIAR_DPA`: validar todas las materias con `docente_id` (422 `UNASSIGNED_SUBJECTS`).
4. Bloquear edición de facultad cuando `estado === EN_REVISION_DPA`.
5. Transición + `HISTORIAL_OFERTA` en misma transacción (RB-06).
6. Filtrar trámites por `facultad_id` del JWT para `ADMIN_FACULTAD`.

---

## Identidad

```yaml
skill_id: offer-auditor
versión: v1.0
dominio: oferta-academica
bounded_context: backend/domain/oferta-academica/
reglas_aplicables: [RB-02, RB-06]
```

## Ciclo de Vida de la Oferta Académica

```
EN_ELABORACION
  └──[enviarDPA: Admin.Facultad]──► EN_REVISION_DPA
       GUARDA: todas las materias deben tener docente asignado
            ├──[aprobar: TécnicoDPA]──► APROBADO (terminal)
            └──[observar: TécnicoDPA]──► OBSERVADO
                   └──[corregirReenviar: Admin.Facultad]──► EN_REVISION_DPA
```

## MUST

```
MUST verificar que TODAS las asignaciones tienen docente_id antes de ENVIAR_DPA (422 si no)
MUST bloquear edición del trámite para la Facultad una vez que está en EN_REVISION_DPA
MUST registrar en HISTORIAL_OFERTA en la misma transacción que el cambio de estado (RB-06)
MUST encolar notificación al actor destino de forma asíncrona
MUST sincronizar materias desde sistema institucional antes de permitir crear asignaciones
MUST verificar que el Admin.Facultad solo puede gestionar trámites de su propia facultad
```

## MUST NOT

```
MUST NOT permitir que una Facultad envíe directamente a otro rol sin pasar por su validación interna (RB-02)
MUST NOT permitir APROBAR un trámite ya en estado APROBADO
MUST NOT exponer asignaciones de otras facultades al Admin.Facultad autenticado
```

## Transiciones Válidas

| Estado actual | Comando | Actor | Condición | Estado nuevo |
|---|---|---|---|---|
| EN_ELABORACION | ENVIAR_DPA | ADMIN_FACULTAD | todas las materias asignadas | EN_REVISION_DPA |
| EN_REVISION_DPA | APROBAR | TECNICO_DPA | — | APROBADO |
| EN_REVISION_DPA | OBSERVAR | TECNICO_DPA | observaciones != null | OBSERVADO |
| OBSERVADO | CORREGIR_REENVIAR | ADMIN_FACULTAD | misma facultad | EN_REVISION_DPA |

## Failure Modes

| Situación | HTTP | Código |
|---|---|---|
| Trámite no encontrado | 404 | `OFFER_NOT_FOUND` |
| Actor sin permisos | 403 | `FORBIDDEN_OFFER_ACTION` |
| Materias sin docente asignado | 422 | `UNASSIGNED_SUBJECTS` |
| Observaciones requeridas | 422 | `OBSERVATIONS_REQUIRED` |
| Transición inválida | 422 | `INVALID_STATE_TRANSITION` |
| Error BD | 500 | `PERSISTENCE_ERROR` |

---

## Checklist de salida

- [ ] RB-02 garantizado por flujo (no endpoint directo a DPA sin `EN_ELABORACION`)
- [ ] Tests para `UNASSIGNED_SUBJECTS` y `OBSERVATIONS_REQUIRED`
- [ ] `@see FSD-UC-003` en servicio público
- [ ] Notificación asíncrona post-commit
