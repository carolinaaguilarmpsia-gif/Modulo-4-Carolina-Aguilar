-- Declaraciones juradas (con su historial de transiciones) y calendario académico (antes en memoria).

-- FSD-UC-002: la DJ pertenece a un docente (usuario) y a una facultad.
CREATE TABLE IF NOT EXISTS declaraciones_juradas (
  id                           text        PRIMARY KEY,
  docente_id                   text        NOT NULL REFERENCES usuarios (id),
  facultad_id                  text        NOT NULL REFERENCES facultades (id),
  estado                       text        NOT NULL CHECK (estado IN
    ('BORRADOR', 'EN_REVISION_FACULTAD', 'APROBADA', 'DEVUELTA', 'EN_REVISION_DPA', 'RECHAZADA')),
  -- RB-01: se guarda explícito, no se asume.
  docente_vinculacion_activa   boolean     NOT NULL,
  tipo                         text        NOT NULL,
  periodo_academico            text        NOT NULL,
  campos_formulario            jsonb       NOT NULL DEFAULT '{}',
  created_at                   timestamptz NOT NULL,
  updated_at                   timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dj_docente ON declaraciones_juradas (docente_id);
CREATE INDEX IF NOT EXISTS idx_dj_facultad_estado ON declaraciones_juradas (facultad_id, estado);
CREATE INDEX IF NOT EXISTS idx_dj_updated_at ON declaraciones_juradas (updated_at DESC);

-- RB-06: cada cambio de estado deja una fila, escrita en la misma transacción que el cambio.
-- actor_id no lleva clave foránea: también puede actuar un proceso del sistema, no solo un usuario.
CREATE TABLE IF NOT EXISTS historial_dj (
  id              text        PRIMARY KEY,
  dj_id           text        NOT NULL REFERENCES declaraciones_juradas (id),
  actor_id        text        NOT NULL,
  estado_anterior text        NOT NULL,
  estado_nuevo    text        NOT NULL,
  observaciones   text,
  ocurrido_en     timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_historial_dj ON historial_dj (dj_id, ocurrido_en);

-- FSD-UC-008: un calendario por (período, ámbito). ambito = id de la facultad o 'INSTITUCIONAL'.
-- Los eventos se reemplazan completos en cada guardado, por eso van como jsonb.
CREATE TABLE IF NOT EXISTS calendarios_academicos (
  periodo     text        NOT NULL,
  ambito      text        NOT NULL,
  facultad_id text        REFERENCES facultades (id),
  eventos     jsonb       NOT NULL DEFAULT '[]',
  updated_at  timestamptz NOT NULL,
  PRIMARY KEY (periodo, ambito),
  CHECK ((facultad_id IS NULL AND ambito = 'INSTITUCIONAL') OR (facultad_id IS NOT NULL AND ambito = facultad_id))
);
