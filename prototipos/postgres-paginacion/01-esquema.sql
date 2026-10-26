-- Prototipo del diseño de persistencia (ADR-0001): la tabla de declaraciones juradas con las
-- mismas columnas que la entidad `DeclaracionJurada` del backend. Solo tiene la clave primaria:
-- los índices se agregan paso a paso en los scripts siguientes para ver su efecto con EXPLAIN.
DROP TABLE IF EXISTS declaraciones_juradas;

CREATE TABLE declaraciones_juradas (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id                 text        NOT NULL,
  facultad_id                text        NOT NULL,
  estado                     text        NOT NULL CHECK (estado IN
                               ('BORRADOR', 'EN_REVISION_FACULTAD', 'EN_REVISION_DPA', 'DEVUELTA', 'APROBADA', 'RECHAZADA')),
  docente_vinculacion_activa boolean     NOT NULL DEFAULT true,
  tipo                       text        NOT NULL CHECK (tipo IN ('LABORAL', 'PATRIMONIAL', 'INTERESES')),
  periodo_academico          text        NOT NULL,
  campos_formulario          jsonb       NOT NULL DEFAULT '{}',
  created_at                 timestamptz NOT NULL,
  updated_at                 timestamptz NOT NULL
);
