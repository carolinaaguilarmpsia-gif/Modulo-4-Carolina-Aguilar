-- 300.000 declaraciones ficticias: 15 facultades, 1.500 docentes, 6 estados, 2 años de fechas.
INSERT INTO declaraciones_juradas
  (docente_id, facultad_id, estado, tipo, periodo_academico, campos_formulario, created_at, updated_at)
SELECT
  'docente-' || (1 + (random() * 1499)::int),
  'facultad-' || (1 + (random() * 14)::int),
  (ARRAY['BORRADOR', 'EN_REVISION_FACULTAD', 'EN_REVISION_DPA', 'DEVUELTA', 'APROBADA', 'RECHAZADA'])[1 + (random() * 5)::int],
  (ARRAY['LABORAL', 'PATRIMONIAL', 'INTERESES'])[1 + (random() * 2)::int],
  (ARRAY['2025-I', '2025-II', '2026-I', '2026-II'])[1 + (random() * 3)::int],
  jsonb_build_object('actividades', 'Dicta materias, carga horaria ' || (10 + (random() * 20)::int) || ' horas/semana'),
  t,
  t
FROM (SELECT now() - (random() * interval '730 days') AS t FROM generate_series(1, 300000)) AS fechas;

ANALYZE declaraciones_juradas;

SELECT count(*) AS filas, count(DISTINCT facultad_id) AS facultades FROM declaraciones_juradas;
