import { app } from './app.js';
import { instalarApagadoLimpio } from './shutdown.js';

// Default 3001, no 3000: en entornos de desarrollo locales es común tener otro servicio
// (p. ej. Docker) ya escuchando en :3000. Override con la variable de entorno PORT.
const PORT = Number(process.env.PORT ?? 3001);

const server = app.listen(PORT, () => {
  console.info(`SGAI API listening on http://localhost:${PORT}`);
  console.info('Demo auth: header X-SGAI-Demo-User: docente | admin_facultad | tecnico_dpa');
});

// SIGTERM/SIGINT: deja terminar las peticiones en curso y cierra el servidor (F12-06).
instalarApagadoLimpio(server);
