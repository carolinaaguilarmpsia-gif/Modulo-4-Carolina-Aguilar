-- PAGINACIÓN POR CURSOR (keyset): la propuesta de diseño. El cursor es la última fila vista
-- (updated_at, id); la página siguiente entra al índice en esa posición, sin recorrer lo anterior.
-- Requiere el índice (updated_at DESC, id DESC) creado en 03-offset.sql.

-- Cursor = última fila de la página 5.000 (la fila 100.000 del orden).
SELECT updated_at AS cursor_ts, id AS cursor_id
FROM declaraciones_juradas
ORDER BY updated_at DESC, id DESC
LIMIT 1 OFFSET 99999 \gset

\echo
\echo '=== 5. CURSOR: primera página (sin cursor), pide 21 para saber si hay siguiente ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, tipo, periodo_academico, estado, updated_at
FROM declaraciones_juradas
ORDER BY updated_at DESC, id DESC
LIMIT 21;

\echo
\echo '=== 6. CURSOR: la misma página profunda de antes (después de la fila 100.000) ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, tipo, periodo_academico, estado, updated_at
FROM declaraciones_juradas
WHERE (updated_at, id) < (:'cursor_ts'::timestamptz, :'cursor_id'::uuid)
ORDER BY updated_at DESC, id DESC
LIMIT 21;
