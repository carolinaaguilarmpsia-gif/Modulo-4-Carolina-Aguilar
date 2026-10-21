import express from 'express';
import request from 'supertest';
import { Rol } from '../domain/administracion/types/Rol.js';
import type { DeclaracionJurada } from '../domain/declaracion-jurada/entities/DeclaracionJurada.js';
import { DeclaracionJuradaService } from '../domain/declaracion-jurada/services/DeclaracionJuradaService.js';
import { EstadoDJ } from '../domain/declaracion-jurada/types/EstadoDJ.js';
import { JwtSigner } from '../infrastructure/auth/JwtSigner.js';
import { ConsoleNotificacionPublisher } from '../infrastructure/notifications/ConsoleNotificacionPublisher.js';
import { InMemoryDeclaracionJuradaRepository } from '../infrastructure/persistence/InMemoryDeclaracionJuradaRepository.js';
import { InMemoryUsuarioRepository } from '../infrastructure/persistence/InMemoryUsuarioRepository.js';
import { DjController } from './controllers/dj.controller.js';
import { globalErrorHandler } from './middleware/auth.middleware.js';
import { createDjRouter } from './routes/dj.routes.js';

/**
 * HTTP — GET /api/v1/declaraciones-juradas/estadisticas
 * Express propio + router real (no se importa app.ts, que carga .env y todo el grafo).
 * @see FSD-UC-002 · RB-05
 */
function dj(id: string, docenteId: string, facultadId: string, estado: EstadoDJ): DeclaracionJurada {
  const now = new Date();
  return {
    id,
    docenteId,
    facultadId,
    estado,
    docenteVinculacionActiva: true,
    tipo: 'ANUAL',
    periodoAcademico: '2026-1',
    camposFormulario: {},
    createdAt: now,
    updatedAt: now,
  };
}

describe('HTTP — GET /api/v1/declaraciones-juradas/estadisticas', () => {
  const jwtSigner = new JwtSigner('estadisticas-test-secret-no-usar-en-produccion');
  const URL = '/api/v1/declaraciones-juradas';
  let app: express.Express;

  beforeEach(() => {
    const repo = new InMemoryDeclaracionJuradaRepository([
      dj('1', 'docente-1', 'fac-a', EstadoDJ.BORRADOR),
      dj('2', 'docente-1', 'fac-a', EstadoDJ.APROBADA),
      dj('3', 'docente-2', 'fac-b', EstadoDJ.RECHAZADA),
    ]);
    const service = new DeclaracionJuradaService(repo, new ConsoleNotificacionPublisher());

    app = express();
    app.use(express.json());
    app.use(URL, createDjRouter(new DjController(service), jwtSigner, new InMemoryUsuarioRepository()));
    app.use(globalErrorHandler);
  });

  function token(rol: Rol, userId: string, facultadId: string): string {
    return jwtSigner.sign({ userId, email: 'x@universidad.edu.bo', rol, facultadId });
  }

  it('FR1/FR2: 200 con la forma { porEstado (6 estados), total, correlationId }', async () => {
    const res = await request(app)
      .get(`${URL}/estadisticas`)
      .set('Authorization', `Bearer ${token(Rol.TECNICO_DPA, 'dpa-demo-001', 'fac-a')}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(Object.keys(res.body.porEstado).sort()).toEqual(Object.values(EstadoDJ).sort());
    expect(res.body.porEstado[EstadoDJ.BORRADOR]).toBe(1);
    expect(res.body.porEstado[EstadoDJ.DEVUELTA]).toBe(0);
    expect(typeof res.body.correlationId).toBe('string');
  });

  it('FR1: /estadisticas no se confunde con /:id (no responde DJ_NOT_FOUND)', async () => {
    const res = await request(app)
      .get(`${URL}/estadisticas`)
      .set('Authorization', `Bearer ${token(Rol.DOCENTE, 'docente-1', 'fac-a')}`);

    expect(res.status).toBe(200);
    expect(res.body.error).toBeUndefined();
    expect(res.body.total).toBe(2);
  });

  it('FR1.1/NFR3: 401 TOKEN_INVALID sin Authorization', async () => {
    const res = await request(app).get(`${URL}/estadisticas`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('TOKEN_INVALID');
  });

  it('FR4.2: 403 INSUFFICIENT_ROLE si ADMIN_FACULTAD pide otra facultad', async () => {
    const res = await request(app)
      .get(`${URL}/estadisticas?facultadId=fac-b`)
      .set('Authorization', `Bearer ${token(Rol.ADMIN_FACULTAD, 'admin-fac-demo-001', 'fac-a')}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('INSUFFICIENT_ROLE');
  });

  it('FR3.3/FR4.1: TECNICO_DPA filtra por ?facultadId', async () => {
    const res = await request(app)
      .get(`${URL}/estadisticas?facultadId=fac-b`)
      .set('Authorization', `Bearer ${token(Rol.TECNICO_DPA, 'dpa-demo-001', 'fac-a')}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.porEstado[EstadoDJ.RECHAZADA]).toBe(1);
  });
});
