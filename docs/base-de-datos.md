# Base de datos de trámites y conversaciones

Los trámites de la DPA y el estado del orquestador viven en **PostgreSQL 17**. `backend/data/db.json` queda solo como **semilla** del catálogo; `conversaciones.json` ya no se usa cuando hay base.

## Levantarla

```bash
docker compose -f compose.db.yaml up -d      # PostgreSQL en 127.0.0.1:5432 (usuario, clave y base: sgai)
npm run db:setup --prefix backend            # migra el esquema y siembra los 34 trámites (se puede repetir)
```

En `backend/.env` debe estar `DATABASE_URL=postgres://sgai:sgai@localhost:5432/sgai` (ver `backend/.env.example`).

## Qué hay

| Tabla | Contenido |
|---|---|
| `tramites_departamentos` | 5 departamentos, con su `orden` |
| `tramites` | 34 trámites; `requisitos` y `requisitos_detallados` en `jsonb` |
| `conversaciones` | estado del orquestador; `historial` en `jsonb` |
| `schema_migrations` | migraciones ya aplicadas |

Las migraciones están en `backend/infrastructure/persistence/postgres/migrations/`; para un cambio de esquema se agrega un `002_...sql`.

## Cómo elige el servidor

- Con `DATABASE_URL`: usa PostgreSQL.
- Sin ella y fuera de producción: usa los archivos de `backend/data` y avisa por consola (así corren las pruebas sin base).
- Sin ella en producción (`NODE_ENV=production`): no arranca.

## Pruebas contra la base

```bash
TEST_DATABASE_URL=postgres://sgai:sgai@localhost:5432/sgai NODE_OPTIONS=--experimental-vm-modules npx jest --watchman=false backend/infrastructure/persistence
```

Sin `TEST_DATABASE_URL` esas pruebas se omiten.

## Límites conocidos

- El catálogo de trámites se lee una vez al arrancar (el puerto `ITramiteRepository` es síncrono). Un cambio en la tabla se ve al reiniciar.
- Usuarios, declaraciones juradas, roles, perfil y calendario siguen en memoria.
- El campo `fuenteDatos` de las respuestas del asistente sigue diciendo `"db.json"`: cambiarlo modifica el contrato OpenAPI.
