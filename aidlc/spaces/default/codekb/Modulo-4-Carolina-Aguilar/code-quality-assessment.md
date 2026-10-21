# Code Quality Assessment

## Pruebas
- Marco: Jest 29 + ts-jest (preset `default-esm`) con `@jest/globals`; configuración en `jest.config.cjs` de la raíz.
- `testMatch` incluye `backend/domain/**`, `backend/infrastructure/{mcp,persistence,config,ai}/**` y `backend/api/**` (cualquier `*.test.ts`), por lo que un test nuevo en `backend/api/` o `backend/domain/` se detecta sin cambiar la configuración.
- Cómo ejecutar: desde la raíz, `NODE_OPTIONS=--experimental-vm-modules jest <ruta> --watchman=false`. `backend/package.json` no tiene script `test`. Scripts raíz: `test:domain` (con `--coverage`), `test:domain:dj`, etc.
- Patrones: dobles manuales (`FakeDJRepository` en `DeclaracionJuradaService.test.ts`); pruebas HTTP con `express()` + `supertest` + routers reales (`orquestador.atender.contract.test.ts`); contrato validado con ajv.
- Cobertura: sin `coverageThreshold` ni `collectCoverageFrom`; no se midió en este escaneo.
- Hueco: `DjController` y `dj.routes.ts` no tienen prueba HTTP propia.

## Linting y formato
Sin ESLint ni Prettier en `backend/`.

## CI/CD
Sin workflows en `.github/` (solo `CODEOWNERS`).

## Documentación
JSDoc útil con trazabilidad (RB, FSD, PR); `.env.example` comentado; `README.md` raíz. Hay `backend/docs/practicas/`.

## Deuda técnica
Detalle por ítem (ubicación):
1. Fail-open de `listar` para `ADMIN_FACULTAD` sin `facultadId` — `DeclaracionJuradaService.ts:58-62`.
2. Sin conteo/agregación en el puerto — `IDeclaracionJuradaRepository.ts:23-36`.
3. `Error` genérico en el repositorio en memoria (acaba en 500) — `InMemoryDeclaracionJuradaRepository.ts:56,72-75`.
4. `ListDjQuerySchema` definido y sin uso — `dj.validator.ts:38`.
5. Query de `list` leído sin validar (`page` puede ser `NaN`) — `dj.controller.ts:13-14`.
6. `demoAuthMiddleware` y mensaje de arranque obsoletos — `auth.middleware.ts:70`, `server.ts:10`.
7. Catálogo cerrado de códigos de error; falta uno para "facultad ajena" en estadísticas — `DomainError.ts:6-27`.
8. `app.ts` mezcla carga de `.env`, composición y exportación del `app`.
