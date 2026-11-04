import express from 'express';
import request from 'supertest';
import { Rol } from '../domain/administracion/types/Rol.js';
import { ConsultarBoletasService } from '../domain/boletas-pago/services/ConsultarBoletasService.js';
import { JwtSigner } from '../infrastructure/auth/JwtSigner.js';
import { InMemoryBoletaPagoRepository } from '../infrastructure/persistence/InMemoryBoletaPagoRepository.js';
import { InMemoryUsuarioRepository } from '../infrastructure/persistence/InMemoryUsuarioRepository.js';
import { boletasPagoSemilla } from '../infrastructure/persistence/seedBoletasPago.js';
import { DOCENTE_ANDREA_QUISPE_ID, DOCENTE_JUAN_JALDIN_ID, FACULTAD_ECONOMICAS_ID, FACULTAD_TECNOLOGIA_ID } from '../infrastructure/persistence/seedIds.js';
import { BoletaPagoController } from './controllers/boletaPago.controller.js';
import { globalErrorHandler } from './middleware/auth.middleware.js';
import { createBoletaPagoRouter } from './routes/boletaPago.routes.js';

/** HTTP — FSD-UC-005 (boletas de pago): Express, JwtSigner real y los usuarios semilla reales. */
describe('HTTP — boletas de pago', () => {
  const jwtSigner = new JwtSigner('http-test-clave-no-usar-en-produccion');
  let app: express.Express;
  let usuarios: InMemoryUsuarioRepository;

  const token = (userId: string, rol: Rol, facultadId: string) =>
    jwtSigner.sign({ userId, email: `${userId}@universidad.edu.bo`, rol, facultadId });
  const juan = token(DOCENTE_JUAN_JALDIN_ID, Rol.DOCENTE, FACULTAD_ECONOMICAS_ID);
  const andrea = token(DOCENTE_ANDREA_QUISPE_ID, Rol.DOCENTE, FACULTAD_TECNOLOGIA_ID);
  const adminSistema = token('admin-sys-demo-001', Rol.ADMIN_SISTEMA, FACULTAD_ECONOMICAS_ID);
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  beforeAll(() => {
    usuarios = new InMemoryUsuarioRepository(); // hashea con bcrypt: una sola vez
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(
      '/api/v1/boletas-pago',
      createBoletaPagoRouter(
        new BoletaPagoController(new ConsultarBoletasService(new InMemoryBoletaPagoRepository(boletasPagoSemilla()))),
        jwtSigner,
        usuarios
      )
    );
    app.use(globalErrorHandler);
  });

  it('GET /boletas-pago sin token responde 401', async () => {
    await request(app).get('/api/v1/boletas-pago').expect(401);
  });

  it('el docente lista solo sus boletas, la más reciente primero', async () => {
    const res = await request(app).get('/api/v1/boletas-pago').set(auth(juan)).expect(200);
    expect(res.body.boletas.map((b: { id: string }) => b.id)).toEqual(['boleta-jaldin-2026-10', 'boleta-jaldin-2026-09']);
    expect(res.body.boletas[0]).toMatchObject({ periodo: '2026-10', haber: 6200, totalDescuentos: 930, neto: 5270 });
    expect(res.body.correlationId).toBeDefined();
  });

  it('el filtro ?periodo=AAAA-MM devuelve solo la boleta de ese mes', async () => {
    const res = await request(app).get('/api/v1/boletas-pago?periodo=2026-09').set(auth(juan)).expect(200);
    expect(res.body.boletas.map((b: { id: string }) => b.id)).toEqual(['boleta-jaldin-2026-09']);
    const vacio = await request(app).get('/api/v1/boletas-pago?periodo=2020-01').set(auth(juan)).expect(200);
    expect(vacio.body.boletas).toEqual([]);
  });

  it('un período mal escrito responde 422', async () => {
    await request(app).get('/api/v1/boletas-pago?periodo=2026-13').set(auth(juan)).expect(422);
    await request(app).get('/api/v1/boletas-pago?periodo=octubre').set(auth(juan)).expect(422);
  });

  it('el detalle trae haber, descuentos, neto y la fecha de sincronización', async () => {
    const res = await request(app).get('/api/v1/boletas-pago/boleta-jaldin-2026-10').set(auth(juan)).expect(200);
    expect(res.body.boleta).toMatchObject({ id: 'boleta-jaldin-2026-10', haber: 6200, neto: 5270 });
    expect(res.body.boleta.descuentos).toEqual([
      { concepto: 'Aporte AFP', monto: 620 },
      { concepto: 'Impuesto RC-IVA', monto: 310 },
    ]);
    expect(res.body.boleta.sincronizadaEn).toBe('2026-11-01T06:00:00.000Z');
  });

  it('RB-04: pedir la boleta de otro docente responde 403 y no filtra datos', async () => {
    const res = await request(app).get('/api/v1/boletas-pago/boleta-quispe-2026-10').set(auth(juan)).expect(403);
    expect(res.body.error).toBe('UNAUTHORIZED_DATA_ACCESS');
    expect(JSON.stringify(res.body)).not.toContain('5400');
    await request(app).get('/api/v1/boletas-pago/boleta-quispe-2026-10').set(auth(andrea)).expect(200);
  });

  it('una boleta inexistente responde 404 BOLETA_NOT_FOUND', async () => {
    const res = await request(app).get('/api/v1/boletas-pago/no-existe').set(auth(juan)).expect(404);
    expect(res.body.error).toBe('BOLETA_NOT_FOUND');
  });

  it('un rol que no es docente recibe 403 INSUFFICIENT_ROLE', async () => {
    const res = await request(app).get('/api/v1/boletas-pago').set(auth(adminSistema)).expect(403);
    expect(res.body.error).toBe('INSUFFICIENT_ROLE');
  });
});
