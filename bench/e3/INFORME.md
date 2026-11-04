# E3 · Informe: ¿conviene extraer Trámites DPA?

> Plantilla con lo que ya se sabe. Lo marcado con `…` se rellena con lo medido. Hipótesis en [`HIPOTESIS.md`](HIPOTESIS.md); decisión en [`docs/ADR/0007-extraer-tramites-dpa.md`](../../docs/ADR/0007-extraer-tramites-dpa.md).

## Qué se comparó

- **Módulo:** Trámites DPA (`backend/domain/tramites-dpa`). Frontera: `IAsistenteTramites.preguntar()` / `estado()`.
- **Forma 1, en proceso (monolito modular):** `TRAMITES_MODO=proceso`; llamada a función dentro de la API.
- **Forma 2, extraído (servicio aparte, detrás de Toxiproxy):** `TRAMITES_MODO=http`; la API llama por HTTP a `main-tramites.ts` a través de Toxiproxy (puerto 8666). Misma imagen, otro comando. Cliente con plazo 1000 ms por intento, 1 reintento con jitter completo (base 50 ms), circuito que abre tras 5 fallos seguidos y queda abierto 5 s.
- **Ruta que usa el módulo:** `POST /api/v1/asistente-tramites/preguntar` (32 preguntas fijas resueltas por palabras clave, `IA_HABILITADA=false`). **Ruta de control:** `GET /health`.
- **Fallas provocadas:** … (colgado / lento / caído) entre los segundos … y … desde el inicio. Solo en la forma extraída: en proceso no hay red que romper.
- **Carga:** … peticiones/s por ruta, modelo abierto (`constant-arrival-rate`), `DURACION` … s; calentamiento de … s que no se cuenta.

## Entorno

- **Máquina:** Intel Core i7-4870HQ 2,5 GHz (8 hilos), 16 GB de RAM, macOS 14.7.1.
- **Docker:** Docker Desktop, motor 29.6.2, Compose 5.3.1; la VM de Docker tiene 8 CPU y 7,75 GiB.
- **Imágenes y versiones:** Node 24.22.2 (bookworm-slim), Express 4.21, tsx 4.x, PostgreSQL 17, Toxiproxy 2.13.0, k6 2.3.0 (digests en `compose.e3.yaml`).
- **Datos: tamaño del seed y cómo se generó:** el catálogo real de la DPA, `backend/data/db.json` (26 939 bytes): 5 departamentos y 34 trámites. Lo carga `scripts/db-setup.ts` (migraciones + `sembrarTramites`, idempotente y determinista) en un contenedor `migrar` antes de que arranque la API o el módulo. Las dos formas leen el mismo seed. No se escaló: el volumen es el real. …(si el grupo agrega un seed ampliado como sensibilidad, descríbanlo aquí)
- **Carga del equipo (`uptime`) antes de cada corrida:** … (ver `*.meta.json`).

## Método

- Corridas por forma y por falla: … (5 o más), con `docker compose down -v` entre corridas (`bench/e3/correr.sh`).
- Orden de las corridas: … (¿alternadas entre formas o seguidas?)
- Resumen: `node bench/e3/resumir.mjs` → `bench/e3/resultados/resumen.md`. Datos crudos: `bench/e3/resultados/*.json`.

## Resultados

Mediana de las … corridas y, entre corchetes, el rango (mínimo–máximo). Pegar aquí las tablas de `resumen.md`.

### Falla: …

| Forma | Ruta | Fase | p95 (ms) | % errores | Peticiones |
|---|---|---|---:|---:|---:|
| En proceso | módulo | antes | … […–…] | … […–…] | … |
| En proceso | módulo | durante | | | |
| En proceso | módulo | después | | | |
| En proceso | control | antes | | | |
| En proceso | control | durante | | | |
| En proceso | control | después | | | |
| Extraído | módulo | antes | | | |
| Extraído | módulo | durante | | | |
| Extraído | módulo | después | | | |
| Extraído | control | antes | | | |
| Extraído | control | durante | | | |
| Extraído | control | después | | | |

(Repetir la tabla para cada falla.)

### Recuperación

- Segundos que tarda la ruta del módulo en volver a 0 % de errores tras quitar la falla: … […–…] (lo calcula `carga.js`, un cubo por segundo). Si alguna corrida no se recuperó dentro de la ventana, decirlo: el valor es un mínimo.

### Build y arranque

| Forma | `docker compose build` (s) | `docker compose up -d --wait` (s) |
|---|---:|---:|
| En proceso | … […–…] | … […–…] |
| Extraído | … […–…] | … […–…] |

Nota: ambas formas usan la misma imagen, así que el build no debería diferir; la diferencia está en el `up`.

### El salto del proxy

- Extraído (con Toxiproxy, sin falla), p95 de la ruta del módulo en «antes»: … ms; en proceso: … ms.

## Hipótesis: ¿se cumplieron?

| # | Hipótesis (resumen) | Resultado | ¿Se cumple? |
|---|---|---|---|
| H1 | Latencia en régimen normal | … | … |
| H2 | Ruta de control | … | … |
| H3 | Falla del módulo | … | … |
| H4 | Costo operativo | … | … |

## Amenazas a la validez

Para cada una: cómo afecta a **este** experimento y qué se hizo para acotarla.

1. **Todo en una máquina, y una máquina cargada.** La API, el módulo, Postgres, Toxiproxy y k6 comparten CPU y la red interna de Docker. Además, el equipo tenía un promedio de carga muy superior a sus 8 núcleos durante las pruebas (de 38 a más de 190 en `uptime`), con otros contenedores y aplicaciones abiertos. Eso infla el p95 y la variación entre corridas. Se registró `uptime` antes de cada corrida y se usa mediana y rango. …(qué se cerró antes de las corridas oficiales)
2. **El catálogo se sirve desde memoria.** El módulo lee la base una vez al arrancar, así que estas mediciones **no** ejercitan consultas a Postgres por petición ni la latencia o tamaño de la base. Con IA activada la latencia dominante sería Groq/Ollama, que aquí no se midió.
3. **Toxiproxy agrega un salto.** Parte de la diferencia entre formas es el proxy y no la red real. Se mide aparte en «El salto del proxy».
4. **Docker Desktop sobre macOS.** El `up` y el build dependen de la VM y del disco; el tiempo de `up` varió de 38 a 85 s entre corridas de prueba. …
5. **Calentamiento.** Los primeros segundos en frío (JIT, conexiones) inflaban el p95; se descartan … s iniciales. Esa decisión cambia los números, así que está declarada.
6. **La falla provocada no es la real.** Las fallas de Toxiproxy son limpias (conexión colgada, latencia fija). Los incidentes reales suelen ser lentitud parcial. En la forma en proceso no se puede inyectar ninguna: si el módulo se cuelga ahí, se cuelga con todo el proceso, y esa diferencia es parte del resultado, no un defecto del método.
7. **Una sola ruta y una pregunta por petición.** 32 preguntas fijas del camino por palabras clave: no representan el tráfico real ni el camino con LLM.

## Conclusión

… (dos o tres frases; la decisión y su condición de reversión están en el ADR 0007)
