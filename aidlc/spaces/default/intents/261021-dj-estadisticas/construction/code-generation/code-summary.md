# Resumen de código — GET estadísticas de DJ

## Archivos creados y modificados

Modificados:
- `backend/domain/declaracion-jurada/types/CrearDJ.ts`: tipo `EstadisticasDJ` (`porEstado` con los 6 estados y `total`).
- `backend/domain/declaracion-jurada/services/DeclaracionJuradaService.ts`: método `estadisticas(actor, facultadId?)`.
- `backend/api/controllers/dj.controller.ts`: acción `estadisticas`.
- `backend/api/routes/dj.routes.ts`: `GET /estadisticas`, declarada antes de `GET /:id`.

Creados:
- `backend/domain/declaracion-jurada/services/DeclaracionJuradaService.estadisticas.test.ts`: 9 pruebas del servicio.
- `backend/api/dj.estadisticas.test.ts`: 5 pruebas HTTP con supertest.

## Decisiones de implementación

- El conteo reutiliza `repository.list` con una página grande (constante `PAGE_SIZE_ESTADISTICAS`, 100000); no se cambió el puerto del repositorio.
- DOCENTE filtra por `docenteId` e ignora `facultadId`. ADMIN_FACULTAD sin `facultadId` en sesión, o que pide otra facultad, recibe `ForbiddenError('INSUFFICIENT_ROLE')`. TECNICO_DPA y ADMIN_SISTEMA cuentan todo, con filtro opcional.
- Los 6 estados de `EstadoDJ` salen siempre, con 0 por defecto.
- El controlador toma `facultadId` de la query solo si es un texto no vacío.
- La ruta queda dentro del router de DJ existente, así que hereda `requireRole` (401 sin token) y el manejador global de errores.

## Cobertura de pruebas

- Servicio: 9 de 9 pasan. HTTP: 5 de 5 pasan. Regresión de `DeclaracionJuradaService.test.ts`: 13 de 13 pasan (según el desarrollador; Build and Test las vuelve a ejecutar).
- Total de pruebas nuevas: 14, por encima de las 11 estimadas en el plan.

## Desviaciones del plan

- Se escribieron 14 pruebas en vez de unas 11.
- Una observación: `npx tsc --noEmit -p backend` falla con TS6059 porque `backend/tsconfig.json` incluye `../demo/dj-core/**/*` fuera de `rootDir`. Ya ocurría antes del cambio y no involucra archivos de esta unidad.
- Contar con `repository.list` y una página de 100000 es válido con el repositorio en memoria; con Prisma convendría un `countByEstado` en el puerto (fuera de alcance).
