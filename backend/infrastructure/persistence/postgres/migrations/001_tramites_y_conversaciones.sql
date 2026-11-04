-- Reemplaza backend/data/db.json (catálogo de trámites de la DPA) y backend/data/conversaciones.json
-- (estado del orquestador). El orden de departamentos y trámites se conserva con la columna `orden`.

CREATE TABLE IF NOT EXISTS tramites_departamentos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text    NOT NULL UNIQUE,
  orden  integer NOT NULL
);

CREATE TABLE IF NOT EXISTS tramites (
  codigo          text    PRIMARY KEY,
  departamento_id integer NOT NULL REFERENCES tramites_departamentos (id),
  nombre          text    NOT NULL,
  descripcion     text,
  normativa       text,
  requisitos      jsonb   NOT NULL DEFAULT '[]',
  -- Estructura libre que db.json trae en algunos trámites (formularios con código, alcance y nota).
  requisitos_detallados jsonb,
  tiempo          text    NOT NULL,
  orden           integer NOT NULL
);

-- Para listar los trámites de un departamento en su orden.
CREATE INDEX IF NOT EXISTS idx_tramites_departamento_orden ON tramites (departamento_id, orden);

CREATE TABLE IF NOT EXISTS conversaciones (
  conversacion_id text        PRIMARY KEY,
  actor_user_id   text        NOT NULL,
  docente_id      text,
  historial       jsonb       NOT NULL DEFAULT '[]',
  estado_flujo    text        NOT NULL,
  creado_en       timestamptz NOT NULL,
  actualizado_en  timestamptz NOT NULL
);
