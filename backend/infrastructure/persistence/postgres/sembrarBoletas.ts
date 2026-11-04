import { boletasPagoSemilla } from '../seedBoletasPago.js';
import type { PgPool } from './pool.js';

/**
 * Boletas de pago demo. Necesita que los usuarios demo ya estén sembrados.
 * Idempotente: no pisa una boleta que ya existe. NO debe correr en producción.
 */
export async function sembrarBoletasDemo(pool: PgPool): Promise<{ boletas: number }> {
  const semilla = boletasPagoSemilla();
  for (const b of semilla) {
    await pool.query(
      `INSERT INTO boletas_pago (id, docente_id, periodo, haber, descuentos, sincronizada_en)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       ON CONFLICT (id) DO NOTHING`,
      [b.id, b.docenteId, b.periodo, b.haber, JSON.stringify(b.descuentos), b.sincronizadaEn]
    );
  }
  return { boletas: semilla.length };
}
