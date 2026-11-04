# E3 · Informe: ¿conviene extraer Trámites DPA?

> Hipótesis en [`HIPOTESIS.md`](HIPOTESIS.md) (commit anterior a las corridas). Decisión en [`docs/ADR/0007-extraer-tramites-dpa.md`](../../docs/ADR/0007-extraer-tramites-dpa.md). Datos crudos en [`resultados/`](resultados/); tablas completas en [`resultados/resumen.md`](resultados/resumen.md).

## Qué se comparó

- **Módulo:** Trámites DPA (`backend/domain/tramites-dpa`). Frontera: `IAsistenteTramites.preguntar()` / `estado()`.
- **Forma 1, en proceso (monolito modular):** `TRAMITES_MODO=proceso`; llamada a función dentro de la API.
- **Forma 2, extraído (servicio aparte, detrás de Toxiproxy):** `TRAMITES_MODO=http`; la API llama por HTTP a `main-tramites.ts` a través de Toxiproxy (puerto 8666). Misma imagen, otro comando. Cliente con plazo de 1000 ms por intento, 1 reintento con jitter completo (base 50 ms) y circuito que abre tras 5 fallos seguidos y queda abierto 5 s.
- **Ruta que usa el módulo:** `POST /api/v1/asistente-tramites/preguntar` (32 preguntas fijas resueltas por palabras clave, `IA_HABILITADA=false`). **Ruta de control:** `GET /health`.
- **Fallas provocadas (solo en la forma extraída):** *colgado* (toxic `timeout` 0), *lento* (toxic `latency` +1500 ms) y *caído* (proxy deshabilitado), entre los segundos 30 y 50 desde el inicio.
- **Carga:** 20 peticiones/s por ruta (40 en total), modelo abierto (`constant-arrival-rate`), 70 s: calentamiento 0–10 s (no se cuenta), antes 10–30, falla 30–50, después 50–70.

## Entorno

- **Máquina:** Intel Core i7-4870HQ 2,5 GHz (8 hilos), 16 GB de RAM, macOS 14.7.1.
- **Docker:** Docker Desktop, motor 29.6.2, Compose 5.3.1; la VM tiene 8 CPU y 7,75 GiB.
- **Imágenes y versiones:** Node 24.22.2 (bookworm-slim), Express 4.21, tsx 4.x, PostgreSQL 17, Toxiproxy 2.13.0, k6 2.3.0 (digests en `compose.e3.yaml`).
- **Datos: tamaño del seed y cómo se generó:** el catálogo real de la DPA, `backend/data/db.json` (26 939 bytes): 5 departamentos y 34 trámites. Lo carga `scripts/db-setup.ts` (migraciones + `sembrarTramites`, idempotente y determinista) en un contenedor `migrar` antes de que arranque la API o el módulo. Las dos formas leen el mismo seed. No se escaló: el volumen es el real.
- **Carga del equipo (`uptime`, promedio de 1 minuto) antes de cada corrida:** entre 5 y 25 con 8 núcleos (ver `*.meta.json` y `resumen.md`). Se detuvieron antes los contenedores `open-webui` y otro Postgres ajeno al experimento. Aun así el equipo estaba sobresuscrito en varias corridas.

## Método

- **Corridas:** 5 por tanda, con `docker compose down -v` entre corridas (`bench/e3/correr.sh`). Cuatro tandas: en proceso; extraído con falla colgada; extraído con falla lenta; extraído con falla caída. En proceso no se puede inyectar red, así que se midió una sola tanda y sirve de referencia para las tres fallas.
- **Orden:** seguidas, no alternadas: proceso → colgado → lento → caído (≈ 9 min cada una). Esto confunde la forma con el momento: ver amenazas.
- **Resumen:** `node bench/e3/resumir.mjs` → `resultados/resumen.md`. Mediana y rango `[mín–máx]` de las 5 corridas.

## Resultados

### Sin falla (fase «antes», p95 en ms)

| Ruta | En proceso (5 corridas) | Extraído, tanda colgado | Extraído, tanda lento | Extraído, tanda caído | Extraído, las 15 corridas |
|---|---:|---:|---:|---:|---:|
| Módulo | 12 [3–25] | 29 [10–361] | 49 [5–270] | 142 [69–506] | 68 [5–506] |
| Control (`/health`) | 9 [2–20] | 8 [3–98] | 15 [2–111] | 47 [24–203] | 17 [2–203] |

Las tres tandas extraídas miden **lo mismo** (forma extraída sin falla) y aun así difieren entre sí en más de un orden de magnitud en el máximo. Esa dispersión es el ruido del equipo.

### Falla: colgado (extraído)

| Forma | Ruta | Fase | p95 (ms) | % errores | Peticiones |
|---|---|---|---:|---:|---:|
| En proceso | módulo | antes / durante / después | 12 / 8 / 12 | 0 / 0 / 0 | 400 / 400 / 402 |
| En proceso | control | antes / durante / después | 9 / 6 / 8 | 0 / 0 / 0 | 400 / 400 / 402 |
| Extraído | módulo | antes | 29 [10–361] | 0 [0–1] | 400 |
| Extraído | módulo | **durante** | **2057 [2034–2980]** | **99,3 [93,0–100]** | 400 [390–400] |
| Extraído | módulo | después | 29 [20–63] | 19,0 [17,1–24,3] | 404 |
| Extraído | control | antes | 8 [3–98] | 0 | 400 |
| Extraído | control | durante | 22 [9–478] | 0 | 400 |
| Extraído | control | después | 12 [6–23] | 0 | 404 |

### Falla: lento, +1500 ms (extraído)

| Ruta | Fase | p95 (ms) | % errores |
|---|---|---:|---:|
| módulo | antes | 49 [5–270] | 0 |
| módulo | **durante** | **2033 [2029–2079]** | **96,5 [95,0–100]** |
| módulo | después | 17 [9–300] | 19,7 [16,7–20,7] |
| control | antes / durante / después | 15 / 4 / 7 | 0 / 0 / 0 |

### Falla: caído (extraído)

| Ruta | Fase | p95 (ms) | % errores |
|---|---|---:|---:|
| módulo | antes | 142 [69–506] | 0 |
| módulo | **durante** | **77 [9–120]** | **96,3 [93,8–98,8]** |
| módulo | después | 39 [15–240] | 8,2 [3,7–10,8] |
| control | antes / durante / después | 47 / 30 / 13 | 0 / 0 / 0 |

### Recuperación

Segundos que tarda la ruta del módulo en volver a 0 % de errores tras quitar la falla (cubos de 1 s en `carga.js`), mediana [rango]:

| Falla | Recuperación (s) |
|---|---:|
| Colgado | 4 [4–5] |
| Lento | 5 [4–5] |
| Caído | 2 [1–3] |

Ninguna corrida quedó sin recuperarse dentro de la ventana de 20 s. La fase «después» muestra 8–20 % de errores porque incluye esos primeros segundos (≈ 4 de 20 s).

### Build y arranque

| Forma | `docker compose build` (s) | `docker compose up -d --wait` (s) |
|---|---:|---:|
| En proceso | 13,5 (1 medición) | 29,4 [7,9–35,8] |
| Extraído (15 corridas) | 4,1 / 11,4 / 8,3 (1 medición por tanda) | 29,4 [12,5–35,5] |

**El build no es comparable:** se midió una vez por tanda y con caché de capas; las dos formas usan la misma imagen. El `up` es mediana de 5 (en proceso) y de 15 (extraído).

### El salto del proxy

Fase «antes» de la ruta del módulo, sin falla: en proceso 12 ms; extraído 68 ms con las 15 corridas (29, 49 y 142 por tanda). La dirección es consistente (extraído más lento), pero la **magnitud no es fiable**: el rango de las tandas extraídas (5–506 ms) abarca el del monolito.

## Hipótesis: ¿se cumplieron?

| # | Predicción (resumen) | Resultado | ¿Se cumple? |
|---|---|---|---|
| H1 | p95 «antes» del módulo: A ≈ 10 ms, B ≈ 20 ms; refutada si B − A > 30 ms | A = 12 ms; B por tanda: 29 / 49 / 142 → B − A = 17 / 37 / 130 ms | **No como se formuló**: lo refutan 2 de 3 tandas. B > A en dirección, magnitud dominada por ruido |
| H2 | `/health` igual en ambas formas (< 5 ms de diferencia) y, en B durante la falla, sin llegar al doble | 0 % de errores en las 15 corridas; pero antes: 9 vs 17 ms (+8); durante colgado: 22 vs 8 ms (2,75×) | **Parcial**: no hay contagio de errores; los criterios de latencia se refutan en 2 puntos |
| H3 | Errores ≥ 90 %; p95 colgado entre 1500 y 2600 ms; caído < 200 ms; recuperación 5–7 s | 99,3 % / 96,5 % / 96,3 %; colgado 2057 ms; caído 77 ms; recuperación 4 / 5 / 2 s | **Sí**, salvo la recuperación del colgado (4 s, no 5–7; no pasa del umbral de refutación de 10 s). *Declarado: se vio una versión piloto antes (ver `HIPOTESIS.md`)* |
| H4 | `up`: A ≈ 45 s, B ≈ 60 s; build igual | `up`: A 29,4 s, B 29,4 s; build 1 medición por tanda | **No**: B no fue más lento (B − A = 0). El build no se pudo comparar |

## Amenazas a la validez

1. **Una máquina sobresuscrita y de 2014.** API, módulo, Postgres, Toxiproxy y k6 comparten 8 hilos; el `uptime` marcó entre 5 y 25 antes de las corridas. Se detuvieron los contenedores ajenos y se usa mediana y rango, pero la dispersión sigue siendo grande: la misma forma sin falla dio p95 de 5 a 506 ms. **Por eso H1 y H2 (diferencias de pocos milisegundos) no se pueden decidir con estos datos.** H3 sí, porque sus efectos son de segundos.
2. **Orden de las tandas.** Las cuatro tandas corrieron seguidas (proceso primero, caído al final) y no alternadas. Cualquier deriva del equipo (calor, caché, carga ajena) queda confundida con la forma. La tanda «caído» tuvo el peor p95 «antes» (142 ms) estando en condiciones idénticas a las otras dos extraídas.
3. **El catálogo se sirve desde memoria.** El módulo lee Postgres una vez al arrancar: estas mediciones no ejercitan la base por petición ni su tamaño. Con IA activada, la latencia dominante sería Groq/Ollama, que aquí no se midió.
4. **Toxiproxy agrega un salto.** Parte de la diferencia entre formas es el proxy y no la red real.
5. **Docker Desktop sobre macOS.** El `up` osciló entre 8 y 36 s en la misma forma; no hay diferencia medible entre formas.
6. **Calentamiento descartado.** Se descartan 10 s iniciales; los primeros segundos en frío inflaban el p95. Esa decisión cambia los números.
7. **La falla provocada no es la real.** Las fallas de Toxiproxy son limpias; los incidentes reales suelen ser lentitud parcial. En la forma en proceso no se puede inyectar ninguna, así que la comparación de resiliencia es entre «extraído con falla» y «en proceso sin falla»: no hay medida de qué pasaría con un cuelgue real dentro del proceso.
8. **Piloto previo.** Antes de las corridas oficiales se hicieron tres corridas cortas de prueba; informaron a H3 (ver `HIPOTESIS.md`).
9. **Una sola ruta y 32 preguntas fijas** del camino por palabras clave: no representan el tráfico real.

## Conclusión

En régimen normal la forma extraída fue más lenta que el monolito en la dirección esperada, pero el ruido del equipo impide cuantificar cuánto. Con el módulo caído, colgado o lento, la ruta que lo usa pierde entre el 96 y el 99 % de sus peticiones durante la falla y tarda entre 2 y 5 s en recuperarse al quitarla; la ruta de control no tuvo errores en ninguna corrida. Con el catálogo en memoria y la IA apagada, el módulo no tiene ninguna fuente de lentitud propia que aislar, así que la extracción añade un modo de falla sin un beneficio medido. La decisión y su condición de reversión están en el ADR 0007.
