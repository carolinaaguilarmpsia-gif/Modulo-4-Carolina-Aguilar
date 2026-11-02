import type { Server } from 'node:http';

/**
 * Apagado limpio: al recibir SIGTERM/SIGINT deja de aceptar conexiones nuevas, deja terminar
 * las peticiones en curso y sale con código 0. Si no termina a tiempo, fuerza la salida con 1.
 * @see docs/auditoria/12factor.md F12-06
 */
export function instalarApagadoLimpio(
  server: Pick<Server, 'close'>,
  opciones: {
    timeoutMs?: number;
    salir?: (codigo: number) => void;
    registrar?: (senal: NodeJS.Signals, manejador: () => void) => void;
  } = {}
): () => void {
  const timeoutMs = opciones.timeoutMs ?? 10_000;
  const salir = opciones.salir ?? ((codigo: number) => process.exit(codigo));
  const registrar = opciones.registrar ?? ((senal, manejador) => process.once(senal, manejador));

  let apagando = false;
  const apagar = (): void => {
    if (apagando) return;
    apagando = true;
    console.info('[SGAI] Señal de apagado recibida: cerrando el servidor…');

    const forzado = setTimeout(() => {
      console.error('[SGAI] El apagado excedió el tiempo límite; saliendo a la fuerza.');
      salir(1);
    }, timeoutMs);
    forzado.unref();

    server.close((err) => {
      clearTimeout(forzado);
      salir(err ? 1 : 0);
    });
  };

  registrar('SIGTERM', apagar);
  registrar('SIGINT', apagar);
  return apagar;
}
