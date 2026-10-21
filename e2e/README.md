# E2E — SGAI (Playwright)

```bash
npm run test:e2e          # corre toda la suite (levanta y apaga backend+frontend solo)
npm run test:e2e:report   # abre el último reporte HTML
```

`npx playwright test` levanta backend (`:3001`) y frontend (`:5173`) por su cuenta (`webServer` en
`playwright.config.ts`) y los apaga al terminar — cada corrida arranca de cero. **No** hace falta
(ni conviene) dejar los servidores corriendo de antemano con otra herramienta: si algo ya está
escuchando en esos puertos antes de correr la suite, Playwright lo reusa tal cual esté, con
cualquier dato que haya quedado ahí de una sesión manual — eso rompe la aserción de "listado
vacío" (C1). Si ven ese test fallar solo, es casi seguro que hay un backend viejo corriendo.

**Estado actual: 19/19 en verde** (18 tests + el `seed` del scaffold), sin ningún `test.skip`.

## Estructura
- `specs/00-flujos.md` — inventario de los 18 flujos, el alcance de la suite.
- `specs/*.plan.md` — un plan por sección con la auditoría (aceptado/corregido/descartado, con motivo).
- `specs/data-testid-agregados.md` — los `data-testid` que se agregaron al frontend y por qué.
- `A-autenticacion.spec.ts` … `E-asistente-mcp.spec.ts` — los tests generados, un archivo por sección.
- `fixtures.ts` — login por UI + arrange de datos por API.

## Tres hallazgos reales que dan forma al diseño de estos tests

1. **La sesión vive solo en memoria del navegador** (`authStore.ts`, nunca localStorage/cookies —
   decisión de seguridad). No existe `storageState` posible entre tests, y un `page.goto` a una
   URL profunda después de loguearse recarga la página y pierde la sesión. Por eso cada test hace
   login real por formulario, y por eso el listado necesitó `data-testid="dj-row-<id>"` — sin id
   visible en la tabla, no hay forma de que un test ubique exactamente SU DJ entre las demás.

2. **`POST /auth/login` tiene rate-limit (20/15min) que una suite E2E agota rápido** (cada test
   loguea de nuevo). Se hizo configurable vía `AUTH_RATE_LIMIT_MAX` (200 en `backend/.env` local) —
   pero el primer intento de arreglo **no funcionaba de verdad**: `authRateLimit.ts` leía
   `process.env.AUTH_RATE_LIMIT_MAX` en el top-level del módulo, que los imports de ES modules
   evalúan **antes** de que `loadEnvFile()` corra en `app.ts` — el override nunca llegaba a
   aplicarse (siempre corría con el default de 20, confirmado con `curl` golpeando `/auth/login`
   25 veces seguidas). Se corrigió pasando una función (`limit: () => Number(...)`), evaluada en
   cada request, ya con la env cargada — confirmado con el mismo curl: 25 intentos sin 429.

3. **La sección E depende de un LLM real (Groq)** — a diferencia de las demás, acá no hay camino
   determinístico. El modelo a veces responde en texto libre pidiendo confirmación en el chat EN
   VEZ DE invocar la herramienta de escritura (el guardrail de "pausa y confirma" solo se activa
   con el tool-call real) — mismo prompt, corridas distintas, comportamientos distintos. Se mitiga
   con un prompt más directivo (`E-asistente-mcp.spec.ts`) y `test.describe.configure({ retries: 2 })`
   — no se fuerza un "siempre verde" falso sobre un modelo real; ver `specs/E-asistente-mcp.plan.md`.
