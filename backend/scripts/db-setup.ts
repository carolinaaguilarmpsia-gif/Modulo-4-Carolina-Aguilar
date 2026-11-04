/**
 * Prepara la base: aplica las migraciones y siembra el catálogo de trámites desde backend/data/db.json.
 * Uso: DATABASE_URL=postgres://... npm run db:setup --prefix backend   (es idempotente)
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from '../infrastructure/config/loadEnv.js';
import { migrar } from '../infrastructure/persistence/postgres/migrar.js';
import { crearPool } from '../infrastructure/persistence/postgres/pool.js';
import { sembrarTramites } from '../infrastructure/persistence/postgres/sembrarTramites.js';

const dirBackend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadEnvFile(resolve(dirBackend, '.env'));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL (ver backend/.env.example).');
  process.exit(1);
}

const pool = crearPool(url);
try {
  const aplicadas = await migrar(pool);
  console.info(aplicadas.length ? `Migraciones aplicadas: ${aplicadas.join(', ')}` : 'Esquema al día.');
  const r = await sembrarTramites(pool, resolve(dirBackend, 'data/db.json'));
  console.info(`Catálogo sembrado: ${r.tramites} trámites en ${r.departamentos} departamentos.`);
} finally {
  await pool.end();
}
