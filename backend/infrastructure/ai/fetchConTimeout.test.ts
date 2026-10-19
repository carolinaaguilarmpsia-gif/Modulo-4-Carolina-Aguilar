import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fetchConTimeout, llmTimeoutMs, LLM_TIMEOUT_MS_POR_DEFECTO } from './fetchConTimeout.js';

const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

describe('fetchConTimeout', () => {
  it('un proveedor que no responde falla con LLM_TIMEOUT en un tiempo acotado', async () => {
    // Doble de red: nunca responde, solo reacciona a la señal de cancelación.
    globalThis.fetch = jest.fn((_url: unknown, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
      })
    ) as unknown as typeof fetch;

    const inicio = Date.now();
    await expect(fetchConTimeout('http://proveedor.test', {}, 50)).rejects.toThrow('LLM_TIMEOUT');
    expect(Date.now() - inicio).toBeLessThan(2000);
  });

  it('una respuesta a tiempo se devuelve sin cambios', async () => {
    const respuesta = new Response('ok', { status: 200 });
    globalThis.fetch = jest.fn(async () => respuesta) as unknown as typeof fetch;

    await expect(fetchConTimeout('http://proveedor.test', {}, 1000)).resolves.toBe(respuesta);
  });

  it('un error de red que no es timeout se propaga tal cual', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new Error('ECONNREFUSED');
    }) as unknown as typeof fetch;

    await expect(fetchConTimeout('http://proveedor.test', {}, 1000)).rejects.toThrow('ECONNREFUSED');
  });
});

describe('llmTimeoutMs', () => {
  it('usa LLM_TIMEOUT_MS cuando es válido', () => {
    expect(llmTimeoutMs({ LLM_TIMEOUT_MS: '5000' })).toBe(5000);
  });

  it('cae al valor por defecto si falta o es inválido', () => {
    expect(llmTimeoutMs({})).toBe(LLM_TIMEOUT_MS_POR_DEFECTO);
    expect(llmTimeoutMs({ LLM_TIMEOUT_MS: 'abc' })).toBe(LLM_TIMEOUT_MS_POR_DEFECTO);
    expect(llmTimeoutMs({ LLM_TIMEOUT_MS: '-1' })).toBe(LLM_TIMEOUT_MS_POR_DEFECTO);
  });
});
