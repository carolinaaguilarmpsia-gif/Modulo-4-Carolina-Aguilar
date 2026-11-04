import pg from 'pg';

const { Pool } = pg;
export type PgPool = pg.Pool;

/** Un solo pool por proceso; la URL viene de DATABASE_URL (12-factor: la config va en el entorno). */
export function crearPool(databaseUrl: string): PgPool {
  return new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, allowExitOnIdle: true });
}
