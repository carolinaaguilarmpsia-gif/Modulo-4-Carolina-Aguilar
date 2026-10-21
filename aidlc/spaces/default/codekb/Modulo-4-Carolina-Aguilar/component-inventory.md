# Component Inventory

Solo los componentes analizados en profundidad (alcance `backend/`). El resto de módulos aparece en `code-structure.md`.

## createDjRouter
- Archivo: `backend/api/routes/dj.routes.ts`
- Responsabilidad: registra los endpoints de DJ y aplica `requireRole` a todo el router.
- Depende de: `DjController`, `IJwtSigner`, `IUsuarioRepository`, `Rol`, `asyncHandler`, `validateBody`.

## DjController
- Archivo: `backend/api/controllers/dj.controller.ts`
- Responsabilidad: traduce HTTP a llamadas del servicio y serializa respuestas (`toSummary`, `toDetail`).
- Depende de: `DeclaracionJuradaService`, `AuthenticatedRequest`.

## requireRole
- Archivo: `backend/api/middleware/auth.middleware.ts`
- Responsabilidad: verifica el Bearer JWT, el rol y la vinculación activa; fija `req.user` y `req.correlationId`.
- Depende de: `IJwtSigner`, `IUsuarioRepository`, `UnauthorizedError`, `ForbiddenError`.

## globalErrorHandler
- Archivo: `backend/api/middleware/auth.middleware.ts`
- Responsabilidad: traduce `DomainError` a JSON con estado HTTP; el resto a 500.

## asyncHandler
- Archivo: `backend/api/middleware/asyncHandler.ts`
- Responsabilidad: reenvía rechazos de promesas a `next`.

## dj.validator
- Archivo: `backend/api/validators/dj.validator.ts`
- Responsabilidad: esquemas zod y `validateBody`; define `ListDjQuerySchema` sin uso.

## DeclaracionJuradaService
- Archivo: `backend/domain/declaracion-jurada/services/DeclaracionJuradaService.ts`
- Responsabilidad: CRUD, alcance por rol, transiciones y notificación.
- Depende de: `IDeclaracionJuradaRepository`, `INotificacionPublisher`, `DJStateMachine`, `DomainError`.

## IDeclaracionJuradaRepository
- Archivo: `backend/domain/declaracion-jurada/ports/out/IDeclaracionJuradaRepository.ts`
- Responsabilidad: puerto de persistencia de DJ e historial.

## InMemoryDeclaracionJuradaRepository
- Archivo: `backend/infrastructure/persistence/InMemoryDeclaracionJuradaRepository.ts`
- Responsabilidad: implementación en memoria con `Map`; acepta semilla en el constructor.

## EstadoDJ
- Archivo: `backend/domain/declaracion-jurada/types/EstadoDJ.ts`
- Responsabilidad: enum de los 6 estados y `esEstadoTerminal`.

## Rol
- Archivo: `backend/domain/administracion/types/Rol.ts`
- Responsabilidad: enum de los 4 roles.

## DomainError
- Archivo: `backend/domain/shared/errors/DomainError.ts`
- Responsabilidad: jerarquía `ForbiddenError` (403), `NotFoundError` (404), `ValidationError` (422), `UnauthorizedError` (401) con catálogo cerrado de códigos.

## JwtSigner
- Archivo: `backend/infrastructure/auth/JwtSigner.ts`
- Responsabilidad: firma y verifica JWT HS256 con expiración de 8 h.

## Composition root (app.ts)
- Archivo: `backend/api/app.ts`
- Responsabilidad: instancia repositorios, servicios, controladores y routers; monta prefijos; registra `globalErrorHandler`.

## seedDeclaracionesJuradas
- Archivo: `backend/infrastructure/persistence/seedDeclaracionesJuradas.ts`
- Responsabilidad: 5 DJ semilla en 2 facultades (`facultad-economicas`, `facultad-tecnologia`), todas `EN_REVISION_FACULTAD` salvo una `APROBADA`.
