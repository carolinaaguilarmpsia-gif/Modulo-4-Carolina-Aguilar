import { describe, expect, it, jest } from '@jest/globals';
import { instalarApagadoLimpio } from './shutdown.js';

type CierreCb = (err?: Error) => void;

function servidorFalso(cerrar: (cb: CierreCb) => void) {
  return { close: jest.fn((cb?: CierreCb) => { cerrar(cb as CierreCb); return undefined as never; }) };
}

describe('instalarApagadoLimpio', () => {
  it('registra SIGTERM y SIGINT', () => {
    const registrar = jest.fn();
    instalarApagadoLimpio(servidorFalso((cb) => cb()), { registrar, salir: jest.fn() });

    expect(registrar).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    expect(registrar).toHaveBeenCalledWith('SIGINT', expect.any(Function));
  });

  it('al apagar cierra el servidor y sale con código 0', () => {
    const salir = jest.fn();
    const server = servidorFalso((cb) => cb());
    const apagar = instalarApagadoLimpio(server, { registrar: jest.fn(), salir });

    apagar();

    expect(server.close).toHaveBeenCalledTimes(1);
    expect(salir).toHaveBeenCalledWith(0);
  });

  it('si el cierre falla sale con código 1', () => {
    const salir = jest.fn();
    const apagar = instalarApagadoLimpio(servidorFalso((cb) => cb(new Error('fallo'))), {
      registrar: jest.fn(),
      salir,
    });

    apagar();

    expect(salir).toHaveBeenCalledWith(1);
  });

  it('una segunda señal no cierra dos veces', () => {
    const server = servidorFalso(() => undefined);
    const apagar = instalarApagadoLimpio(server, { registrar: jest.fn(), salir: jest.fn() });

    apagar();
    apagar();

    expect(server.close).toHaveBeenCalledTimes(1);
  });

  it('si el cierre no termina a tiempo fuerza la salida con código 1', () => {
    jest.useFakeTimers();
    const salir = jest.fn();
    const apagar = instalarApagadoLimpio(servidorFalso(() => undefined), {
      registrar: jest.fn(),
      salir,
      timeoutMs: 1000,
    });

    apagar();
    jest.advanceTimersByTime(1000);

    expect(salir).toHaveBeenCalledWith(1);
    jest.useRealTimers();
  });
});
