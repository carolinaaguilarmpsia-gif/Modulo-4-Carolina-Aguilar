-- FSD-UC-005 (UC-L-03): boletas de pago de cada docente, copiadas desde nómina.
-- RB-04: solo el docente titular las consulta; la API filtra por docente_id del JWT.
CREATE TABLE IF NOT EXISTS boletas_pago (
  id              text          PRIMARY KEY,
  docente_id      text          NOT NULL REFERENCES usuarios (id),
  periodo         text          NOT NULL CHECK (periodo ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  haber           numeric(12,2) NOT NULL CHECK (haber >= 0),
  -- [{ "concepto": "Aporte AFP", "monto": 620.00 }, ...]
  descuentos      jsonb         NOT NULL DEFAULT '[]',
  sincronizada_en timestamptz   NOT NULL,
  UNIQUE (docente_id, periodo)
);
CREATE INDEX IF NOT EXISTS idx_boletas_docente_periodo ON boletas_pago (docente_id, periodo DESC);
