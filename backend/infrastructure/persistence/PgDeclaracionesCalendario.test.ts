import { EstadoDJ } from '../../domain/declaracion-jurada/types/EstadoDJ.js';
import type { DeclaracionJurada } from '../../domain/declaracion-jurada/entities/DeclaracionJurada.js';
import type { CalendarioAcademico } from '../../domain/gestion-academica/types/Calendario.js';
import { InMemoryDeclaracionJuradaRepository } from './InMemoryDeclaracionJuradaRepository.js';
import { PgCalendarioRepository } from './PgCalendarioRepository.js';
import { PgDeclaracionJuradaRepository } from './PgDeclaracionJuradaRepository.js';
import { migrar } from './postgres/migrar.js';
import { crearPool, type PgPool } from './postgres/pool.js';
import { sembrarDeclaracionesDemo } from './postgres/sembrarDeclaraciones.js';
import { sembrarUsuariosDemo } from './postgres/sembrarUsuarios.js';
import { declaracionesJuradasSemilla } from './seedDeclaracionesJuradas.js';
import {
  DOCENTE_ANDREA_QUISPE_ID,
  DOCENTE_JUAN_JALDIN_ID,
  FACULTAD_ECONOMICAS_ID,
  FACULTAD_TECNOLOGIA_ID,
} from './seedIds.js';

// Pruebas de integración: necesitan una base real. Sin TEST_DATABASE_URL se omiten.
const url = process.env.TEST_DATABASE_URL;
const conBase = url ? describe : describe.skip;

const ID_PRUEBA = 'dj-prueba-integracion';

function djDePrueba(): DeclaracionJurada {
  const ahora = new Date();
  return {
    id: ID_PRUEBA,
    docenteId: DOCENTE_ANDREA_QUISPE_ID,
    facultadId: FACULTAD_ECONOMICAS_ID,
    estado: EstadoDJ.BORRADOR,
    docenteVinculacionActiva: true,
    tipo: 'LABORAL',
    periodoAcademico: '2026-II',
    camposFormulario: { dependencia: 'Económicas', declaracionVeracidad: true },
    createdAt: ahora,
    updatedAt: ahora,
  };
}

conBase('repositorios PostgreSQL de declaraciones juradas y calendario', () => {
  let pool: PgPool;
  const djs = () => new PgDeclaracionJuradaRepository(pool);
  const calendarios = () => new PgCalendarioRepository(pool);

  beforeAll(async () => {
    pool = crearPool(url!);
    await migrar(pool);
    await sembrarUsuariosDemo(pool);
    await sembrarDeclaracionesDemo(pool);
  });

  afterEach(async () => {
    await pool.query('DELETE FROM historial_dj WHERE dj_id = $1', [ID_PRUEBA]);
    await pool.query('DELETE FROM declaraciones_juradas WHERE id = $1', [ID_PRUEBA]);
    await pool.query("DELETE FROM calendarios_academicos WHERE periodo LIKE 'TEST-%'");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('declaraciones juradas', () => {
    it('las DJ sembradas coinciden con las de la versión en memoria', async () => {
      const enPg = (await djs().list({ page: 1, pageSize: 100 })).items.filter((d) => d.id !== ID_PRUEBA);
      const enMemoria = (await new InMemoryDeclaracionJuradaRepository(declaracionesJuradasSemilla()).list({ page: 1, pageSize: 100 })).items;
      const ordenar = (l: DeclaracionJurada[]) => [...l].sort((a, b) => a.id.localeCompare(b.id));
      // Las fechas de la semilla son relativas a "ahora": se comparan todo menos las marcas de tiempo.
      const sinFechas = (l: DeclaracionJurada[]) => ordenar(l).map(({ createdAt: _c, updatedAt: _u, ...resto }) => resto);
      expect(sinFechas(enPg)).toEqual(sinFechas(enMemoria));
    });

    it('sembrar de nuevo no duplica ni pisa el estado de una DJ que ya cambió', async () => {
      const antes = await djs().findById('dj-jaldin-2026-i');
      await sembrarDeclaracionesDemo(pool);
      expect(await djs().findById('dj-jaldin-2026-i')).toEqual(antes);
      expect((await djs().list({ page: 1, pageSize: 100 })).total).toBe(declaracionesJuradasSemilla().length);
    });

    it('crea una DJ y la encuentra por id; devuelve null si no existe', async () => {
      const creada = await djs().create(djDePrueba());
      expect(creada.camposFormulario).toEqual({ dependencia: 'Económicas', declaracionVeracidad: true });
      expect((await djs().findById(ID_PRUEBA))?.docenteId).toBe(DOCENTE_ANDREA_QUISPE_ID);
      expect(await djs().findById('no-existe')).toBeNull();
    });

    it('lista filtrando por estado, docente y facultad, y pagina con el total completo', async () => {
      const enRevisionEconomicas = await djs().list({ estado: EstadoDJ.EN_REVISION_FACULTAD, facultadId: FACULTAD_ECONOMICAS_ID, page: 1, pageSize: 100 });
      expect(enRevisionEconomicas.items.every((d) => d.estado === EstadoDJ.EN_REVISION_FACULTAD && d.facultadId === FACULTAD_ECONOMICAS_ID)).toBe(true);

      const deJuan = await djs().list({ docenteId: DOCENTE_JUAN_JALDIN_ID, page: 1, pageSize: 100 });
      expect(deJuan.items.map((d) => d.id)).toEqual(['dj-jaldin-2026-i']);

      const todas = await djs().list({ page: 1, pageSize: 100 });
      const pagina1 = await djs().list({ page: 1, pageSize: 2 });
      const pagina2 = await djs().list({ page: 2, pageSize: 2 });
      expect(pagina1.items).toHaveLength(2);
      expect(pagina1.total).toBe(todas.total);
      expect(pagina2.items.map((d) => d.id)).not.toContain(pagina1.items[0]!.id);
    });

    it('updateCampos reemplaza el formulario y actualiza la fecha; DJ inexistente lanza DJ_NOT_FOUND', async () => {
      await djs().create(djDePrueba());
      const antes = (await djs().findById(ID_PRUEBA))!;
      const nueva = await djs().updateCampos(ID_PRUEBA, { dependencia: 'Tecnología' });
      expect(nueva.camposFormulario).toEqual({ dependencia: 'Tecnología' });
      expect(nueva.updatedAt.getTime()).toBeGreaterThanOrEqual(antes.updatedAt.getTime());
      await expect(djs().updateCampos('no-existe', {})).rejects.toThrow('DJ_NOT_FOUND');
    });

    it('transicionarAtomica cambia el estado y deja el historial en el mismo paso (RB-06)', async () => {
      await djs().create(djDePrueba());
      const registro = await djs().transicionarAtomica({
        djId: ID_PRUEBA,
        estadoAnterior: EstadoDJ.BORRADOR,
        estadoNuevo: EstadoDJ.EN_REVISION_FACULTAD,
        actorId: DOCENTE_ANDREA_QUISPE_ID,
        observaciones: 'Enviada para revisión',
      });
      expect(registro).toMatchObject({ djId: ID_PRUEBA, estadoAnterior: EstadoDJ.BORRADOR, estadoNuevo: EstadoDJ.EN_REVISION_FACULTAD, observaciones: 'Enviada para revisión' });
      expect((await djs().findById(ID_PRUEBA))?.estado).toBe(EstadoDJ.EN_REVISION_FACULTAD);
      expect(await djs().getHistorial(ID_PRUEBA)).toHaveLength(1);
    });

    it('una transición con estado anterior desactualizado se rechaza y no deja rastro', async () => {
      await djs().create(djDePrueba());
      await expect(
        djs().transicionarAtomica({ djId: ID_PRUEBA, estadoAnterior: EstadoDJ.APROBADA, estadoNuevo: EstadoDJ.RECHAZADA, actorId: 'x' })
      ).rejects.toThrow('PERSISTENCE_ERROR');
      expect((await djs().findById(ID_PRUEBA))?.estado).toBe(EstadoDJ.BORRADOR);
      expect(await djs().getHistorial(ID_PRUEBA)).toHaveLength(0);
      await expect(
        djs().transicionarAtomica({ djId: 'no-existe', estadoAnterior: EstadoDJ.BORRADOR, estadoNuevo: EstadoDJ.EN_REVISION_FACULTAD, actorId: 'x' })
      ).rejects.toThrow('DJ_NOT_FOUND');
    });

    it('dos transiciones simultáneas sobre la misma DJ: solo una gana y el historial queda con una fila', async () => {
      await djs().create(djDePrueba());
      const intento = (actor: string) =>
        djs().transicionarAtomica({ djId: ID_PRUEBA, estadoAnterior: EstadoDJ.BORRADOR, estadoNuevo: EstadoDJ.EN_REVISION_FACULTAD, actorId: actor });
      const resultados = await Promise.allSettled([intento('a'), intento('b')]);
      expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(resultados.filter((r) => r.status === 'rejected')).toHaveLength(1);
      expect(await djs().getHistorial(ID_PRUEBA)).toHaveLength(1);
    });

    it('rechaza una DJ de un docente o facultad que no existen (clave foránea)', async () => {
      await expect(djs().create({ ...djDePrueba(), docenteId: 'fantasma' })).rejects.toThrow();
      await expect(djs().create({ ...djDePrueba(), facultadId: 'fantasma' })).rejects.toThrow();
    });
  });

  describe('calendario académico', () => {
    const calendario = (periodo: string, facultadId: string | null): CalendarioAcademico => ({
      periodo,
      facultadId,
      eventos: [{ tipo: 'INICIO_SEMESTRE', nombre: 'Inicio de clases', fechaInicio: '2026-08-03', fechaFin: '2026-08-03' }],
      updatedAt: new Date('2026-07-01T12:00:00Z'),
    });

    it('guarda y devuelve el calendario de una facultad con sus eventos y fecha', async () => {
      await calendarios().guardar(calendario('TEST-2026-II', FACULTAD_ECONOMICAS_ID));
      const leido = await calendarios().obtener('TEST-2026-II', FACULTAD_ECONOMICAS_ID);
      expect(leido).toEqual(calendario('TEST-2026-II', FACULTAD_ECONOMICAS_ID));
    });

    it('el calendario institucional (facultadId null) es distinto del de cada facultad', async () => {
      await calendarios().guardar(calendario('TEST-2026-II', null));
      expect((await calendarios().obtener('TEST-2026-II', null))?.facultadId).toBeNull();
      expect(await calendarios().obtener('TEST-2026-II', FACULTAD_ECONOMICAS_ID)).toBeNull();
    });

    it('guardar de nuevo reemplaza todos los eventos (UPSERT) y no duplica', async () => {
      await calendarios().guardar(calendario('TEST-2026-II', FACULTAD_TECNOLOGIA_ID));
      await calendarios().guardar({
        ...calendario('TEST-2026-II', FACULTAD_TECNOLOGIA_ID),
        eventos: [{ tipo: 'FERIADO', nombre: 'Feriado', fechaInicio: '2026-09-01', fechaFin: '2026-09-02' }],
      });
      expect((await calendarios().obtener('TEST-2026-II', FACULTAD_TECNOLOGIA_ID))?.eventos).toEqual([
        { tipo: 'FERIADO', nombre: 'Feriado', fechaInicio: '2026-09-01', fechaFin: '2026-09-02' },
      ]);
      const { rows } = await pool.query("SELECT count(*)::int AS n FROM calendarios_academicos WHERE periodo = 'TEST-2026-II'");
      expect(rows[0].n).toBe(1);
    });

    it('devuelve null si no hay calendario para ese período', async () => {
      expect(await calendarios().obtener('TEST-1999-I', null)).toBeNull();
    });
  });
});
