# ADR-0007: Extraer (o no) el módulo Trámites DPA a un servicio

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0007 |
| Título | Trámites DPA: monolito modular frente a servicio extraído |
| Fecha | 04/11/2026 |
| Autor(es) | Carolina Aguilar (G01) |
| Estado | **Propuesta** — pendiente de confirmación del grupo; pasa a Aceptada al confirmarla |
| Relacionado | ADR-0001 (monolito hexagonal), ADR-0004 (Docker Compose on-premise), `bench/e3/INFORME.md` |

### 1. Contexto

Trámites DPA (`backend/domain/tramites-dpa`) responde preguntas sobre el catálogo de trámites (requisitos, plazos, normativa). Es candidato a extraerse porque:

- Es el único módulo con otro *runtime*: el router puede llamar a Groq (LLM) y a Ollama (embeddings), con latencias de segundos y fallas propias.
- Tiene su propio dato: las tablas `tramites_departamentos` y `tramites` (34 trámites en 5 departamentos, ~27 KB en `db.json`).
- Su única entrada desde fuera es `AsistenteTramitesService.preguntar()`, que ya es asíncrona.

Restricciones:

- El catálogo se lee de Postgres **una sola vez al arrancar** y se sirve desde memoria. Una petición normal no consulta la base.
- El camino medido es el de palabras clave (`IA_HABILITADA=false`), sin LLM ni red externa. Así el experimento mide la frontera y no a Groq.
- Despliegue on-premise con Docker Compose (ADR-0004).

### 2. Alternativas consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| A. **Monolito modular** (el módulo en el mismo proceso, detrás de `IAsistenteTramites`) | Sin red entre piezas; un solo despliegue | Si el módulo se cuelga o se satura, afecta a toda la API |
| B. **Servicio extraído** (mismo código, otro proceso, `TRAMITES_MODO=http`) | Aísla la falla y la carga del módulo; escala aparte | Un salto de red, un proceso más que operar, y manejar plazos, reintentos y circuito |

### 3. Decisión

> **No extraer Trámites DPA por ahora: se mantiene como monolito modular (`TRAMITES_MODO=proceso`, valor por defecto).**
> Se deja preparada la extracción: el puerto `IAsistenteTramites`, el cliente HTTP (plazo 1000 ms por intento, 1 reintento con jitter, circuito de 5 fallos / 5 s), `main-tramites.ts`, el `compose.e3.yaml` y el chequeo de frontera ya existen y están probados. Extraer es cambiar una variable de entorno y desplegar un contenedor más.

### 4. Evidencia

Medianas y rangos de 5 corridas por tanda (detalle y amenazas en `bench/e3/INFORME.md`; datos crudos en `bench/e3/resultados/`). Carga: 20 peticiones/s por ruta, falla entre los segundos 30 y 50.

- **Sin falla:** p95 de la ruta del módulo, en proceso 12 ms; extraído 68 ms con las 15 corridas (29, 49 y 142 ms según la tanda). La dirección es clara (extraído más lento) pero la magnitud no es fiable: el ruido del equipo (5–506 ms en la misma forma) abarca la diferencia.
- **Con el módulo colgado, lento o caído (extraído):** la ruta del módulo pierde entre 96 y 99 % de sus peticiones durante la falla; con colgado y lento el p95 ronda 2,0 s (dos intentos de 1 s), con caído 77 ms. Se recupera 2–5 s después de quitar la falla (el circuito sigue abierto hasta 5 s).
- **Ruta que no usa el módulo, durante la falla:** 0 % de errores en las 15 corridas. El aislamiento funciona, pero en proceso no existe una falla independiente del módulo contra la cual compararlo: con IA apagada y el catálogo en memoria, una pregunta cuesta ~0,2 ms de CPU y no depende de nada externo.
- **Build y arranque:** `up` hasta sano, mediana 29,4 s en las dos formas (rangos 8–36 s). El build no se pudo comparar (una medición por tanda, con caché).

### 5. Consecuencias

- **Se evita:** un contenedor más (`tramites`), un proxy o balanceador, reintentos y circuito que operar y afinar, y un modo de falla nuevo (96–99 % de errores en la ruta del módulo mientras el servicio extraído no responda) sin un beneficio medido.
- **Se renuncia a:** escalar o desplegar el módulo por separado, y a aislar un cuelgue del módulo del resto de la API. Hoy no hay una carga que lo pida.
- **Queda por hacer:** (1) repetir la medición con `IA_HABILITADA=true` (Groq/Ollama), que es el caso donde el aislamiento podría compensar; (2) si se extrae, hacer que el orquestador degrade con un mensaje en vez de un error 500 cuando el módulo no responde (hoy solo el endpoint público traduce a 503); (3) repetir en una máquina menos cargada y alternando las formas para acotar el ruido.

### 6. Condición de reversión

Se **extrae** el módulo (`TRAMITES_MODO=http`) si se cumple cualquiera de estas, medida con la misma carga y ≥ 5 corridas con `down -v` entre ellas:

1. Con `IA_HABILITADA=true`, el p95 de `POST /preguntar` en proceso supera 1000 ms **y** el p95 de `GET /health` de la misma API sube más de 2× respecto de su valor sin carga en el módulo (el módulo arrastra al resto).
2. El módulo debe escalar o desplegarse a un ritmo distinto del resto, o su carga sostenida supera los ~100 peticiones/s por instancia.

Se **vuelve** al monolito si, ya extraído, en ≥ 4 de 5 corridas el salto HTTP suma más de 25 ms al p95 sin falla, o la recuperación tras una falla supera 10 s.

### 7. Trazabilidad

`bench/e3/HIPOTESIS.md`, `bench/e3/INFORME.md`, `backend/domain/tramites-dpa/ports/in/IAsistenteTramites.ts`, `compose.e3.yaml`.
