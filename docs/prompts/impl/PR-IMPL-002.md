# PR-IMPL-002 — Adaptadores API + Desarrollo del Módulo DJ (Prompt de Implementación)

| Campo | Valor |
|-------|-------|
| FSD-UC | FSD-UC-002 |
| Design Doc | `DD-UC-001` |
| PRD | PRD-REQ-002, PRD-REQ-004, PRD-REQ-005 |
| Skill | `docs/SKILLS/dj-validator.md`, `docs/SKILLS/auth-rbac-guard.md` |
| Reglas | RB-01, RB-03, RB-06 |
| Depende de | `PR-IMPL-001` (dominio) |
| Release | `release/3.0.0` |
| Estado | ejecutado — adaptadores de **desarrollo** (in-memory/console); Prisma/Bull pendientes (ver `DD-UC-001` §4) |

## Role

Eres el implementador de los adaptadores del módulo DJ del SGAI: entrada REST (Express + Zod) y salida de desarrollo (in-memory, console), consumiendo exclusivamente los puertos definidos en `PR-IMPL-001`.

## Task

1. Implementar `DjController` exponiendo `list`, `create`, `getById`, `updateCampos`, `transicionarEstado`, delegando toda regla de negocio a `DeclaracionJuradaService`.
2. Definir `createDjRouter` con Express Router: `GET/POST /`, `GET/PATCH /:id`, `PATCH /:id/estado`.
3. Definir esquemas Zod (`CreateDjSchema`, `UpdateDjCamposSchema`, `TransicionDjSchema`) y el middleware genérico `validateBody`.
4. Implementar `demoAuthMiddleware` (stand-in de FSD-UC-001) y `globalErrorHandler` que traduce `DomainError` a HTTP con `correlationId`.
5. Implementar los adaptadores de **desarrollo** `InMemoryDeclaracionJuradaRepository` (con `transicionarAtomica` que valida `estadoAnterior` para simular control de concurrencia) y `ConsoleNotificacionPublisher`, ambos implementando exactamente los puertos de `PR-IMPL-001` para ser swappeados sin tocar dominio.

## Context

- Auth real (JWT + LDAP) es FSD-UC-001 y **no** es parte de este prompt; `demoAuthMiddleware` lee el rol demo de un header (`X-SGAI-Demo-User`) — **solo para desarrollo**, nunca en producción.
- `Zod` valida en `api/` antes de llegar al dominio (regla `express-api-sgai.mdc`).
- Los adaptadores de salida deben ser reemplazables 1:1 por `PrismaDJRepository` y `BullNotificacionPublisher` sin cambiar `DeclaracionJuradaService` ni el controller.
- NO loggear PII ni `campos_formulario` completo (Ley 164, `security-ley164.mdc`).

## Reasoning

1. El controller nunca decide transiciones ni reglas — solo mapea `Request` → comando del dominio → `Response`.
2. `validateBody` corta con 422 antes de invocar el servicio si el payload no cumple el esquema Zod.
3. `globalErrorHandler` es el único lugar que traduce `DomainError.httpStatus` a la respuesta HTTP; nunca se filtra el stack trace ni el mensaje interno.
4. `InMemoryDeclaracionJuradaRepository.transicionarAtomica` simula RB-06 comparando `estadoAnterior` antes de mutar — objetivo: reemplazar por `$transaction([UPDATE, INSERT])` de Prisma sin cambiar la firma del puerto.
5. `ConsoleNotificacionPublisher` solo loggea metadatos (`djId`, `estadoNuevo`, `destinatarioRol`) — nunca contenido de la DJ.

## Stop Condition

- 422 `VALIDATION_ERROR` (Zod) antes de tocar el dominio.
- Cualquier intento de loggear `campos_formulario`, `password` o `ci` → detener y corregir.
- Cualquier lógica de transición de estado escrita en el controller (en vez de delegar al `Service`) → detener, es una violación de la arquitectura hexagonal.
- `demoAuthMiddleware` usado fuera de `dev`/`staging` sin flag explícito → detener.

## Output

- `backend/api/controllers/dj.controller.ts`
- `backend/api/routes/dj.routes.ts`
- `backend/api/validators/dj.validator.ts`
- `backend/api/middleware/auth.middleware.ts`
- `backend/infrastructure/persistence/InMemoryDeclaracionJuradaRepository.ts`
- `backend/infrastructure/notifications/ConsoleNotificacionPublisher.ts`
- `frontend/src/pages/declaraciones-juradas/**` (listado, detalle, nueva DJ, panel de acciones, badge de estado)

## Invariants

- Los adaptadores de salida implementan exactamente `IDeclaracionJuradaRepository` e `INotificacionPublisher` de `PR-IMPL-001` — cero cambios de firma.
- `correlationId` presente en toda respuesta y en todo log (NFR-009).
- Ningún adaptador de desarrollo se referencia como definitivo en `docs/baseline/` — su reemplazo por Prisma/Bull es trabajo pendiente, no un delta de diseño (`DD-UC-001` §4).

## Trazabilidad

`FSD-UC-002` → `DD-UC-001` §2, §5 → `PR-IMPL-002` (depende de `PR-IMPL-001`) → `backend/api/**`, `backend/infrastructure/{persistence,notifications}/**`, `frontend/src/pages/declaraciones-juradas/**` → `docs/product/DTP.md` §A.3.

## Métricas (Antes vs Después)

| Métrica | Antes | Después |
|---------|-------|---------|
| Endpoints REST de M-DJ | 0/5 | 5/5 (`list`, `create`, `getById`, `updateCampos`, `transicionarEstado`) |
| Adaptadores de persistencia/notificación listos para swap a Prisma/Bull | 0 | 2 (mismos puertos, sin cambios en dominio) |
| Tests de integración (Supertest) sobre estos endpoints | 0 | 0 — pendiente (`DD-UC-001` §6) |
