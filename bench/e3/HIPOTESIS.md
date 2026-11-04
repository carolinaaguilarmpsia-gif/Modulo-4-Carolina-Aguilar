# E3 — Hipótesis (escritas ANTES de las corridas oficiales)

> **Estado: PROPUESTA — el grupo debe revisar y editar los números antes de la primera corrida oficial.**
> Después de medir, este archivo no se edita: si una predicción falló, eso va al informe.

**Módulo:** Trámites DPA (`backend/domain/tramites-dpa`), frontera = `IAsistenteTramites`.
**Forma A (proceso):** `TRAMITES_MODO=proceso`. **Forma B (extraído):** `TRAMITES_MODO=http` + `main-tramites.ts`, vía Toxiproxy.
**Ruta del módulo:** `POST /api/v1/asistente-tramites/preguntar` (`IA_HABILITADA=false`, camino keyword). **Control:** `GET /health`.
**Carga:** 20 peticiones/s por ruta (40 en total), 70 s: calentamiento 0–10 s (no se cuenta), antes 10–30, falla 30–50, después 50–70.
**Falla principal:** `colgado` (la conexión se acepta y no llega nada). Secundarias: `lento` (+1500 ms) y `caido` (proxy deshabilitado).

## Cómo se produjeron estas predicciones (transparencia)

Se razonaron desde el código, no desde las corridas oficiales. Antes se hicieron **3 corridas piloto cortas** (10 rps, ventanas de 6 s) para probar que el montaje funcionaba; vieron, de pasada, que con la falla colgada el módulo daba ~2 s de p95 y ~97 % de errores, y que la recuperación tardó ~4 s. Eso **no** es independiente de H3: se declara como amenaza a la validez. H1, H2 y H4 no se habían medido a la carga final.

## Hechos del código que condicionan las hipótesis (no son predicciones)

- El catálogo (34 trámites) se lee de Postgres **una vez al arrancar** y se sirve desde memoria: una petición no consulta la base.
- La forma B agrega un salto HTTP (API → Toxiproxy → módulo), un proceso y un contenedor más.
- El cliente HTTP: plazo 1000 ms por intento, 1 reintento con espera aleatoria ≤ 50 ms, circuito que abre tras 5 fallos seguidos y queda abierto 5 s. Una petición que agota los dos intentos tarda ≈ 2 s.
- Una pregunta por palabras clave cuesta ~0,2 ms de CPU dentro del proceso.

## H1 — Latencia en régimen normal (sin falla)
- **Predicción:** p95 de la ruta del módulo en «antes»: A ≈ 10 ms, B ≈ 20 ms (el salto suma 5–15 ms).
- **Por qué:** la pregunta cuesta décimas de milisegundo; lo que domina es el HTTP del cliente, el proxy y el parseo JSON de un salto más.
- **La refuta:** si la mediana de B − A es > 30 ms, o si B < A (mediana de ≥ 5 corridas).

## H2 — La ruta de control
- **Predicción:** p95 de `/health` en «antes» ≈ 5 ms en ambas formas (diferencia < 5 ms). En B durante la falla, su p95 sube menos del doble respecto de «antes».
- **Por qué:** `/health` no toca el módulo; con `fetch` asíncrono, esperar al módulo no bloquea el event loop de la API.
- **La refuta:** si el p95 de `/health` en «durante» supera 2× el de «antes» en B, o si difiere de A en más de 5 ms sin falla.

## H3 — Falla del módulo
- **Colgado, B, fase «durante»:** errores en la ruta del módulo ≥ 90 %; p95 ≈ 2000 ms (dos intentos de 1 s); el circuito abre y, tras los primeros fallos, la mayoría falla rápido con 503.
- **Colgado, A:** no se puede inyectar (sin red). Se reporta como «no aplicable»; la diferencia de diseño es que en A un cuelgue real arrastraría todo el proceso.
- **Lento (+1500 ms), B:** también supera el plazo de 1 s → errores ≥ 90 %, p95 ≈ 2000 ms.
- **Caído, B:** el proxy rechaza al instante → errores ≥ 90 % pero p95 «durante» **bajo** (< 200 ms, a diferencia de colgado).
- **Recuperación (B, colgado):** la ruta del módulo vuelve a 0 % de errores 5–7 s después de quitar la falla (el circuito sigue abierto hasta 5 s).
- **Por qué:** plazo y reintento fijan el tiempo por petición; el circuito fija cuánto dura la recuperación.
- **La refuta:** errores < 80 % en «durante»; p95 de colgado < 1500 o > 2600 ms; recuperación > 10 s o sin recuperarse.

## H4 — Costo operativo
- **Predicción de `up -d --wait` hasta sano:** A ≈ 45 s, B ≈ 60 s (dos servicios más, con sus healthchecks).
- **Predicción de build:** A ≈ B (la misma imagen); diferencia < 20 %.
- **La refuta:** si B − A < 5 s o > 40 s (mediana), o si el build difiere más de 20 %.

## Cuándo extraer valdría la pena (entra al ADR como condición de reversión)
- **Extraeríamos si:** con la IA activada (Groq/Ollama) el p95 de `/preguntar` supera ~1 s y arrastra el p95 de `/health` de la API, o si el módulo necesita escalar o desplegarse a otro ritmo que el resto.
- **Volveríamos al monolito si:** el salto HTTP suma más de 25 ms al p95 sin falla en ≥ 4 de 5 corridas, o la recuperación tras una falla supera 10 s.
