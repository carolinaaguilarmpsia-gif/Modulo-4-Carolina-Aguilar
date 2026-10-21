# Feature: `GET /api/dj/estadisticas`

Conteo de declaraciones juradas por estado.

- **Entrada:** `?facultadId=` opcional. DOCENTE ve solo las suyas; ADMIN_FACULTAD solo su facultad (RB-05); TECNICO_DPA y ADMIN_SISTEMA ven todas y pueden filtrar por facultad.
- **Salida 200:** `{ porEstado: { BORRADOR, EN_REVISION_FACULTAD, APROBADA, DEVUELTA, EN_REVISION_DPA, RECHAZADA }, total, correlationId }`, con los 6 estados siempre presentes (0 si no hay).
- **Errores:** 401 sin token; 403 si un ADMIN_FACULTAD pide una facultad ajena.
- **Aceptación:** los tests pasan, la respuesta incluye los 6 estados y no se filtran datos de otros docentes.
