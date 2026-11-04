import { Rol } from '../../domain/administracion/types/Rol.js';
import { RolInstitucional } from '../../domain/gestion-docente/types/RolInstitucional.js';
import { InMemoryUsuarioRepository } from './InMemoryUsuarioRepository.js';
import { PgPerfilDocenteRepository } from './PgPerfilDocenteRepository.js';
import { PgRolInstitucionalRepository } from './PgRolInstitucionalRepository.js';
import { PgUsuarioRepository } from './PgUsuarioRepository.js';
import { migrar } from './postgres/migrar.js';
import { crearPool, type PgPool } from './postgres/pool.js';
import { sembrarUsuariosDemo } from './postgres/sembrarUsuarios.js';
import { DOCENTE_ANDREA_QUISPE_ID, DOCENTE_DEMO_ID, DOCENTE_MARIA_ROJAS_ID } from './seedIds.js';

// Pruebas de integración: necesitan una base real. Sin TEST_DATABASE_URL se omiten.
const url = process.env.TEST_DATABASE_URL;
const conBase = url ? describe : describe.skip;

conBase('repositorios PostgreSQL de usuarios, perfil y roles institucionales', () => {
  let pool: PgPool;
  const usuarios = () => new PgUsuarioRepository(pool);

  beforeAll(async () => {
    pool = crearPool(url!);
    await migrar(pool);
    await sembrarUsuariosDemo(pool);
  });

  afterEach(async () => {
    await pool.query('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL');
  });

  afterAll(async () => {
    await pool.query('DELETE FROM auditoria_roles_institucionales');
    await pool.query('DELETE FROM roles_institucionales');
    await pool.query('DELETE FROM perfiles_docente');
    await pool.end();
  });

  describe('usuarios', () => {
    it('los usuarios sembrados coinciden con los de la versión en memoria (salvo el hash, que lleva sal aleatoria)', async () => {
      const sinHash = (lista: { id: string; passwordHashLocal: string }[]) =>
        lista.map(({ passwordHashLocal: _h, ...resto }) => resto).sort((a, b) => a.id.localeCompare(b.id));
      expect(sinHash(await usuarios().listar())).toEqual(sinHash(await new InMemoryUsuarioRepository().listar()));
    });

    it('busca por correo y devuelve null si no existe', async () => {
      expect((await usuarios().findByEmail('docente@universidad.edu.bo'))?.rol).toBe(Rol.DOCENTE);
      expect(await usuarios().findByEmail('nadie@universidad.edu.bo')).toBeNull();
    });

    it('sembrar de nuevo no duplica usuarios ni cambia la clave guardada', async () => {
      const antes = await usuarios().findByEmail('docente@universidad.edu.bo');
      await sembrarUsuariosDemo(pool);
      const despues = await usuarios().findByEmail('docente@universidad.edu.bo');
      expect(await usuarios().listar()).toHaveLength(10);
      expect(despues?.passwordHashLocal).toBe(antes?.passwordHashLocal);
    });

    it('guarda el bloqueo por intentos fallidos y lo limpia en un login exitoso (RB-07)', async () => {
      const hasta = new Date(Date.now() + 15 * 60_000);
      await usuarios().registrarIntentoFallido(DOCENTE_DEMO_ID, { intentosFallidos: 5, bloqueadoHasta: hasta });
      const bloqueado = await usuarios().findByEmail('docente@universidad.edu.bo');
      expect(bloqueado?.intentosFallidos).toBe(5);
      expect(bloqueado?.bloqueadoHasta?.getTime()).toBe(hasta.getTime());

      await usuarios().registrarLoginExitoso(DOCENTE_DEMO_ID);
      const libre = await usuarios().findByEmail('docente@universidad.edu.bo');
      expect(libre).toMatchObject({ intentosFallidos: 0, bloqueadoHasta: null });
    });
  });

  describe('perfil docente (formación académica, publicaciones, experiencia)', () => {
    const perfiles = () => new PgPerfilDocenteRepository(pool);
    const ahora = new Date('2026-10-26T12:00:00.000Z');

    it('devuelve null mientras el perfil no se haya editado', async () => {
      expect(await perfiles().obtener(DOCENTE_ANDREA_QUISPE_ID)).toBeNull();
    });

    it('crea el perfil en la primera edición y deja las otras secciones vacías', async () => {
      const formacion = [{ titulo: 'Licenciatura en Informática', institucion: 'UMSA', anio: 2012 }];
      const creado = await perfiles().upsertSeccion(DOCENTE_ANDREA_QUISPE_ID, 'formacion_academica', formacion, ahora);
      expect(creado).toEqual({
        docenteId: DOCENTE_ANDREA_QUISPE_ID,
        formacion_academica: formacion,
        publicaciones: [],
        experiencia_docente: [],
        updatedAt: ahora,
      });
      expect(await perfiles().obtener(DOCENTE_ANDREA_QUISPE_ID)).toEqual(creado);
    });

    it('editar una sección no toca las demás', async () => {
      const formacion = [{ titulo: 'Maestría' }];
      await perfiles().upsertSeccion(DOCENTE_MARIA_ROJAS_ID, 'formacion_academica', formacion, ahora);
      const r = await perfiles().upsertSeccion(DOCENTE_MARIA_ROJAS_ID, 'publicaciones', [{ titulo: 'Artículo' }], ahora);
      expect(r.formacion_academica).toEqual(formacion);
      expect(r.publicaciones).toEqual([{ titulo: 'Artículo' }]);
    });

    it('rechaza un nombre de sección que no es del CV', async () => {
      await expect(perfiles().upsertSeccion(DOCENTE_DEMO_ID, 'updated_at; DROP TABLE usuarios' as never, [], ahora)).rejects.toThrow(/Sección de perfil desconocida/);
    });
  });

  describe('roles institucionales', () => {
    const roles = () => new PgRolInstitucionalRepository(pool);
    const t = new Date('2026-10-26T13:00:00.000Z');
    const auditoria = async (docenteId: string) =>
      (await pool.query('SELECT rol_anterior, rol_nuevo, actor_id FROM auditoria_roles_institucionales WHERE docente_id = $1 ORDER BY id', [docenteId])).rows;

    it('asigna, cambia y revoca, y cada cambio queda auditado con el rol anterior', async () => {
      const id = DOCENTE_MARIA_ROJAS_ID;
      expect(await roles().obtener(id)).toBeNull();

      expect(await roles().asignar({ docenteId: id, rolNuevo: RolInstitucional.INVESTIGADOR, actorId: 'admin-fac-demo-001', timestamp: t })).toEqual({ rolAnterior: null });
      expect(await roles().asignar({ docenteId: id, rolNuevo: RolInstitucional.AUTORIDAD, actorId: 'admin-fac-demo-001', timestamp: t })).toEqual({ rolAnterior: RolInstitucional.INVESTIGADOR });
      expect(await roles().obtener(id)).toBe(RolInstitucional.AUTORIDAD);

      expect(await roles().asignar({ docenteId: id, rolNuevo: null, actorId: 'admin-fac-demo-001', timestamp: t })).toEqual({ rolAnterior: RolInstitucional.AUTORIDAD });
      expect(await roles().obtener(id)).toBeNull();

      expect(await auditoria(id)).toEqual([
        { rol_anterior: null, rol_nuevo: 'INVESTIGADOR', actor_id: 'admin-fac-demo-001' },
        { rol_anterior: 'INVESTIGADOR', rol_nuevo: 'AUTORIDAD', actor_id: 'admin-fac-demo-001' },
        { rol_anterior: 'AUTORIDAD', rol_nuevo: null, actor_id: 'admin-fac-demo-001' },
      ]);
    });

    it('si falla la auditoría, el cambio de rol se deshace (RB-06)', async () => {
      const id = DOCENTE_ANDREA_QUISPE_ID;
      await expect(roles().asignar({ docenteId: id, rolNuevo: RolInstitucional.ADMINISTRATIVO, actorId: 'actor-que-no-existe', timestamp: t })).rejects.toThrow();
      expect(await roles().obtener(id)).toBeNull();
      expect(await auditoria(id)).toHaveLength(0);
    });

    it('dos asignaciones simultáneas al mismo docente se serializan: la auditoría encadena roles anterior y nuevo', async () => {
      const id = DOCENTE_DEMO_ID;
      await Promise.all([
        roles().asignar({ docenteId: id, rolNuevo: RolInstitucional.AUTORIDAD, actorId: 'admin-fac-demo-001', timestamp: t }),
        roles().asignar({ docenteId: id, rolNuevo: RolInstitucional.INVESTIGADOR, actorId: 'admin-fac-demo-001', timestamp: t }),
      ]);
      const filas = await auditoria(id);
      expect(filas).toHaveLength(2);
      expect(filas[0].rol_anterior).toBeNull();
      expect(filas[1].rol_anterior).toBe(filas[0].rol_nuevo);
      expect(await roles().obtener(id)).toBe(filas[1].rol_nuevo);
    });
  });
});
