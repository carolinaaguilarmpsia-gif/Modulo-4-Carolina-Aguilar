# Resumen E3 (mediana [mín–máx] de las corridas)

## http · falla caido — 5 corridas

Tiempos: `up` hasta sano 32.7 [20.8–33.2] s · build 8.3 [8.3–8.3] s

Carga: 20/s por ruta · 70 s (calentamiento 10 s, falla en 30–50 s)

| Ruta | Fase | p95 (ms) | Errores (%) | Peticiones |
|---|---|---|---|---|
| modulo | antes | 142 [69–506] | 0.0 [0.0–0.0] | 400 [400–400] |
| modulo | durante | 77 [9–120] | 96.3 [93.8–98.8] | 400 [400–400] |
| modulo | despues | 39 [15–240] | 8.2 [3.7–10.8] | 417 [406–427] |
| control | antes | 47 [24–203] | 0.0 [0.0–0.0] | 400 [400–400] |
| control | durante | 30 [5–46] | 0.0 [0.0–0.0] | 400 [400–400] |
| control | despues | 13 [5–102] | 0.0 [0.0–0.0] | 417 [406–428] |

Recuperación de la ruta del módulo tras terminar la falla (s hasta 0 % de errores): 2 [1–3]

Carga del equipo antes de cada corrida (uptime): 24.32 13.09 13.64 | 8.59 11.15 12.83 | 12.90 11.59 12.77 | 9.75 11.07 12.42 | 6.86 9.66 11.70

## http · falla colgado — 5 corridas

Tiempos: `up` hasta sano 19.6 [15.0–35.5] s · build 4.1 [4.1–4.1] s

Carga: 20/s por ruta · 70 s (calentamiento 10 s, falla en 30–50 s)

| Ruta | Fase | p95 (ms) | Errores (%) | Peticiones |
|---|---|---|---|---|
| modulo | antes | 29 [10–361] | 0.0 [0.0–1.0] | 400 [400–400] |
| modulo | durante | 2057 [2034–2980] | 99.3 [93.0–100.0] | 400 [390–400] |
| modulo | despues | 29 [20–63] | 19.0 [17.1–24.3] | 404 [403–429] |
| control | antes | 8 [3–98] | 0.0 [0.0–0.0] | 400 [400–400] |
| control | durante | 22 [9–478] | 0.0 [0.0–0.0] | 400 [400–400] |
| control | despues | 12 [6–23] | 0.0 [0.0–0.0] | 404 [402–429] |

Recuperación de la ruta del módulo tras terminar la falla (s hasta 0 % de errores): 4 [4–5]

Carga del equipo antes de cada corrida (uptime): 15.89 14.53 20.47 | 10.76 12.90 19.23 | 21.04 14.23 18.95 | 13.44 14.03 18.38 | 8.33 11.97 17.11

## http · falla lento — 5 corridas

Tiempos: `up` hasta sano 31.4 [12.5–35.0] s · build 11.4 [11.4–11.4] s

Carga: 20/s por ruta · 70 s (calentamiento 10 s, falla en 30–50 s)

| Ruta | Fase | p95 (ms) | Errores (%) | Peticiones |
|---|---|---|---|---|
| modulo | antes | 49 [5–270] | 0.0 [0.0–0.0] | 400 [400–403] |
| modulo | durante | 2033 [2029–2079] | 96.5 [95.0–100.0] | 400 [400–400] |
| modulo | despues | 17 [9–300] | 19.7 [16.7–20.7] | 415 [401–421] |
| control | antes | 15 [2–111] | 0.0 [0.0–0.0] | 400 [400–403] |
| control | durante | 4 [3–13] | 0.0 [0.0–0.0] | 400 [400–400] |
| control | despues | 7 [3–138] | 0.0 [0.0–0.0] | 415 [400–420] |

Recuperación de la ruta del módulo tras terminar la falla (s hasta 0 % de errores): 5 [4–5]

Carga del equipo antes de cada corrida (uptime): 6.87 9.95 15.56 | 6.17 8.78 14.42 | 5.23 7.65 13.41 | 11.00 8.98 13.28 | 6.06 7.83 12.28

## proceso · falla no inyectable (sin red) — 5 corridas

Tiempos: `up` hasta sano 29.4 [7.9–35.8] s · build 13.5 [13.5–13.5] s

Carga: 20/s por ruta · 70 s (calentamiento 10 s, falla en 30–50 s)

| Ruta | Fase | p95 (ms) | Errores (%) | Peticiones |
|---|---|---|---|---|
| modulo | antes | 12 [3–25] | 0.0 [0.0–0.0] | 400 [399–400] |
| modulo | durante | 8 [3–20] | 0.0 [0.0–0.0] | 400 [400–400] |
| modulo | despues | 12 [3–17] | 0.0 [0.0–0.0] | 402 [401–404] |
| control | antes | 9 [2–20] | 0.0 [0.0–0.0] | 400 [399–400] |
| control | durante | 6 [3–17] | 0.0 [0.0–0.0] | 400 [400–400] |
| control | despues | 8 [3–16] | 0.0 [0.0–0.0] | 402 [401–404] |

Recuperación de la ruta del módulo tras terminar la falla (s hasta 0 % de errores): 0 [0–0]

Carga del equipo antes de cada corrida (uptime): 25.22 12.66 25.63 | 16.18 13.52 24.34 | 7.93 11.99 22.48 | 7.77 11.48 21.21 | 6.61 10.14 19.82

