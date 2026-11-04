/**
 * Prepara la base: aplica las migraciones, siembra el catálogo de trámites (backend/data/db.json) y,
 * fuera de producción, las facultades, usuarios y declaraciones juradas demo.
 * Uso: DATABASE_URL=postgres://... npm run db:setup --prefix backend   (es idempotente)
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from '../infrastructure/config/loadEnv.js';
import { migrar } from '../infrastructure/persistence/postgres/migrar.js';
import { crearPool } from '../infrastructure/persistence/postgres/pool.js';
import { sembrarBoletasDemo } from '../infrastructure/persistence/postgres/sembrarBoletas.js';
import { sembrarDeclaracionesDemo } from '../infrastructure/persistence/postgres/sembrarDeclaraciones.js';
import { sembrarTramites } from '../infrastructure/persistence/postgres/sembrarTramites.js';
import { sembrarUsuariosDemo } from '../infrastructure/persistence/postgres/sembrarUsuarios.js';

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
  // En producción no se siembran cuentas de ejemplo (clave conocida) salvo que se pida con SGAI_SEED_DEMO=true,
  // que es lo que hace el compose de la demo. Fuera de producción se siembran siempre.
  const sembrarDemo = process.env.NODE_ENV !== 'production' || process.env.SGAI_SEED_DEMO === 'true';
  if (!sembrarDemo) {
    console.info('Producción: no se siembran usuarios ni DJ demo (SGAI_SEED_DEMO=true los activa).');
  } else {
    if (process.env.NODE_ENV === 'production') console.warn('SGAI_SEED_DEMO=true en producción: se crean cuentas con clave conocida. Solo para demos.');
    const u = await sembrarUsuariosDemo(pool);
    console.info(`Usuarios demo sembrados: ${u.usuarios} usuarios en ${u.facultades} facultades.`);
    const d = await sembrarDeclaracionesDemo(pool);
    console.info(`Declaraciones juradas demo sembradas: ${d.declaraciones}.`);
    const b = await sembrarBoletasDemo(pool);
    console.info(`Boletas de pago demo sembradas: ${b.boletas}.`);
  }
} finally {
  await pool.end();
}
