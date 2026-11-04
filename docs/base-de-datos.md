# Base de datos

Viven en **PostgreSQL 17**: usuarios, docentes (su perfil y formación académica), roles institucionales con su auditoría, declaraciones juradas con su historial, calendario académico, trámites de la DPA y conversaciones del orquestador. `backend/data/db.json` queda solo como **semilla** del catálogo de trámites; `conversaciones.json` ya no se usa cuando hay base.

## Levantarla

```bash
docker compose -f compose.db.yaml up -d      # PostgreSQL en 127.0.0.1:5432 (usuario, clave y base: sgai)
npm run db:setup --prefix backend            # migra el esquema, siembra 34 trámites y (fuera de producción) 10 usuarios y 5 declaraciones juradas demo; se puede repetir
```

En `backend/.env` debe estar `DATABASE_URL=postgres://sgai:sgai@localhost:5432/sgai` (ver `backend/.env.example`).

## El stack completo (producción y demo)

`compose.yaml` levanta PostgreSQL, aplica las migraciones (servicio `migrar`) y arranca la API, todo con `docker compose up -d --wait`. La base no publica puertos. En producción no se siembran usuarios ni DJ de ejemplo salvo `SGAI_SEED_DEMO=true`, que el compose de la demo activa por defecto. Variables en `.env.example`. `compose.db.yaml` sigue siendo solo la base, para desarrollo con la API en tu máquina.

## Qué hay

| Tabla | Contenido |
|---|---|
| `facultades` | las 2 facultades demo |
| `usuarios` | cuentas de acceso, con rol (`DOCENTE`, `ADMIN_FACULTAD`, `TECNICO_DPA`, `ADMIN_SISTEMA`), facultad, vinculación y bloqueo por intentos (RB-07). Un docente es un usuario con rol `DOCENTE` |
| `perfiles_docente` | CV del docente: `formacion_academica`, `publicaciones` y `experiencia_docente` como listas `jsonb`, más `updated_at` |
| `roles_institucionales` | a lo más un rol vigente por docente (`AUTORIDAD`, `INVESTIGADOR`, `ADMINISTRATIVO`) |
| `auditoria_roles_institucionales` | una fila por cada asignación, cambio o revocación, con el rol anterior y quién lo hizo (RB-06) |
| `declaraciones_juradas` | cada DJ con su docente, facultad, estado (`CHECK` con los 6 estados) y `campos_formulario` en `jsonb` |
| `historial_dj` | una fila por cada cambio de estado, con quién lo hizo y las observaciones (RB-06) |
| `calendarios_academicos` | un calendario por período y ámbito (`INSTITUCIONAL` o el id de la facultad); `eventos` en `jsonb` |
| `tramites_departamentos` | 5 departamentos, con su `orden` |
| `tramites` | 34 trámites; `requisitos` y `requisitos_detallados` en `jsonb` |
| `conversaciones` | estado del orquestador; `historial` en `jsonb` |
| `schema_migrations` | migraciones ya aplicadas |

Decisiones:

- La formación académica, las publicaciones y la experiencia se guardan como `jsonb` porque la API las trata como listas libres. Normalizarlas en filas exige definir antes sus campos.
- El cambio de rol institucional y su auditoría se escriben en **una sola transacción**, con un candado por docente, así que dos cambios simultáneos no pierden el rol anterior.
- El cambio de estado de una DJ y su fila de historial también van en **una sola transacción**, con `SELECT ... FOR UPDATE` sobre la DJ: si dos revisores actúan a la vez, solo uno gana y el otro recibe `PERSISTENCE_ERROR`.
- El calendario se reemplaza completo en cada guardado (`UPSERT` por período y ámbito), igual que el contrato del puerto.
- `db:setup` no siembra usuarios ni DJ demo si `NODE_ENV=production`: son cuentas y datos de ejemplo. Sembrar de nuevo no pisa una DJ que ya cambió de estado.

Las migraciones están en `backend/infrastructure/persistence/postgres/migrations/` (`001` trámites y conversaciones, `002` usuarios, perfiles y roles, `003` declaraciones juradas y calendario); para un cambio de esquema se agrega un `004_...sql`.

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
- Sigue en memoria solo las sesiones del agente (`InMemoryAgenteSessionStore`). Se reinician con el servidor.
- El campo `fuenteDatos` de las respuestas del asistente sigue diciendo `"db.json"`: cambiarlo modifica el contrato OpenAPI.
