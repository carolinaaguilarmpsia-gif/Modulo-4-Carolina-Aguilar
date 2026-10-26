# Prototipo: paginación e índices con EXPLAIN

Responde a la pregunta fija de la demo 2: **«Muestra cómo paginas y tus índices, con EXPLAIN»**.

> **Alcance, dicho con claridad:** el backend de SGAI guarda hoy todo en memoria, así que sobre el producto no hay `EXPLAIN` posible. Este prototipo lleva **la misma consulta del listado de declaraciones juradas** a PostgreSQL 17 (el destino previsto en el ADR-0001), con la misma tabla, el mismo orden y los mismos filtros, para medir cómo conviene paginarla y qué índices necesita. **No está conectado al backend.**

## Cómo ejecutarlo

Con Docker Desktop abierto, desde la raíz del repositorio:

```bash
bash prototipos/postgres-paginacion/run.sh
```

Levanta un PostgreSQL desechable (puerto 5433, solo local), carga 300.000 declaraciones ficticias, ejecuta los cuatro scripts y guarda cada plan en `salida/`. Para borrar la base: `docker rm -f sgai-pg-prototipo`.

## Qué hay en cada script

| Script | Qué muestra |
|---|---|
| `01-esquema.sql` | La tabla, con las columnas de la entidad `DeclaracionJurada` y solo la clave primaria |
| `02-semilla.sql` | 300.000 filas: 15 facultades, 1.500 docentes, 6 estados, 2 años de fechas |
| `03-offset.sql` | **Cómo pagina hoy** el producto (`?page=N`, equivalente a `OFFSET`), sin índice y con índice |
| `04-cursor.sql` | **La propuesta**: paginación por cursor (keyset) |
| `05-indices.sql` | Un índice que **falta** (y su efecto) y dos índices que **sobran** |

## Cómo pagina el producto hoy

`GET /api/v1/declaraciones-juradas?page=N` ordena por `updated_at` descendente y corta una página de tamaño fijo: es paginación por **offset**. Sobre PostgreSQL equivale a:

```sql
ORDER BY updated_at DESC, id DESC LIMIT 20 OFFSET (N - 1) * 20
```

## Qué debes ver en los planes

Los números dependen de tu equipo; lo importante es la forma. (Referencia: ejecuté estos mismos scripts en un PostgreSQL en WebAssembly, no en Docker, así que tus tiempos serán distintos.)

| # | Consulta | Lo que debe aparecer |
|---|---|---|
| 1 y 2 | Offset, **sin** índice de orden | `Seq Scan` y `Sort`; en la página profunda el `Sort` sale a disco (`external merge`) |
| 3 | Offset, con índice, página 1 | `Index Scan`, sin `Sort`, milisegundos |
| 4 | Offset, con índice, **página profunda** | `Index Scan` que produce 100.020 filas: lee unas 100.000 páginas de buffer para devolver 20 |
| 5 y 6 | **Cursor**, primera página y página profunda | `Index Scan` que produce 21 filas, con casi los mismos buffers en las dos |
| 7 | Total por facultad y estado, sin índice | `Seq Scan` de toda la tabla |
| 9 | Lo mismo, con índice | `Bitmap Index Scan` sobre `idx_dj_facultad_estado_updated` |
| 8 y 10 | Declaraciones de un docente | Sin índice recorre decenas de miles de buffers; con `idx_dj_docente_updated`, unas decenas |
| 11 | `pg_stat_user_indexes` | `idx_dj_facultad` e `idx_dj_estado` con `usos = 0`: sobran |

## Lectura de los resultados

- **Offset:** el trabajo crece con la página. Con el índice correcto evita el `Sort`, pero la página profunda sigue leyendo todo lo anterior.
- **Cursor (keyset):** entra al índice en la posición del cursor y lee 21 filas en cualquier página. Cada fila aparece una vez aunque haya escrituras entre páginas. El cursor debe ser opaco para el cliente.
- **Índice que falta:** el síntoma es `Seq Scan` (o un recorrido enorme de otro índice) donde debería haber un `Index Scan`. Aquí faltaban los índices por `(facultad_id, estado, …)` y por `docente_id`, que son exactamente los filtros por rol del producto (RB-05).
- **Índices que sobran:** `idx_dj_facultad` es un prefijo del índice compuesto y `idx_dj_estado` no lo usa ninguna consulta. Cada `INSERT` y `UPDATE` tendría que mantenerlos y ocupan disco, así que se eliminan al final del script.

## Qué decir en la demo

> «Hoy el listado pagina por offset sobre datos en memoria, así que no tengo `EXPLAIN` del producto. Llevé la misma consulta a PostgreSQL con 300.000 filas. Con offset, una página profunda lee unas 100.000 entradas para devolver 20; con cursor lee 21 en cualquier página, así que propongo cursor opaco con límite máximo. Los filtros por rol necesitan un índice compuesto por facultad y estado, y por docente; sin ellos el plan es un `Seq Scan`. Un índice por facultad sola y otro por estado sobran: tienen cero usos.»

## Lo que este prototipo no demuestra

- No mide el producto real: falta migrar los repositorios a PostgreSQL (hallazgo F12-03 de la auditoría).
- La semilla es aleatoria: las distribuciones de datos reales de la UMSS pueden cambiar los planes.
- No cubre concurrencia ni escrituras: el costo de mantener índices se explica, no se mide.
