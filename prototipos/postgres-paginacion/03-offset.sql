-- LISTADO con OFFSET: es como pagina hoy `GET /declaraciones-juradas?page=N`
-- (el repositorio en memoria ordena por updated_at descendente y corta con slice(start, start + pageSize)).
-- Aquí es el equivalente SQL: ORDER BY updated_at DESC, id DESC LIMIT 20 OFFSET (página - 1) * 20.

\echo
\echo '=== 1. SIN índice de orden: página 1 (OFFSET 0) ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, tipo, periodo_academico, estado, updated_at
FROM declaraciones_juradas
ORDER BY updated_at DESC, id DESC
LIMIT 20 OFFSET 0;

\echo
\echo '=== 2. SIN índice de orden: página profunda (OFFSET 100000) ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, tipo, periodo_academico, estado, updated_at
FROM declaraciones_juradas
ORDER BY updated_at DESC, id DESC
LIMIT 20 OFFSET 100000;

-- Índice que respalda el orden del listado.
CREATE INDEX idx_dj_updated_id ON declaraciones_juradas (updated_at DESC, id DESC);
ANALYZE declaraciones_juradas;

\echo
\echo '=== 3. CON índice (updated_at DESC, id DESC): página 1 ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, tipo, periodo_academico, estado, updated_at
FROM declaraciones_juradas
ORDER BY updated_at DESC, id DESC
LIMIT 20 OFFSET 0;

\echo
\echo '=== 4. CON índice: página profunda (OFFSET 100000) — el índice evita el Sort, pero OFFSET igual recorre 100.020 entradas ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, tipo, periodo_academico, estado, updated_at
FROM declaraciones_juradas
ORDER BY updated_at DESC, id DESC
LIMIT 20 OFFSET 100000;
