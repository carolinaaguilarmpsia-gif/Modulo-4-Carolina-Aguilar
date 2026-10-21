# Preguntas de análisis de requisitos — GET estadísticas de DJ

Contexto: `feature.md` pide un endpoint que cuente las declaraciones juradas (DJ) por estado. La ingeniería inversa del backend mostró tres puntos que `feature.md` no resuelve. Profundidad: Minimal (solo lo esencial).

## Pregunta 1 — Ruta final del endpoint

`feature.md` dice `GET /api/dj/estadisticas`, pero el router de DJ está montado en `/api/v1/declaraciones-juradas` (`backend/api/app.ts`). Una ruta `/api/dj/...` no existiría hoy y habría que montar un router nuevo. ¿Qué ruta debe tener el endpoint?

A. `GET /api/v1/declaraciones-juradas/estadisticas` (junto al resto de rutas de DJ; no se monta nada nuevo)
B. `GET /api/dj/estadisticas` tal como dice `feature.md` (se monta un alias nuevo)
C. Ambas rutas (la de v1 y el alias de `feature.md`)
X. Other (please specify)

[Answer]: A

## Pregunta 2 — Error cuando un ADMIN_FACULTAD pide una facultad ajena

El sistema tiene un conjunto cerrado de códigos de error de dominio y ninguno dice "facultad ajena". Esto decide qué código y mensaje devuelve el 403 (la regla RB-05 pide 403).

A. Reutilizar `INSUFFICIENT_ROLE` ("No tiene permisos para acceder a este recurso.") sin agregar códigos nuevos
B. Reutilizar `FORBIDDEN_TRANSITION` ("La declaración jurada no puede modificarse en su estado actual.")
C. Agregar un código nuevo (por ejemplo `FACULTAD_AJENA`) con su mensaje en español
X. Other (please specify)

[Answer]: A

## Pregunta 3 — ADMIN_FACULTAD sin facultad asignada

Hoy el listado de DJ, si un ADMIN_FACULTAD llega sin `facultadId` en su sesión, omite el filtro y vería todas las DJ de todas las facultades. ¿Qué debe hacer el endpoint nuevo en ese caso?

A. Devolver 403 (denegar, nunca ampliar el alcance)
B. Devolver todos los conteos, igual que el listado actual
C. Devolver los 6 estados en 0
X. Other (please specify)

[Answer]: A
