import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PgPool } from './pool.js';

const dirMigraciones = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

/** Aplica en orden los .sql de migrations/ que aún no están en schema_migrations. Devuelve los aplicados. */
export async function migrar(pool: PgPool): Promise<string[]> {
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (nombre text PRIMARY KEY, aplicada_en timestamptz NOT NULL DEFAULT now())');
  const hechas = new Set((await pool.query<{ nombre: string }>('SELECT nombre FROM schema_migrations')).rows.map((r) => r.nombre));
  const aplicadas: string[] = [];
  for (const archivo of readdirSync(dirMigraciones).filter((f) => f.endsWith('.sql')).sort()) {
    if (hechas.has(archivo)) continue;
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query(readFileSync(join(dirMigraciones, archivo), 'utf-8'));
      await cliente.query('INSERT INTO schema_migrations (nombre) VALUES ($1)', [archivo]);
      await cliente.query('COMMIT');
      aplicadas.push(archivo);
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }
  return aplicadas;
}
