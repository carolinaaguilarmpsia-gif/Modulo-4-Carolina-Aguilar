-- Usuarios, perfil/CV del docente y rol institucional con su auditoría (antes en memoria).
-- Un docente no es una tabla aparte: es un usuario con rol DOCENTE.

CREATE TABLE IF NOT EXISTS facultades (
  id     text PRIMARY KEY,
  nombre text NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id                  text    PRIMARY KEY,
  email               text    NOT NULL UNIQUE,
  nombre_completo     text    NOT NULL,
  password_hash_local text    NOT NULL,
  rol                 text    NOT NULL CHECK (rol IN ('DOCENTE', 'ADMIN_FACULTAD', 'TECNICO_DPA', 'ADMIN_SISTEMA')),
  facultad_id         text    NOT NULL REFERENCES facultades (id),
  vinculacion_activa  boolean NOT NULL DEFAULT true,
  -- RB-07: bloqueo por intentos fallidos consecutivos.
  intentos_fallidos   integer NOT NULL DEFAULT 0 CHECK (intentos_fallidos >= 0),
  bloqueado_hasta     timestamptz
);

-- FSD-UC-006: las tres secciones del CV son listas libres (formación académica, publicaciones,
-- experiencia docente); se guardan como jsonb, igual que las valida la API.
CREATE TABLE IF NOT EXISTS perfiles_docente (
  docente_id          text  PRIMARY KEY REFERENCES usuarios (id),
  formacion_academica jsonb NOT NULL DEFAULT '[]',
  publicaciones       jsonb NOT NULL DEFAULT '[]',
  experiencia_docente jsonb NOT NULL DEFAULT '[]',
  updated_at          timestamptz
);

-- FSD-UC-009: a lo más un rol institucional vigente por docente.
CREATE TABLE IF NOT EXISTS roles_institucionales (
  docente_id text PRIMARY KEY REFERENCES usuarios (id),
  rol        text NOT NULL CHECK (rol IN ('AUTORIDAD', 'INVESTIGADOR', 'ADMINISTRATIVO'))
);

-- RB-06: cada cambio (asignar, cambiar o revocar) deja una fila, escrita en la misma transacción.
CREATE TABLE IF NOT EXISTS auditoria_roles_institucionales (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  docente_id   text        NOT NULL REFERENCES usuarios (id),
  rol_anterior text,
  rol_nuevo    text,
  actor_id     text        NOT NULL REFERENCES usuarios (id),
  ocurrido_en  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auditoria_roles_docente ON auditoria_roles_institucionales (docente_id, ocurrido_en);
