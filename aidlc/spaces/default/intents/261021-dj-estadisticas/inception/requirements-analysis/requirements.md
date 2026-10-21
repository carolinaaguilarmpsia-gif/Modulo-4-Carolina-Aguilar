# Requisitos — Endpoint de estadísticas de declaraciones juradas

## Análisis de la intención

Initial description: Implementar el endpoint GET /api/dj/estadisticas descrito en feature.md

Objetivo: que usuarios autenticados obtengan, en una sola llamada, cuántas declaraciones juradas (DJ) hay en cada estado dentro del alcance que su rol permite. Cambio pequeño de backend, profundidad Minimal, sobre código existente (brownfield).

Fuentes: `feature.md`, la base de conocimiento del backend (`aidlc/spaces/default/codekb/Modulo-4-Carolina-Aguilar/`) y las respuestas Q1–Q3 de `requirements-analysis-questions.md`.

## Requisitos funcionales

- **FR1** El sistema debe exponer `GET /api/v1/declaraciones-juradas/estadisticas` dentro del router de DJ existente, sin montar un router nuevo (decisión Q1 = A). La ruta se declara antes de `GET /:id` para que `estadisticas` no se interprete como un id.
  - **FR1.1** La ruta exige sesión válida con alguno de los 4 roles existentes (el router ya lo aplica con `requireRole`); sin token válido responde 401.
- **FR2** La respuesta 200 tiene la forma `{ porEstado, total, correlationId }`.
  - **FR2.1** `porEstado` contiene siempre los 6 estados de `EstadoDJ` (`BORRADOR`, `EN_REVISION_FACULTAD`, `APROBADA`, `DEVUELTA`, `EN_REVISION_DPA`, `RECHAZADA`), con valor 0 cuando no hay DJ en ese estado.
  - **FR2.2** `total` es la suma de los 6 conteos.
- **FR3** Alcance por rol:
  - **FR3.1** DOCENTE: cuenta solo sus propias DJ.
  - **FR3.2** ADMIN_FACULTAD: cuenta solo las DJ de su facultad (RB-05).
  - **FR3.3** TECNICO_DPA y ADMIN_SISTEMA: cuentan todas las DJ.
- **FR4** Parámetro opcional `?facultadId=`:
  - **FR4.1** Para TECNICO_DPA y ADMIN_SISTEMA filtra el conteo a esa facultad.
  - **FR4.2** Para ADMIN_FACULTAD con una facultad distinta de la suya, responde 403 con el código de dominio `INSUFFICIENT_ROLE` (decisión Q2 = A; no se agregan códigos nuevos).
  - **FR4.3** Para DOCENTE se ignora: el alcance sigue siendo solo sus DJ.
- **FR5** Un ADMIN_FACULTAD sin `facultadId` en su sesión recibe 403 (`INSUFFICIENT_ROLE`); nunca se amplía el alcance (decisión Q3 = A). No se replica el comportamiento actual de `listar`, que en ese caso omite el filtro.

## Requisitos no funcionales

- **NFR1** (seguridad) La respuesta no incluye datos de DJ individuales ni de otros docentes: solo conteos.
- **NFR2** (trazabilidad) La respuesta incluye `correlationId`, como el resto de endpoints de DJ.
- **NFR3** (errores) Los errores salen por el manejador global existente con la forma `{ error, message, correlationId }`.
- **NFR4** (arquitectura) La lógica de conteo vive en `DeclaracionJuradaService` (dominio) sin importar Express ni Prisma; el controlador solo traduce la petición y la respuesta.
- **NFR5** (calidad) Cada FR tiene al menos una prueba automatizada; las pruebas existentes siguen en verde (estrategia Minimal del alcance express).

## Restricciones

- Stack existente: TypeScript, Express, Jest + ts-jest ejecutado desde la raíz con `NODE_OPTIONS=--experimental-vm-modules jest <ruta> --watchman=false`.
- Arquitectura hexagonal del proyecto: el dominio no depende de infraestructura ni de Express.
- No se cambian los 6 estados ni las transiciones de DJ.

## Suposiciones

- [assumption] Para contar se puede reutilizar `repository.list` con un tamaño de página grande, sin agregar un método al puerto del repositorio. Motivo: evita modificar el puerto y sus dobles de prueba en un cambio pequeño; se valida en diseño/código.
- [assumption] La regla RB-05 (roles institucionales de la misma facultad) se toma de `feature.md` y del escaneo; su texto original está en `docs/.cursor/rules/sgai-domain.mdc`, fuera del alcance escaneado.

## Fuera de alcance

- Paginación, filtros por estado o por periodo, y exportaciones.
- Cambios en frontend.
- Un método de conteo específico en el repositorio de Prisma o cambios de esquema.
- Un alias `/api/dj/estadisticas` (descartado en Q1).
- Corregir el comportamiento fail-open de `listar`.

## Preguntas abiertas

None.

## Trazabilidad de decisiones

| Decisión | Pregunta | Respuesta |
|----------|----------|-----------|
| Ruta final del endpoint | Q1 | A — v1 junto a las DJ |
| Código del 403 por facultad ajena | Q2 | A — `INSUFFICIENT_ROLE` |
| ADMIN_FACULTAD sin facultad | Q3 | A — 403 |

Los criterios de aceptación de `feature.md` se mantienen: las pruebas pasan, la respuesta incluye los 6 estados y no se filtran datos de otros docentes.
