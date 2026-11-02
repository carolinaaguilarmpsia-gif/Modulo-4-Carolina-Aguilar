import { describe, expect, it } from '@jest/globals';
import cors from 'cors';
import express from 'express';
import request from 'supertest';
import { CORS_ORIGINS_POR_DEFECTO, leerCorsOrigins } from './corsOrigins.js';

describe('leerCorsOrigins', () => {
  it('sin CORS_ORIGINS usa los orígenes de desarrollo', () => {
    expect(leerCorsOrigins({})).toEqual(CORS_ORIGINS_POR_DEFECTO);
    expect(leerCorsOrigins({ CORS_ORIGINS: ' , ' })).toEqual(CORS_ORIGINS_POR_DEFECTO);
  });

  it('parsea una lista separada por comas y recorta espacios', () => {
    expect(leerCorsOrigins({ CORS_ORIGINS: 'https://a.test, https://b.test' })).toEqual([
      'https://a.test',
      'https://b.test',
    ]);
  });

  it('un origen definido recibe encabezados CORS y uno no incluido, no', async () => {
    const app = express();
    app.use(cors({ origin: leerCorsOrigins({ CORS_ORIGINS: 'https://permitido.test' }) }));
    app.get('/ping', (_req, res) => res.json({ ok: true }));

    const permitido = await request(app).get('/ping').set('Origin', 'https://permitido.test');
    const ajeno = await request(app).get('/ping').set('Origin', 'https://ajeno.test');

    expect(permitido.headers['access-control-allow-origin']).toBe('https://permitido.test');
    expect(ajeno.headers['access-control-allow-origin']).toBeUndefined();
  });
});
