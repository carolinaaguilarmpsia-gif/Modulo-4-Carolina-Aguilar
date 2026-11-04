import { readFileSync } from 'node:fs';
import type { DepartamentoTramites } from '../../../domain/tramites-dpa/types/Tramite.js';
import type { PgPool } from './pool.js';

/**
 * Carga el catálogo inicial desde backend/data/db.json. Es idempotente (upsert por código):
 * db.json queda solo como semilla; la fuente de verdad en ejecución es PostgreSQL.
 */
export async function sembrarTramites(pool: PgPool, rutaSemilla: string): Promise<{ departamentos: number; tramites: number }> {
  const departamentos = JSON.parse(readFileSync(rutaSemilla, 'utf-8')) as DepartamentoTramites[];
  const cliente = await pool.connect();
  let total = 0;
  try {
    await cliente.query('BEGIN');
    for (const [i, dep] of departamentos.entries()) {
      const { rows } = await cliente.query<{ id: number }>(
        `INSERT INTO tramites_departamentos (nombre, orden) VALUES ($1, $2)
         ON CONFLICT (nombre) DO UPDATE SET orden = EXCLUDED.orden RETURNING id`,
        [dep.departamento, i]
      );
      for (const [j, t] of dep.tramites.entries()) {
        await cliente.query(
          `INSERT INTO tramites (codigo, departamento_id, nombre, descripcion, normativa, requisitos, requisitos_detallados, tiempo, orden)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9)
           ON CONFLICT (codigo) DO UPDATE SET departamento_id = EXCLUDED.departamento_id, nombre = EXCLUDED.nombre,
             descripcion = EXCLUDED.descripcion, normativa = EXCLUDED.normativa, requisitos = EXCLUDED.requisitos,
             requisitos_detallados = EXCLUDED.requisitos_detallados,
             tiempo = EXCLUDED.tiempo, orden = EXCLUDED.orden`,
          [t.codigo, rows[0].id, t.nombre, t.descripcion ?? null, t.normativa ?? null, JSON.stringify(t.requisitos),
            t.requisitos_detallados ? JSON.stringify(t.requisitos_detallados) : null, t.tiempo, j]
        );
        total++;
      }
    }
    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
  return { departamentos: departamentos.length, tramites: total };
}
