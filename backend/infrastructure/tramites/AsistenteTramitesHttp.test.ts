import { describe, expect, it, jest } from '@jest/globals';
import { TramitesNoDisponibleError } from '../../domain/tramites-dpa/ports/in/IAsistenteTramites.js';
import { AsistenteTramitesHttp } from './AsistenteTramitesHttp.js';

const OK = { respuesta: 'ok', camino: 'keyword', herramienta: null, fuente: null, iaHabilitada: false, fuenteDatos: 'db.json' };
const json = (status: number, cuerpo: unknown = OK) => new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json' } });

function cliente(respuestas: Array<() => Promise<Response>>, extra: Record<string, number> = {}) {
  const fetchFn = jest.fn(async () => respuestas.shift()!());
  const dormir = jest.fn(async () => undefined);
  let t = 0;
  const c = new AsistenteTramitesHttp(
    { baseUrl: 'http://x', timeoutMs: 50, reintentos: 1, umbralCircuito: 2, aperturaMs: 1000, ...extra },
    { fetch: fetchFn as unknown as typeof fetch, dormir, aleatorio: () => 0.5, ahora: () => t }
  );
  return { c, fetchFn, dormir, avanzar: (ms: number) => (t += ms) };
}

describe('AsistenteTramitesHttp', () => {
  it('devuelve la respuesta del módulo', async () => {
    const { c } = cliente([async () => json(200)]);
    await expect(c.preguntar('requisitos')).resolves.toMatchObject({ respuesta: 'ok' });
  });

  it('reintenta una vez con espera con jitter ante un 5xx y se recupera', async () => {
    const { c, fetchFn, dormir } = cliente([async () => json(503, {}), async () => json(200)]);
    await expect(c.preguntar('requisitos')).resolves.toMatchObject({ respuesta: 'ok' });
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(dormir).toHaveBeenCalledWith(25); // 0.5 * 50 * 2^0
  });

  it('no reintenta un 4xx: la petición era mala, no el módulo', async () => {
    const { c, fetchFn } = cliente([async () => json(400, {})]);
    await expect(c.preguntar('x')).rejects.toMatchObject({ motivo: 'rechazada' });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('corta por plazo cuando el módulo está colgado', async () => {
    const colgado = (init: RequestInit) => new Promise<Response>((_, rej) => init.signal!.addEventListener('abort', () => rej(init.signal!.reason)));
    const fetchFn = jest.fn(async (_u: unknown, init?: RequestInit) => colgado(init!));
    const c = new AsistenteTramitesHttp({ baseUrl: 'http://x', timeoutMs: 20, reintentos: 0 }, { fetch: fetchFn as unknown as typeof fetch });
    await expect(c.preguntar('requisitos')).rejects.toMatchObject({ motivo: 'timeout' });
  });

  it('abre el circuito tras fallas seguidas, falla rápido y se prueba de nuevo al vencer', async () => {
    const caer = async () => json(503, {});
    const { c, fetchFn, avanzar } = cliente([caer, caer, caer, caer, async () => json(200)]);
    await expect(c.preguntar('a')).rejects.toBeInstanceOf(TramitesNoDisponibleError); // 2 intentos
    await expect(c.preguntar('a')).rejects.toBeInstanceOf(TramitesNoDisponibleError); // 2 intentos: umbral 2
    const llamadas = fetchFn.mock.calls.length;
    await expect(c.preguntar('a')).rejects.toMatchObject({ motivo: 'circuito-abierto' });
    expect(fetchFn.mock.calls.length).toBe(llamadas); // no llamó a la red
    avanzar(1001);
    await expect(c.preguntar('a')).resolves.toMatchObject({ respuesta: 'ok' });
  });
});
