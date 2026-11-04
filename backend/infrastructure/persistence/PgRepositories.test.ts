import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Intencion, type ConversacionEstado } from '../../domain/orquestador-atencion/types/Orquestador.js';
import { JsonTramiteRepository } from './JsonTramiteRepository.js';
import { PgConversacionRepository } from './PgConversacionRepository.js';
import { PgTramiteRepository } from './PgTramiteRepository.js';
import { migrar } from './postgres/migrar.js';
import { crearPool, type PgPool } from './postgres/pool.js';
import { sembrarTramites } from './postgres/sembrarTramites.js';

// Pruebas de integración: necesitan una base real. Sin TEST_DATABASE_URL se omiten.
//   docker compose -f compose.db.yaml up -d
//   TEST_DATABASE_URL=postgres://sgai:sgai@localhost:5432/sgai npm test ...
const url = process.env.TEST_DATABASE_URL;
const conBase = url ? describe : describe.skip;
const rutaDbJson = join(dirname(fileURLToPath(import.meta.url)), '../../data/db.json');

conBase('repositorios PostgreSQL', () => {
  let pool: PgPool;

  beforeAll(async () => {
    pool = crearPool(url!);
    await migrar(pool);
    await sembrarTramites(pool, rutaDbJson);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM conversaciones WHERE conversacion_id LIKE 'test-%'");
    await pool.end();
  });

  it('el catálogo de PostgreSQL es idéntico al de db.json, con el mismo orden', async () => {
    const pg = await PgTramiteRepository.cargar(pool);
    const json = new JsonTramiteRepository(rutaDbJson);
    expect(pg.listarDepartamentos()).toEqual(json.listarDepartamentos());
    expect(pg.listarTodos()).toEqual(json.listarTodos());
  });

  it('sembrar dos veces no duplica trámites', async () => {
    const antes = (await PgTramiteRepository.cargar(pool)).listarTodos().length;
    await sembrarTramites(pool, rutaDbJson);
    expect((await PgTramiteRepository.cargar(pool)).listarTodos()).toHaveLength(antes);
  });

  it('busca un trámite por código y devuelve undefined si no existe', async () => {
    const pg = await PgTramiteRepository.cargar(pool);
    expect(pg.buscarPorCodigo('DCA-01')?.departamento).toBe('Coordinación Académica');
    expect(pg.buscarPorCodigo('NO-EXISTE')).toBeUndefined();
  });

  describe('conversaciones', () => {
    const repo = () => new PgConversacionRepository(pool);
    const estado = (id: string): ConversacionEstado => {
      const ahora = new Date().toISOString();
      return {
        conversacionId: id,
        actorUserId: 'docente-1',
        docenteId: 'docente-1',
        historial: [{ mensaje: 'hola', intencion: Intencion.OTRO, nodo: 'pedir_aclaracion', respuesta: '¿en qué te ayudo?', timestamp: ahora }],
        estadoFlujo: 'ABIERTA',
        creadoEn: ahora,
        actualizadoEn: ahora,
      };
    };

    it('devuelve null si la conversación no existe', async () => {
      expect(await repo().obtener('test-no-existe')).toBeNull();
    });

    it('guarda y recupera el estado completo', async () => {
      const e = estado('test-ida-y-vuelta');
      await repo().guardar(e);
      expect(await repo().obtener(e.conversacionId)).toEqual(e);
    });

    it('guardar de nuevo actualiza la misma conversación', async () => {
      const e = estado('test-actualiza');
      await repo().guardar(e);
      await repo().guardar({ ...e, estadoFlujo: 'ESCALADA' });
      expect((await repo().obtener(e.conversacionId))?.estadoFlujo).toBe('ESCALADA');
      const { rows } = await pool.query('SELECT 1 FROM conversaciones WHERE conversacion_id = $1', [e.conversacionId]);
      expect(rows).toHaveLength(1);
    });

    it('omite docenteId cuando aún no se identificó', async () => {
      const { docenteId: _omitido, ...sinDocente } = estado('test-sin-docente');
      await repo().guardar(sinDocente);
      expect(await repo().obtener('test-sin-docente')).toEqual(sinDocente);
    });
  });
});
