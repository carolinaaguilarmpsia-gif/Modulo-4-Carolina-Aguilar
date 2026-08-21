# PR-IMPL-004 — Adaptadores de Autenticación y RBAC (Prompt de Implementación)

| Campo | Valor |
|-------|-------|
| FSD-UC | FSD-UC-001 |
| Design Doc | `DD-UC-002` |
| PRD | PRD-REQ-001, PRD-REQ-011 |
| Skill | `docs/SKILLS/auth-rbac-guard.md` |
| Reglas | RB-07 |
| Depende de | `PR-IMPL-003` (dominio) |
| Release | `release/3.0.0` |
| Estado | **ejecutado** — probado end-to-end contra el servidor real (`npm run dev:api`) |

## Role

Eres el implementador de los adaptadores de Autenticación del SGAI: entrada REST (Express + Zod + rate limiting) y salida (bcrypt/JWT reales, LDAP stand-in de desarrollo), consumiendo exclusivamente los puertos definidos en `PR-IMPL-003`.

## Task

1. Implementar `AuthController.login` delegando toda la lógica a `AutenticarUsuarioService`.
2. Definir `createAuthRouter` con `POST /auth/login` protegido por `authRateLimit` (express-rate-limit).
3. Definir el esquema Zod `LoginSchema { email, password }` y reusar el middleware `validateBody` ya existente (`backend/api/validators/dj.validator.ts` como referencia de patrón).
4. Implementar `requireRole(roles: Rol[])` — middleware que verifica el JWT (vía `IJwtSigner`/verificación) y el rol, para reemplazar a `demoAuthMiddleware` en rutas no-demo.
5. Implementar los adaptadores de salida:
   - `BcryptPasswordHasher` (bcrypt, cost ≥ 12) — **real**, sin dependencia externa.
   - `JwtSigner` (jsonwebtoken, HS256, exp 8h) — **real**, sin dependencia externa.
   - `LdapUnavailableAuthenticator` — stand-in de **desarrollo**: implementa `ILdapAuthenticator` devolviendo siempre "no disponible" (fuerza el fallback a bcrypt local ya previsto por el DTI); documentar claramente que debe reemplazarse por `LdapAuthAdapter` (ldapjs) cuando exista acceso al directorio institucional.
   - `InMemoryUsuarioRepository` — con 4 usuarios semilla (uno por rol) para poder ejercitar el flujo end-to-end sin Postgres.

## Context

- `authRateLimit` es una defensa adicional a nivel de aplicación, complementaria al rate limiting de Nginx ya descrito en el DTI §13.1 — no lo reemplaza.
- `demoAuthMiddleware` (`PR-IMPL-002`) sigue existiendo para uso exclusivo en `dev`; `requireRole` es el camino real y debe usarse en `staging`/`production`.
- NO loggear `password`, `password_hash` ni el contenido de `Authorization` header (Ley 164, `security-ley164.mdc`).
- Añadir `@prisma/client`, `bull`, `ldapjs` reales queda fuera de este prompt (ver §4 de `DD-UC-002`, trabajo pendiente).

## Reasoning

1. El controller nunca decide política de bloqueo ni de fallback LDAP — solo mapea `Request` → `LoginCommand` → `Response`.
2. `validateBody(LoginSchema)` corta con 422 antes de invocar el servicio si el payload no cumple el esquema.
3. `requireRole` decodifica el JWT con la misma clave que `JwtSigner`, verifica `exp` y compara `rol` contra la lista permitida; 401 si el token es inválido/expiró, 403 si el rol no alcanza.
4. `globalErrorHandler` (ya existente, `PR-IMPL-002`) debe extenderse para mapear `UnauthorizedError`/`ForbiddenError('ACCOUNT_LOCKED')` sin cambiar su contrato de respuesta.
5. `LdapUnavailableAuthenticator.bind()` debe simular el timeout de 5 s del DTI §7.2 solo conceptualmente (puede resolver "no disponible" de inmediato en dev, documentando la diferencia).

## Stop Condition

- 422 `VALIDATION_ERROR` (Zod) antes de tocar el dominio.
- 429 al superar el rate limit de `POST /auth/login`.
- Cualquier intento de loggear `password`/`password_hash`/token completo → detener y corregir.
- Cualquier lógica de bloqueo o de fallback LDAP escrita en el controller (en vez de delegar al `Service`) → detener, viola la arquitectura hexagonal.

## Output

- `backend/api/controllers/auth.controller.ts`
- `backend/api/routes/auth.routes.ts`
- `backend/api/validators/auth.validator.ts`
- `backend/api/middleware/{requireRole.ts,authRateLimit.ts}`
- `backend/infrastructure/auth/{BcryptPasswordHasher.ts,JwtSigner.ts,LdapUnavailableAuthenticator.ts}`
- `backend/infrastructure/persistence/InMemoryUsuarioRepository.ts`

## Invariants

- Los adaptadores de salida implementan exactamente `IUsuarioRepository`, `ILdapAuthenticator`, `IPasswordHasher`, `IJwtSigner` de `PR-IMPL-003` — cero cambios de firma.
- `correlationId` presente en toda respuesta y en todo log (NFR-009).
- `LdapUnavailableAuthenticator` no se referencia como definitivo en `docs/baseline/` — su reemplazo por `LdapAuthAdapter` es trabajo pendiente, no un delta de diseño (`DD-UC-002` §4).

## Desviaciones registradas al ejecutar (sin ADR — no son decisiones arquitectónicas)

- Se usó `bcryptjs` en vez de `bcrypt` (mismo algoritmo, cost factor 12, sin bindings nativos que compilar) — sustitución de librería.
- Se agregó un helper `asyncHandler` en `auth.routes.ts` para reenviar rechazos de promesas a `globalErrorHandler` (Express 4 no lo hace automáticamente). `dj.routes.ts` tiene el mismo problema latente pero no se tocó — fuera de alcance de este prompt.
- `requireRole` quedó implementado pero **no aplicado** todavía a `dj.routes.ts` (seguía en alcance de `PR-IMPL-002`, no de este prompt) — `demoAuthMiddleware` sigue protegiendo esas rutas.

## Trazabilidad

`FSD-UC-001` → `DD-UC-002` §2, §5 → `PR-IMPL-004` (depende de `PR-IMPL-003`) → `backend/api/{controllers,routes,validators,middleware}/auth.*`, `backend/infrastructure/auth/**` → `docs/product/DTP.md` §A.3.

## Métricas (Antes vs Después)

| Métrica | Antes | Después |
|---------|-------|---------|
| Endpoints REST de M-AUTH | 0/1 | 1/1 (`POST /api/v1/auth/login`, probado manualmente para los 4 roles) |
| Rutas protegidas con `requireRole` real (vs `demoAuthMiddleware`) | 0 | 0 — middleware listo pero aún no aplicado a rutas existentes (pendiente) |
| Adaptadores de auth listos para swap a LDAP real | 0 | 1 (mismo puerto, sin cambios en dominio) |
| RB-07 verificado end-to-end (bloqueo tras 5 intentos) | no | sí — 403 `ACCOUNT_LOCKED` confirmado con curl |
