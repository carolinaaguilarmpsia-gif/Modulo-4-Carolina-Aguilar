# Base de datos

Viven en **PostgreSQL 17**: usuarios, docentes (su perfil y formación académica), roles institucionales con su auditoría, trámites de la DPA y conversaciones del orquestador. `backend/data/db.json` queda solo como **semilla** del catálogo de trámites; `conversaciones.json` ya no se usa cuando hay base.

## Levantarla

```bash
docker compose -f compose.db.yaml up -d      # PostgreSQL en 127.0.0.1:5432 (usuario, clave y base: sgai)
npm run db:setup --prefix backend            # migra el esquema, siembra 34 trámites y (fuera de producción) 10 usuarios demo; se puede repetir
```

En `backend/.env` debe estar `DATABASE_URL=postgres://sgai:sgai@localhost:5432/sgai` (ver `backend/.env.example`).

## Qué hay

| Tabla | Contenido |
|---|---|
| `facultades` | las 2 facultades demo |
| `usuarios` | cuentas de acceso, con rol (`DOCENTE`, `ADMIN_FACULTAD`, `TECNICO_DPA`, `ADMIN_SISTEMA`), facultad, vinculación y bloqueo por intentos (RB-07). Un docente es un usuario con rol `DOCENTE` |
| `perfiles_docente` | CV del docente: `formacion_academica`, `publicaciones` y `experiencia_docente` como listas `jsonb`, más `updated_at` |
| `roles_institucionales` | a lo más un rol vigente por docente (`AUTORIDAD`, `INVESTIGADOR`, `ADMINISTRATIVO`) |
| `auditoria_roles_institucionales` | una fila por cada asignación, cambio o revocación, con el rol anterior y quién lo hizo (RB-06) |
| `tramites_departamentos` | 5 departamentos, con su `orden` |
| `tramites` | 34 trámites; `requisitos` y `requisitos_detallados` en `jsonb` |
| `conversaciones` | estado del orquestador; `historial` en `jsonb` |
| `schema_migrations` | migraciones ya aplicadas |

Decisiones:

- La formación académica, las publicaciones y la experiencia se guardan como `jsonb` porque la API las trata como listas libres. Normalizarlas en filas exige definir antes sus campos.
- El cambio de rol institucional y su auditoría se escriben en **una sola transacción**, con un candado por docente, así que dos cambios simultáneos no pierden el rol anterior.
- `db:setup` no siembra usuarios demo si `NODE_ENV=production`: son cuentas con clave conocida.

Las migraciones están en `backend/infrastructure/persistence/postgres/migrations/` (`001` trámites y conversaciones, `002` usuarios, perfiles y roles); para un cambio de esquema se agrega un `003_...sql`.

## Cómo elige el servidor

- Con `DATABASE_URL`: usa PostgreSQL.
- Sin ella y fuera de producción: usa memoria y los archivos de `backend/data` y avisa por consola (así corren las pruebas sin base).
- Sin ella en producción (`NODE_ENV=production`): no arranca.

## Pruebas contra la base

```bash
TEST_DATABASE_URL=postgres://sgai:sgai@localhost:5432/sgai NODE_OPTIONS=--experimental-vm-modules npx jest --watchman=false backend/infrastructure/persistence
```

Sin `TEST_DATABASE_URL` esas pruebas se omiten.

Si corres **toda** la suite con `DATABASE_URL` definida, hazlo en serie (`--runInBand`): las pruebas HTTP y las de integración comparten la misma base y en paralelo se estorban.

## Límites conocidos

- El catálogo de trámites se lee una vez al arrancar (el puerto `ITramiteRepository` es síncrono). Un cambio en la tabla se ve al reiniciar.
- Siguen en memoria: declaraciones juradas, calendario académico y las sesiones del agente. Se reinician con el servidor.
- El campo `fuenteDatos` de las respuestas del asistente sigue diciendo `"db.json"`: cambiarlo modifica el contrato OpenAPI.
