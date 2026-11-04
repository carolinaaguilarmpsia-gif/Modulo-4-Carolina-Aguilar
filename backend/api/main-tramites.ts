import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { loadEnvFile } from '../infrastructure/config/loadEnv.js';
import { crearPersistencia } from '../infrastructure/config/persistencia.js';
import { crearServicioTramites } from '../infrastructure/tramites/crearAsistenteTramites.js';
import { AsistenteTramitesEnProceso } from '../infrastructure/tramites/AsistenteTramitesEnProceso.js';
import { AsistenteTramitesController } from './controllers/asistenteTramites.controller.js';
import { correlationIdMiddleware, globalErrorHandler } from './middleware/auth.middleware.js';
import { createAsistenteTramitesRouter } from './routes/asistenteTramites.routes.js';
import { instalarApagadoLimpio } from './shutdown.js';

/**
 * Punto de entrada del módulo Trámites DPA como servicio extraído (E3, forma 2). Misma imagen que la
 * API, otro comando: `node --import tsx api/main-tramites.ts`. Es dueño del catálogo: lee la tabla
 * `tramites` y no arranca nada más del monolito (ni usuarios, ni conversaciones, ni JWT).
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnvFile(resolve(__dirname, '../.env'));

// Fuerza la forma "proceso" para este arranque: aquí el módulo SÍ lee su catálogo.
const env = { ...process.env, TRAMITES_MODO: 'proceso' };
const persistencia = await crearPersistencia(resolve(__dirname, '..'), env);
const servicio = crearServicioTramites(persistencia.tramites!, env);

const app = express();
app.use(correlationIdMiddleware);
app.use(express.json());
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'sgai-tramites' });
});
app.use('/api/v1/asistente-tramites', createAsistenteTramitesRouter(new AsistenteTramitesController(new AsistenteTramitesEnProceso(servicio))));
app.use(globalErrorHandler);

const PORT = Number(process.env.PORT ?? 3002);
const server = app.listen(PORT, () => console.info(`SGAI Trámites listening on http://localhost:${PORT} (${persistencia.motor})`));
instalarApagadoLimpio(server);
