import { declaracionesJuradasSemilla } from '../seedDeclaracionesJuradas.js';
import type { PgPool } from './pool.js';

/**
 * Declaraciones juradas demo. Necesita que los usuarios y facultades demo ya estén sembrados.
 * Es idempotente y NO pisa una DJ que ya existe (podría haber cambiado de estado desde la API).
 * NO debe correr en producción.
 */
export async function sembrarDeclaracionesDemo(pool: PgPool): Promise<{ declaraciones: number }> {
  const semilla = declaracionesJuradasSemilla();
  for (const dj of semilla) {
    await pool.query(
      `INSERT INTO declaraciones_juradas
         (id, docente_id, facultad_id, estado, docente_vinculacion_activa, tipo, periodo_academico, campos_formulario, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [dj.id, dj.docenteId, dj.facultadId, dj.estado, dj.docenteVinculacionActiva, dj.tipo, dj.periodoAcademico, JSON.stringify(dj.camposFormulario), dj.createdAt, dj.updatedAt]
    );
  }
  return { declaraciones: semilla.length };
}
