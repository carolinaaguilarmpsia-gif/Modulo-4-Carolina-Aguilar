import express from 'express';
import request from 'supertest';
import { Rol } from '../domain/administracion/types/Rol.js';
import { AsignarRolInstitucionalService } from '../domain/gestion-docente/services/AsignarRolInstitucionalService.js';
import { GestionarPerfilDocenteService } from '../domain/gestion-docente/services/GestionarPerfilDocenteService.js';
import { GestionarCalendarioService } from '../domain/gestion-academica/services/GestionarCalendarioService.js';
import { JwtSigner } from '../infrastructure/auth/JwtSigner.js';
import { InMemoryUsuarioRepository } from '../infrastructure/persistence/InMemoryUsuarioRepository.js';
import { InMemoryRolInstitucionalRepository } from '../infrastructure/persistence/InMemoryRolInstitucionalRepository.js';
import { InMemoryPerfilDocenteRepository } from '../infrastructure/persistence/InMemoryPerfilDocenteRepository.js';
import { InMemoryCalendarioRepository } from '../infrastructure/persistence/InMemoryCalendarioRepository.js';
import {
  DOCENTE_ANDREA_QUISPE_ID,
  DOCENTE_JUAN_JALDIN_ID,
  FACULTAD_ECONOMICAS_ID,
  FACULTAD_TECNOLOGIA_ID,
} from '../infrastructure/persistence/seedIds.js';
import { AdminDocentesController } from './controllers/adminDocentes.controller.js';
import { PerfilDocenteController } from './controllers/perfilDocente.controller.js';
import { CalendarioController } from './controllers/calendario.controller.js';
import { createAdminDocentesRouter } from './routes/adminDocentes.routes.js';
import { createPerfilDocenteRouter } from './routes/perfilDocente.routes.js';
import { createCalendarioRouter } from './routes/calendario.routes.js';
import { globalErrorHandler } from './middleware/auth.middleware.js';

/**
 * HTTP — FSD-UC-009 (roles institucionales), FSD-UC-006 (perfil y CV), FSD-UC-008 (calendario).
 * Wiring real: Express, JwtSigner (HS256) y repositorios in-memory con los usuarios semilla reales.
 */
describe('HTTP — gestión docente y calendario académico', () => {
  const jwtSigner = new JwtSigner('http-test-clave-no-usar-en-produccion');
  let app: express.Express;
  let roles: InMemoryRolInstitucionalRepository;
  // Una sola vez: crear usuarios hashea con bcrypt cost 12 (lento) y los usuarios no cambian entre tests.
  let usuarios: InMemoryUsuarioRepository;

  const adminEconomicas = tokenDe('admin-fac-demo-001', Rol.ADMIN_FACULTAD, FACULTAD_ECONOMICAS_ID);
  const adminSistema = tokenDe('admin-sys-demo-001', Rol.ADMIN_SISTEMA, FACULTAD_ECONOMICAS_ID);
  const juan = tokenDe(DOCENTE_JUAN_JALDIN_ID, Rol.DOCENTE, FACULTAD_ECONOMICAS_ID);
  const andrea = tokenDe(DOCENTE_ANDREA_QUISPE_ID, Rol.DOCENTE, FACULTAD_TECNOLOGIA_ID);

  function tokenDe(userId: string, rol: Rol, facultadId: string): string {
    return jwtSigner.sign({ userId, email: `${userId}@universidad.edu.bo`, rol, facultadId });
  }
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(() => {
    usuarios = new InMemoryUsuarioRepository();
  });

  beforeEach(() => {
    roles = new InMemoryRolInstitucionalRepository();
    app = express();
    app.use(express.json());
    app.use(
      '/api/v1/admin/docentes',
      createAdminDocentesRouter(new AdminDocentesController(new AsignarRolInstitucionalService(usuarios, roles)), jwtSigner, usuarios)
    );
    app.use(
      '/api/v1/perfil-docente',
      createPerfilDocenteRouter(new PerfilDocenteController(new GestionarPerfilDocenteService(new InMemoryPerfilDocenteRepository())), jwtSigner, usuarios)
    );
    app.use(
      '/api/v1/calendario-academico',
      createCalendarioRouter(new CalendarioController(new GestionarCalendarioService(new InMemoryCalendarioRepository())), jwtSigner, usuarios)
    );
    app.use(globalErrorHandler);
  });

  describe('UC-009 · PATCH /admin/docentes/:id/rol-institucional', () => {
    const ruta = (id: string) => `/api/v1/admin/docentes/${id}/rol-institucional`;

    it('200: el Admin. Facultad asigna el rol a un docente de su facultad y queda auditado', async () => {
      const res = await request(app).patch(ruta(DOCENTE_JUAN_JALDIN_ID)).set(auth(adminEconomicas)).send({ rolInstitucional: 'INVESTIGADOR' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ docenteId: DOCENTE_JUAN_JALDIN_ID, rolNuevo: 'INVESTIGADOR', rolAnterior: null });
      expect(res.body.correlationId).toEqual(expect.any(String));
      expect(roles.registrosAuditoria()).toHaveLength(1);
      expect(roles.registrosAuditoria()[0]).toMatchObject({ actorId: 'admin-fac-demo-001', rolNuevo: 'INVESTIGADOR' });
    });

    it('403 CROSS_FACULTY_FORBIDDEN: un docente de otra facultad no se puede gestionar', async () => {
      const res = await request(app).patch(ruta(DOCENTE_ANDREA_QUISPE_ID)).set(auth(adminEconomicas)).send({ rolInstitucional: 'AUTORIDAD' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('CROSS_FACULTY_FORBIDDEN');
      expect(roles.registrosAuditoria()).toHaveLength(0);
    });

    it('200: el Admin. Sistema gestiona a un docente de cualquier facultad', async () => {
      const res = await request(app).patch(ruta(DOCENTE_ANDREA_QUISPE_ID)).set(auth(adminSistema)).send({ rolInstitucional: 'AUTORIDAD' });

      expect(res.status).toBe(200);
    });

    it('200: null revoca el rol institucional', async () => {
      await request(app).patch(ruta(DOCENTE_JUAN_JALDIN_ID)).set(auth(adminEconomicas)).send({ rolInstitucional: 'AUTORIDAD' });

      const res = await request(app).patch(ruta(DOCENTE_JUAN_JALDIN_ID)).set(auth(adminEconomicas)).send({ rolInstitucional: null });

      expect(res.body).toMatchObject({ rolAnterior: 'AUTORIDAD', rolNuevo: null });
    });

    it('422: un rol que no existe', async () => {
      const res = await request(app).patch(ruta(DOCENTE_JUAN_JALDIN_ID)).set(auth(adminEconomicas)).send({ rolInstitucional: 'REY' });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('401 sin token y 403 si el rol de acceso es DOCENTE', async () => {
      expect((await request(app).patch(ruta(DOCENTE_JUAN_JALDIN_ID)).send({ rolInstitucional: 'AUTORIDAD' })).status).toBe(401);
      const res = await request(app).patch(ruta(DOCENTE_JUAN_JALDIN_ID)).set(auth(juan)).send({ rolInstitucional: 'AUTORIDAD' });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('INSUFFICIENT_ROLE');
    });

    it('404: docente inexistente', async () => {
      const res = await request(app).patch(ruta('no-existe')).set(auth(adminEconomicas)).send({ rolInstitucional: 'AUTORIDAD' });

      expect(res.status).toBe(404);
    });
  });

  describe('UC-006 · /perfil-docente', () => {
    const formacion = { seccion: 'formacion_academica', data: [{ titulo: 'Msc. Informática', institucion: 'UMSS', anio: 2020 }] };

    it('PATCH 200: crea el perfil en el primer PATCH y GET lo devuelve', async () => {
      const patch = await request(app).patch('/api/v1/perfil-docente').set(auth(juan)).send(formacion);

      expect(patch.status).toBe(200);
      expect(patch.body.updatedAt).toEqual(expect.any(String));
      expect(patch.body.perfil.formacion_academica).toHaveLength(1);

      const get = await request(app).get('/api/v1/perfil-docente').set(auth(juan));
      expect(get.status).toBe(200);
      expect(get.body.perfil.docenteId).toBe(DOCENTE_JUAN_JALDIN_ID);
      expect(get.body.perfil.formacion_academica[0].titulo).toBe('Msc. Informática');
    });

    it('GET 200: un docente sin perfil recibe uno vacío', async () => {
      const res = await request(app).get('/api/v1/perfil-docente').set(auth(andrea));

      expect(res.status).toBe(200);
      expect(res.body.perfil).toMatchObject({ publicaciones: [], updatedAt: null });
    });

    it('PATCH 422: una sección con datos que no cumplen el esquema', async () => {
      const res = await request(app)
        .patch('/api/v1/perfil-docente')
        .set(auth(juan))
        .send({ seccion: 'formacion_academica', data: [{ titulo: 'X' }] });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('PATCH 422: una sección que no existe', async () => {
      const res = await request(app).patch('/api/v1/perfil-docente').set(auth(juan)).send({ seccion: 'hobbies', data: [] });

      expect(res.status).toBe(422);
    });

    it('PATCH /perfil-docente/:otroDocenteId → 403 FORBIDDEN_PROFILE_EDIT', async () => {
      const res = await request(app).patch(`/api/v1/perfil-docente/${DOCENTE_ANDREA_QUISPE_ID}`).set(auth(juan)).send(formacion);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN_PROFILE_EDIT');
    });

    it('PATCH /perfil-docente/:miId funciona para el titular', async () => {
      const res = await request(app).patch(`/api/v1/perfil-docente/${DOCENTE_JUAN_JALDIN_ID}`).set(auth(juan)).send(formacion);

      expect(res.status).toBe(200);
    });

    it('el Admin. Sistema lee el perfil de un docente pero no lo edita', async () => {
      await request(app).patch('/api/v1/perfil-docente').set(auth(juan)).send(formacion);

      const lectura = await request(app).get(`/api/v1/perfil-docente?docenteId=${DOCENTE_JUAN_JALDIN_ID}`).set(auth(adminSistema));
      const edicion = await request(app).patch('/api/v1/perfil-docente').set(auth(adminSistema)).send(formacion);

      expect(lectura.status).toBe(200);
      expect(lectura.body.perfil.formacion_academica).toHaveLength(1);
      expect(edicion.status).toBe(403);
    });

    it('GET 403 UNAUTHORIZED_DATA_ACCESS: un docente pide el perfil de otro', async () => {
      const res = await request(app).get(`/api/v1/perfil-docente?docenteId=${DOCENTE_ANDREA_QUISPE_ID}`).set(auth(juan));

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('UNAUTHORIZED_DATA_ACCESS');
    });

    it('401 sin token', async () => {
      expect((await request(app).get('/api/v1/perfil-docente')).status).toBe(401);
    });
  });

  describe('UC-008 · /calendario-academico', () => {
    const eventos = [
      { tipo: 'EXAMENES', nombre: 'Primer parcial', fechaInicio: '2026-04-20', fechaFin: '2026-04-24' },
      { tipo: 'INICIO_SEMESTRE', nombre: 'Inicio de clases', fechaInicio: '2026-03-02', fechaFin: '2026-03-02' },
    ];

    it('PUT 200 y GET: los docentes de la facultad ven los eventos ordenados por fecha de inicio', async () => {
      const put = await request(app).put('/api/v1/calendario-academico').set(auth(adminEconomicas)).send({ periodo: '2026-I', eventos });

      expect(put.status).toBe(200);
      expect(put.body.calendario).toMatchObject({ periodo: '2026-I', facultadId: FACULTAD_ECONOMICAS_ID });

      const get = await request(app).get('/api/v1/calendario-academico?periodo=2026-I').set(auth(juan));
      expect(get.status).toBe(200);
      expect(get.body.eventos.map((e: { nombre: string }) => e.nombre)).toEqual(['Inicio de clases', 'Primer parcial']);
    });

    it('los docentes de otra facultad no ven los eventos de la facultad ajena', async () => {
      await request(app).put('/api/v1/calendario-academico').set(auth(adminEconomicas)).send({ periodo: '2026-I', eventos });

      const get = await request(app).get('/api/v1/calendario-academico?periodo=2026-I').set(auth(andrea));

      expect(get.body.eventos).toEqual([]);
    });

    it('el calendario institucional (Admin. Sistema) lo ven todos, marcado como INSTITUCIONAL', async () => {
      await request(app).put('/api/v1/calendario-academico').set(auth(adminSistema)).send({ periodo: '2026-I', eventos: [eventos[1]] });

      const get = await request(app).get('/api/v1/calendario-academico?periodo=2026-I').set(auth(andrea));

      expect(get.body.eventos).toHaveLength(1);
      expect(get.body.eventos[0].ambito).toBe('INSTITUCIONAL');
    });

    it('PUT 403 CROSS_FACULTY_FORBIDDEN: publicar en otra facultad', async () => {
      const res = await request(app)
        .put('/api/v1/calendario-academico')
        .set(auth(adminEconomicas))
        .send({ periodo: '2026-I', facultadId: FACULTAD_TECNOLOGIA_ID, eventos });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('CROSS_FACULTY_FORBIDDEN');
    });

    it('PUT 422: fechas incoherentes', async () => {
      const res = await request(app)
        .put('/api/v1/calendario-academico')
        .set(auth(adminEconomicas))
        .send({ periodo: '2026-I', eventos: [{ ...eventos[0], fechaInicio: '2026-04-24', fechaFin: '2026-04-20' }] });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('GET 422 sin período y PUT 403 si el que publica es DOCENTE', async () => {
      expect((await request(app).get('/api/v1/calendario-academico').set(auth(juan))).status).toBe(422);
      const res = await request(app).put('/api/v1/calendario-academico').set(auth(juan)).send({ periodo: '2026-I', eventos });
      expect(res.status).toBe(403);
    });
  });
});
