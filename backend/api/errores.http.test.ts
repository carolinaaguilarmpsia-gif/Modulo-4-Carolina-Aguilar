import type { Express } from 'express';
import request from 'supertest';
import { Rol } from '../domain/administracion/types/Rol.js';
import { JwtSigner } from '../infrastructure/auth/JwtSigner.js';

/**
 * Errores del cliente que Schemathesis encontró como 500 o como 200 (CI del contrato):
 * JSON inválido, ruta inexistente y `page` fuera de rango. Usa la app real, montada con su
 * propio wiring, con una clave de firma conocida para poder emitir un token.
 */
describe('HTTP — errores del cliente nunca son un 500', () => {
  const CLAVE = 'errores-http-test-clave-no-usar-en-produccion';
  let app: Express;
  let token: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = CLAVE;
    ({ app } = await import('./app.js'));
    token = new JwtSigner(CLAVE).sign({
      userId: 'admin-sys-demo-001',
      email: 'admin.sistema@universidad.edu.bo',
      rol: Rol.ADMIN_SISTEMA,
      facultadId: 'facultad-economicas',
    });
  });

  it('400 INVALID_JSON: un cuerpo que no es JSON, con correlationId', async () => {
    const res = await request(app).post('/api/v1/auth/login').set('Content-Type', 'application/json').send('{no es json');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: 'INVALID_JSON', correlationId: expect.any(String) });
    expect(res.body.correlationId).not.toBe('unknown');
  });

  it('404 NOT_FOUND en JSON (no la página HTML de Express) para una ruta inexistente', async () => {
    const res = await request(app).get('/api/v1/no-existe');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toMatchObject({ error: 'NOT_FOUND', correlationId: expect.any(String) });
  });

  it('422: GET /declaraciones-juradas?page=0 no se acepta', async () => {
    const res = await request(app).get('/api/v1/declaraciones-juradas?page=0').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('422: un estado que no existe en el filtro del listado', async () => {
    const res = await request(app).get('/api/v1/declaraciones-juradas?estado=INVENTADO').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(422);
  });

  it('422: el largo máximo se valida sobre lo que envía el cliente (espacios sobrantes no lo esquivan)', async () => {
    const pregunta = `${'a'.repeat(300)}  `;

    const res = await request(app).post('/api/v1/asistente-tramites/preguntar').send({ pregunta });

    expect(res.status).toBe(422);
  });

  it('200: una pregunta con espacios alrededor sigue siendo válida', async () => {
    const res = await request(app).post('/api/v1/asistente-tramites/preguntar').send({ pregunta: '  que requisitos necesito  ' });

    expect(res.status).toBe(200);
  });

  it('200: el listado sigue funcionando con page y estado válidos', async () => {
    const res = await request(app)
      .get('/api/v1/declaraciones-juradas?page=1&estado=BORRADOR')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });
});
