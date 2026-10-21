# API Documentation

## Prefijos montados (`backend/api/app.ts:141-150`)

| Prefijo | Router | Auth |
|---|---|---|
| `GET /health` | inline | pública |
| `/api/v1/auth` | `createAuthRouter` | pública (rate limit) |
| `/api/v1/declaraciones-juradas` | `createDjRouter` | JWT, los 4 roles |
| `/api/v1/asistente` | `createAsistenteRouter` | ver código (fuera del foco) |
| `/api/v1/asistente-tramites` | `createAsistenteTramitesRouter` | ver código (fuera del foco) |
| `/api/v1/agente-dj` | `createAgenteDjRouter` | JWT, `ADMIN_FACULTAD` y `TECNICO_DPA` |
| `/api/v1/orquestador` | `createOrquestadorRouter` | JWT |

No existe el prefijo `/api/dj`; el `feature.md` pide `GET /api/dj/estadisticas`, que no coincide con la convención `/api/v1/declaraciones-juradas`.

## Endpoints de DJ (`dj.routes.ts:17-29`)

Todos pasan por `requireRole(jwt, usuarios, [DOCENTE, ADMIN_FACULTAD, TECNICO_DPA, ADMIN_SISTEMA])`.

| Método y ruta | Validación | Respuesta |
|---|---|---|
| `GET /` | query `estado`, `page` leídos a mano | 200 `{ items[], total, correlationId }` |
| `POST /` | `CreateDjSchema` (422 si inválido) | 201 `{ id, estado, correlationId }` |
| `GET /:id` | ninguna | 200 detalle + `historial` + `correlationId` |
| `PATCH /:id` | `UpdateDjCamposSchema` | 200 detalle + `correlationId` |
| `PATCH /:id/estado` | `TransicionDjSchema` | 200 `{ id, estadoAnterior, estadoNuevo, historialId, notificacionEncolada, correlationId }` |

Nota: `GET /:id` captura cualquier segmento, así que `GET /estadisticas` debe declararse antes.

## Contrato de errores

`globalErrorHandler` (`auth.middleware.ts:107-121`):
- `DomainError` responde `httpStatus` con `{ error: code, message, correlationId }`.
- Otro error responde 500 `{ error: 'INTERNAL_ERROR', correlationId }`.
- `validateBody` responde 422 `{ error: 'VALIDATION_ERROR', message, details, correlationId }`.
- 401: `UnauthorizedError('TOKEN_INVALID' | 'TOKEN_EXPIRED')`; 403: `ForbiddenError('INSUFFICIENT_ROLE' | 'FORBIDDEN_TRANSITION' | 'INACTIVE_BINDING')`; 404: `NotFoundError('DJ_NOT_FOUND')`.

## Contrato solicitado por la intención (`feature.md`)

Entrada `?facultadId=` opcional. Salida 200 `{ porEstado: {6 estados}, total, correlationId }`. Errores: 401 sin token y 403 si `ADMIN_FACULTAD` pide una facultad ajena.

## Interfaces internas

- Puerto `IDeclaracionJuradaRepository`: `create`, `findById`, `list` (paginado), `updateCampos`, `transicionarAtomica`, `getHistorial`. Sin conteo.
- Servicio `DeclaracionJuradaService`: `crear`, `listar`, `obtenerDetalle`, `actualizarCampos`, `transicionarEstado`.
- `ActorContext { userId, rol, facultadId? }`.
