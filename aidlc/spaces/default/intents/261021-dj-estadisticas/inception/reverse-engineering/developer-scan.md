## Developer Code Scan Results

### Scan Coverage
- **Analyzed deeply**:
  - `backend/api/app.ts`, `backend/api/server.ts` (raíz de composición y arranque)
  - `backend/api/routes/dj.routes.ts`, `backend/api/routes/agenteDj.routes.ts` (patrón de router)
  - `backend/api/controllers/dj.controller.ts`
  - `backend/api/middleware/auth.middleware.ts`, `backend/api/middleware/asyncHandler.ts`
  - `backend/api/validators/dj.validator.ts`
  - `backend/domain/declaracion-jurada/` (servicio, puerto `IDeclaracionJuradaRepository`, `EstadoDJ`, `CrearDJ.ts` con `ActorContext`, entidad)
  - `backend/domain/administracion/types/` (`Rol`, `JwtPayload`)
  - `backend/domain/shared/errors/DomainError.ts`
  - `backend/infrastructure/persistence/InMemoryDeclaracionJuradaRepository.ts`, `seedDeclaracionesJuradas.ts`, `seedIds.ts`
  - `backend/infrastructure/auth/JwtSigner.ts`
  - `backend/package.json`, `backend/tsconfig.json`, `backend/Dockerfile`, `backend/.env.example`
  - Cabeceras y estructura de las pruebas `DeclaracionJuradaService.test.ts`, `shutdown.test.ts`, `orquestador.atender.contract.test.ts`
  - Fuera de `backend/` (solo para entender cómo se ejecutan las pruebas, no es cobertura profunda): `package.json` y `jest.config.cjs` de la raíz del repo
- **Skimmed only**:
  - `backend/domain/{administracion,agente-dj,asistente-ia,orquestador-atencion,tramites-dpa}/` (solo listados de archivos y puertos)
  - `backend/infrastructure/{ai,mcp,notifications,config}/` (solo nombres; `DjMcpServer.ts` solo en las líneas que llaman a `djService.listar`)
  - `backend/api/{controllers,routes,validators}/` del resto de módulos (auth, asistente, orquestador)
  - `backend/api/contracts/` (esquemas JSON del contrato del orquestador)
  - `backend/scripts/`, `backend/data/`, `backend/docs/`
  - `backend/domain/declaracion-jurada/services/DJStateMachine.ts` (solo la referencia a `CROSS_FACULTY_FORBIDDEN`)
- **Left out**:
  - `backend/.env` (secretos locales, no se abre; solo se leyó `.env.example`)
  - `backend/node_modules/` y `backend/dist/` (si existen)
  - `backend/.DS_Store`, `backend/api/.DS_Store`, `backend/infrastructure/.DS_Store`
  - `backend/package-lock.json` (no se lee; solo se registra su presencia)
  - Todo lo que está fuera de `backend/` (`frontend/`, `e2e/`, `demo/`, `docs/`, etc.) salvo los dos archivos de configuración de pruebas de la raíz

### Packages Found
- `sgai-backend` (`backend/`) — aplicación Node ESM — TypeScript — API REST Express con arquitectura hexagonal (api / domain / infrastructure)
- Dominios internos bajo `backend/domain/`: `declaracion-jurada`, `administracion`, `asistente-ia`, `tramites-dpa`, `agente-dj`, `orquestador-atencion`, `shared`

### Build System
- **Type**: npm + `tsx` (ejecución directa de TypeScript, sin paso de build en runtime); `tsc` solo para tipos
- **Config Files**: `backend/package.json`, `backend/tsconfig.json` (strict, NodeNext, `include` de `domain`, `infrastructure`, `api` y `../demo/dj-core`), `backend/Dockerfile`, `jest.config.cjs` y `package.json` en la raíz
- **Build Dependencies**: la raíz del repo es el espacio de trabajo de pruebas (Jest y ts-jest viven en el `package.json` raíz, no en `backend/`); `backend/` tiene sus propios `dependencies` para runtime

### APIs Discovered
- REST Express — `backend/api/app.ts` — prefijos: `/health`, `/api/v1/auth`, `/api/v1/declaraciones-juradas`, `/api/v1/asistente`, `/api/v1/asistente-tramites`, `/api/v1/agente-dj`, `/api/v1/orquestador`
- DJ REST — `backend/api/routes/dj.routes.ts` — 5 endpoints (GET `/`, POST `/`, GET `/:id`, PATCH `/:id`, PATCH `/:id/estado`)
- Servidor MCP en proceso — `backend/infrastructure/mcp/DjMcpServer.ts` — herramientas del agente DJ (no es API HTTP)

### Frameworks & Libraries
- express — ^4.21.1 — servidor HTTP
- zod — ^3.25.0 — validación de entrada
- jsonwebtoken — ^9.0.3 — JWT HS256, expira en 8 h
- bcryptjs — ^3.0.3 — hash de contraseñas
- cors, express-rate-limit — ^2.8.5, ^8.5.2
- @modelcontextprotocol/sdk — ^1.30.0 — MCP
- typescript ^5.4.0, tsx ^4.19.0 (backend); jest ^29.7.0, ts-jest ^29.2.5, supertest ^7.2.2, ajv ^8.20.0 (raíz)

### Test Coverage
- **Test Directories**: pruebas colocadas junto al código (`*.test.ts`) bajo `backend/domain/**`, `backend/infrastructure/{config,ai,mcp,persistence}/`, `backend/api/`
- **Test Frameworks**: Jest 29 con ts-jest (preset `default-esm`), `@jest/globals`, supertest + ajv para el contrato HTTP; Playwright para E2E (fuera de `backend/`)
- **Coverage Config**: la cobertura se activa solo con el script raíz `test:domain` (`--coverage`, sin umbral configurado en `jest.config.cjs`); no hay `collectCoverageFrom` ni `coverageThreshold`

### Code Quality Indicators
- **Linting**: ausente en `backend/` (sin ESLint ni Prettier detectados)
- **CI/CD**: no se encontraron workflows en `.github/` (solo `CODEOWNERS`)
- **Documentation**: JSDoc con referencias a RB/FSD en servicios y controladores; `README.md` en la raíz; `.env.example` documentado

### Technical Debt Signals
- `backend/package.json` no declara script `test`; las pruebas se lanzan desde la raíz con `NODE_OPTIONS=--experimental-vm-modules jest <ruta> --watchman=false`.
- `DeclaracionJuradaService.listar` (`DeclaracionJuradaService.ts:58-62`) solo filtra por facultad si `ADMIN_FACULTAD` trae `facultadId`; si viniera vacío, el filtro se omite y vería todas las DJ (fail-open).
- `IDeclaracionJuradaRepository.list` pagina (pageSize 20 por defecto) y no sirve para contar por estado sin paginar; no existe método de conteo.
- `app.ts` instancia todo el grafo de dependencias, lee `.env` y exporta `app`; no hay fábrica de app, por lo que las pruebas HTTP montan su propio `express()` con el router bajo prueba (patrón de `orquestador.atender.contract.test.ts`).
- `ActorContext.facultadId` es opcional, mientras que `JwtPayload.facultadId` es obligatorio.
- Los códigos de `DomainError` son un conjunto cerrado (`USER_MESSAGES_ES_BO`); un código nuevo exige añadir su mensaje.
- `InMemoryDeclaracionJuradaRepository.updateCampos` y `transicionarAtomica` lanzan `Error` genéricos (no `DomainError`), lo que acabaría en 500.
- `demoAuthMiddleware` sigue exportado y `server.ts` anuncia el header demo, aunque las rutas migradas usan `requireRole`.

## Handoff Summary
- **Intent-relevant finding**: el endpoint de estadísticas encaja en `createDjRouter` (`backend/api/routes/dj.routes.ts:17-29`), que ya aplica `requireRole(...)` con los 4 roles a todo el router y lo monta en `/api/v1/declaraciones-juradas` (`app.ts:146`). La ruta `GET /api/dj/estadisticas` del `feature.md` no existe como prefijo: lo coherente es `GET /api/v1/declaraciones-juradas/estadisticas`, declarada ANTES de `GET /:id` (si no, Express captura `estadisticas` como `:id`). El actor llega como `{ userId, rol, facultadId }` desde `req.user`; el 401 ya lo produce `requireRole` (`TOKEN_INVALID`) y el 403 se lanza con `ForbiddenError` vía `globalErrorHandler` (`{ error, message, correlationId }`). Para contar hay que añadir un método de conteo al puerto y a `InMemoryDeclaracionJuradaRepository`, o reutilizar `list` con un `pageSize` alto (`DjMcpServer.ts:100` ya usa `pageSize: 100`). La respuesta debe llevar siempre los 6 valores de `EstadoDJ`.
- **Risks / follow-up**: (1) discrepancia de ruta `/api/dj/...` vs `/api/v1/declaraciones-juradas/...` a resolver en requisitos; (2) orden de rutas frente a `/:id`; (3) fail-open de `listar` para `ADMIN_FACULTAD` sin `facultadId`, a no replicar; (4) no hay un código de `DomainError` específico para "facultad ajena" (reutilizar `FORBIDDEN_TRANSITION` o `INSUFFICIENT_ROLE`, o añadir uno nuevo con su mensaje); (5) la validación del query `facultadId` aún no existe (`ListDjQuerySchema` en `dj.validator.ts:38` está definido pero sin uso en las rutas); (6) las pruebas se ejecutan desde la raíz con Jest/ts-jest ESM, no desde `backend/`; (7) la regla RB-05 se cita en `docs/.cursor/rules/sgai-domain.mdc` (fuera del alcance escaneado).
