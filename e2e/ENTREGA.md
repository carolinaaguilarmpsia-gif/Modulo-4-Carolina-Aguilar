# Documento de entrega — Módulo 7: Test E2E con Playwright

**Equipo:** DPA

---

## 1. Flujo elegido

La consigna pide un flujo. El equipo cubrió **18 flujos en 5 secciones** sobre el producto real
(SGAI) — el detalle completo, uno por línea, está en [`specs/00-flujos.md`](specs/00-flujos.md).
Los cinco, resumidos:

| Sección | Flujo (una línea) | Archivo |
|---|---|---|
| A. Autenticación | Un docente inicia sesión, ve error con credenciales inválidas, cierra sesión, y no puede acceder sin sesión | [A-autenticacion.spec.ts](A-autenticacion.spec.ts) |
| B. Asistente de trámites | Alguien pregunta por un trámite (match por keyword) o algo fuera de alcance, y ve la respuesta correspondiente | [B-asistente-tramites.spec.ts](B-asistente-tramites.spec.ts) |
| C. Declaraciones juradas — listado y creación | Un docente ve su listado vacío, crea una DJ válida, falla la validación con datos inválidos | [C-listado-creacion.spec.ts](C-listado-creacion.spec.ts) |
| D. Transiciones de estado | Un docente envía una DJ a Facultad, un Admin la aprueba o la devuelve, y se respeta la regla de vinculación activa | [D-transiciones.spec.ts](D-transiciones.spec.ts) |
| E. Asistente MCP sobre DJ | Un Admin le pide al agente aprobar una DJ, ve la confirmación previa, y puede confirmarla o cancelarla | [E-asistente-mcp.spec.ts](E-asistente-mcp.spec.ts) |

## 2. Archivos `.spec.ts`

`A-autenticacion.spec.ts`, `B-asistente-tramites.spec.ts`, `C-listado-creacion.spec.ts`,
`D-transiciones.spec.ts`, `E-asistente-mcp.spec.ts` (18 tests) + `seed.spec.ts` (1 test de scaffold).
Soporte compartido: [`fixtures.ts`](fixtures.ts) (login real por UI, arrange de datos por API).

## 3. Quién lo escribió

Escrito con **agente** (Planner + Generator), **una sección a la vez** — nunca las 18 juntas
(ver nota en `specs/00-flujos.md`). Flujo por sección: Planner exploró la app en vivo y propuso
casos → auditoría manual contra las 5 preguntas E2E → Generator escribió el `.spec.ts` sobre los
casos aceptados.

**Qué se corrigió y por qué pregunta falló** (auditoría completa en cada `specs/*.plan.md`):

| Sección | Resultado de la auditoría | Corrección más relevante |
|---|---|---|
| A | 4 aceptados, 1 con ajuste menor, 1 descartado | Un caso comparaba el texto exacto de un mensaje del backend (pregunta 3: verificar la promesa de la UI, no la redacción del dominio) → se corrigió a verificar el `role=alert` de la UI en vez del string del backend |
| B | 2 aceptados, 1 corregido, 1 descartado | Un caso comparaba el texto completo de la respuesta del LLM por igualdad (pregunta 3) → se cambió a `toContainText` sobre un dato real + verificación de la fuente. Otro proponía un retry con timeout fijo (pregunta 2, espera fija disfrazada) → descartado, Playwright ya auto-espera |
| C | 3 aceptados, 1 corregido, 1 descartado | Un caso verificaba un código de referencia exacto que en realidad tiene un sufijo no determinístico → corregido a verificación de patrón. Un caso de "polling cada 5s" se descartó por no existir esa funcionalidad |
| D | 4 aceptados, 1 descartado | Un caso estaba mal redactado (describía el bug, no el comportamiento correcto) → descartado y anotado como caso futuro con la redacción correcta |
| E | 4 aceptados, con `retries: 2` | Sección contra un LLM real (Groq): no hay camino puramente determinístico. Se documenta explícitamente en vez de forzar un verde falso — ver `specs/E-asistente-mcp.plan.md` |

## 4. Anclas (`data-testid`) agregadas al producto

5 anclas agregadas, cada una con su motivo — detalle completo en
[`specs/data-testid-agregados.md`](specs/data-testid-agregados.md):

- `DJStateBadge.tsx` → `data-testid="dj-estado-badge"` + `data-estado` (el texto del badge se repite en el historial de la misma página, `getByText` sería ambiguo)
- `ListaDeclaracionesJuradasPage.tsx` → `data-testid="dj-row-<id>"` en cada fila (no hay id visible en la tabla; sin esto un test solo podía hacer `.first()`, frágil entre corridas)
- `AsistenteTramitesChat.tsx` / `AsistenteDJPage.tsx` → `data-testid="chat-message"` + `data-role` (aislar "la última respuesta del asistente" sin depender de texto que varía por LLM)
- `AsistenteDJPage.tsx` → `data-testid="confirmacion-pendiente"` (el texto de los botones se repite en otra pantalla con el mismo vocabulario)
- `AsistenteDJPage.tsx` → `data-testid="traza-panel"` (auditar qué herramienta llamó el agente sin depender del texto libre del LLM)

Ningún cambio afecta el comportamiento visible de la UI.

## 5. Salida de `npx playwright test` en verde + evidencia de trace

`playwright.config.ts` tiene `trace: 'retain-on-failure'` — con la suite en verde, por defecto
**no se guarda ningún trace**. Para generar evidencia hay que forzarlo con `--trace on` (no hace
falta tocar el config).

### Última corrida — 19/19 en verde (17 sept. 2026)

```
Running 19 tests using 1 worker

  ✓  A-autenticacion.spec.ts › 4 tests (7.2s, 2.1s, 2.1s, 856ms)
  ✓  B-asistente-tramites.spec.ts › 2 tests (1.0s, 2.3s)
  ✓  C-listado-creacion.spec.ts › 4 tests (1.8s, 3.8s, 1.9s, 1.8s)
  ✓  D-transiciones.spec.ts › 4 tests (2.5s, 3.0s, 3.5s, 2.3s)
  ✓  E-asistente-mcp.spec.ts › 4 tests — 2 en verde a la primera (4.1s, 4.6s),
     2 "flaky" (fallaron 1ª vez por 429 rate-limit de Groq — "Rate limit reached ... tokens per
     minute" — y pasaron en el retry automático, exactamente el escenario documentado en
     specs/E-asistente-mcp.plan.md)
  ✓  seed.spec.ts › 1 test (445ms)

  2 flaky
    E-asistente-mcp.spec.ts:57:3 › Confirmar la acción propuesta retira la tarjeta y ejecuta el cambio
    E-asistente-mcp.spec.ts:78:3 › Cancelar la acción propuesta no ejecuta ningún cambio
  17 passed (2.3m)
```

**19/19 verde** (17 a la primera + 2 flaky que resolvieron en el reintento configurado). Se generaron
21 `trace.zip` en `test-results/` (19 tests + 2 reintentos) — evidencia lista para el Trace Viewer.

### Pasos para sacar la evidencia

1. **Correr la suite forzando trace en todos los tests** (pasa el backend/frontend real, igual que `npm run test:e2e`):
   ```bash
   npm run test:e2e -- --trace on
   ```
   Al terminar, la terminal muestra el resumen final (`X passed (Ys)`) — capturar esa salida
   (captura de pantalla o copiar el texto) para pegar/adjuntar acá.

2. **Abrir el reporte HTML**:
   ```bash
   npm run test:e2e:report
   ```
   Se abre `playwright-report/index.html` en el navegador con los 19 tests en verde. Capturar
   pantalla del listado completo.

3. **Abrir el trace de un test puntual** (ej. login exitoso o aprobar DJ) desde ese mismo reporte:
   click en el test → ícono de trace (cámara/timeline) → se abre el Trace Viewer embebido, con
   línea de tiempo, snapshot del DOM en cada paso, network y consola. Navegar paso a paso y
   capturar pantalla de 1–2 flujos representativos (ej. `A · Login exitoso`, `E · Confirmar acción del agente`).

   Alternativa por consola, sin pasar por el reporte HTML (`test-results/<carpeta-del-test>/trace.zip`
   se genera con `--trace on`):
   ```bash
   npx playwright show-trace test-results/<carpeta-del-test>/trace.zip
   ```

4. **Adjuntar al informe**: la captura de la terminal (resumen final), la captura del reporte HTML
   (listado en verde) y las 1–2 capturas del Trace Viewer. Opcionalmente, comprimir y adjuntar
   `playwright-report/` completo — es autocontenido y se puede abrir sin correr nada.

Sin ningún `test.skip` y sin ningún test que dependa de datos dejados por una corrida anterior
(cada test loguea por UI y crea sus propios datos por API — ver `fixtures.ts`).

> **Nota de entorno:** si la suite falla en bloque con timeout en `getByLabel('Correo institucional')`
> desde el primer test, casi seguro hay OTRO proceso (de otro proyecto) escuchando en el puerto
> `5173` — `reuseExistingServer: true` hace que Playwright lo reuse tal cual esté en vez de levantar
> el frontend real de SGAI. Verificar con `lsof -nP -iTCP:5173 -sTCP:LISTEN` antes de correr la
> suite si el resultado no tiene sentido.

---

*Deliberadamente no hay ningún `waitForTimeout` ni espera fija en la suite — confirmado por
inspección de los 5 archivos `.spec.ts`.*
