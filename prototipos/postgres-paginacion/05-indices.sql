-- ÍNDICES QUE FALTAN E ÍNDICES QUE SOBRAN, con las consultas reales del producto:
--  · ADMIN_FACULTAD ve solo su facultad (RB-05) y puede filtrar por estado.
--  · El listado devuelve también `total` (un COUNT con los mismos filtros).

\echo
\echo '=== 7. FALTA UN ÍNDICE: el total de una facultad y un estado (hoy solo existe el de orden) ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM declaraciones_juradas
WHERE facultad_id = 'facultad-3' AND estado = 'EN_REVISION_FACULTAD';

\echo
\echo '=== 8. FALTA UN ÍNDICE: declaraciones de un docente (DOCENTE ve solo las suyas) ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, tipo, estado, updated_at FROM declaraciones_juradas
WHERE docente_id = 'docente-77'
ORDER BY updated_at DESC, id DESC
LIMIT 20;

-- Los índices que cubren esos filtros y el orden del listado.
CREATE INDEX idx_dj_facultad_estado_updated ON declaraciones_juradas (facultad_id, estado, updated_at DESC, id DESC);
CREATE INDEX idx_dj_docente_updated        ON declaraciones_juradas (docente_id, updated_at DESC, id DESC);
ANALYZE declaraciones_juradas;

\echo
\echo '=== 9. CON índice: el mismo total por facultad y estado ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM declaraciones_juradas
WHERE facultad_id = 'facultad-3' AND estado = 'EN_REVISION_FACULTAD';

\echo
\echo '=== 10. CON índice: declaraciones de un docente ==='
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, tipo, estado, updated_at FROM declaraciones_juradas
WHERE docente_id = 'docente-77'
ORDER BY updated_at DESC, id DESC
LIMIT 20;

-- ÍNDICES QUE SOBRAN: dos índices "por si acaso" que el compuesto ya cubre (prefijo) o que nadie consulta.
-- idx_dj_facultad es prefijo de idx_dj_facultad_estado_updated: el compuesto ya sirve esas consultas.
CREATE INDEX idx_dj_facultad ON declaraciones_juradas (facultad_id);
-- idx_dj_estado: ninguna consulta del producto filtra solo por estado.
CREATE INDEX idx_dj_estado ON declaraciones_juradas (estado);
ANALYZE declaraciones_juradas;

-- Se ejecuta de nuevo la carga de trabajo para que las estadísticas de uso se llenen.
SELECT count(*) FROM declaraciones_juradas WHERE facultad_id = 'facultad-3' AND estado = 'EN_REVISION_FACULTAD' \g /dev/null
SELECT id FROM declaraciones_juradas WHERE docente_id = 'docente-77' ORDER BY updated_at DESC, id DESC LIMIT 20 \g /dev/null
SELECT id FROM declaraciones_juradas ORDER BY updated_at DESC, id DESC LIMIT 20 \g /dev/null
SELECT pg_sleep(2);

\echo
\echo '=== 11. ÍNDICES QUE SOBRAN: los que nunca se usan (idx_scan = 0) cuestan en cada INSERT y UPDATE ==='
SELECT relname AS tabla, indexrelname AS indice, idx_scan AS usos,
       pg_size_pretty(pg_relation_size(indexrelid)) AS tamano
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan, indexrelname;

DROP INDEX idx_dj_facultad;
DROP INDEX idx_dj_estado;
