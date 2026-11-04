import { PgBoletaPagoRepository } from './PgBoletaPagoRepository.js';
import { InMemoryBoletaPagoRepository } from './InMemoryBoletaPagoRepository.js';
import { migrar } from './postgres/migrar.js';
import { crearPool, type PgPool } from './postgres/pool.js';
import { sembrarBoletasDemo } from './postgres/sembrarBoletas.js';
import { sembrarUsuariosDemo } from './postgres/sembrarUsuarios.js';
import { boletasPagoSemilla } from './seedBoletasPago.js';
import { DOCENTE_JUAN_JALDIN_ID } from './seedIds.js';

// Pruebas de integración: necesitan una base real. Sin TEST_DATABASE_URL se omiten.
const url = process.env.TEST_DATABASE_URL;
const conBase = url ? describe : describe.skip;

conBase('repositorio PostgreSQL de boletas de pago', () => {
  let pool: PgPool;
  const boletas = () => new PgBoletaPagoRepository(pool);

  beforeAll(async () => {
    pool = crearPool(url!);
    await migrar(pool);
    await sembrarUsuariosDemo(pool);
    await sembrarBoletasDemo(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('las boletas sembradas coinciden con las de la versión en memoria', async () => {
    const enMemoria = new InMemoryBoletaPagoRepository(boletasPagoSemilla());
    for (const docenteId of new Set(boletasPagoSemilla().map((b) => b.docenteId))) {
      expect(await boletas().listarPorDocente(docenteId)).toEqual(await enMemoria.listarPorDocente(docenteId));
    }
  });

  it('lista solo las del docente, la más reciente primero, con los decimales intactos', async () => {
    const lista = await boletas().listarPorDocente(DOCENTE_JUAN_JALDIN_ID);
    expect(lista.map((b) => b.periodo)).toEqual(['2026-10', '2026-09']);
    expect(lista.every((b) => b.docenteId === DOCENTE_JUAN_JALDIN_ID)).toBe(true);
    const quispe = await boletas().obtenerPorId('boleta-quispe-2026-10');
    expect(quispe?.haber).toBe(5400.5);
    expect(quispe?.descuentos[0]).toEqual({ concepto: 'Aporte AFP', monto: 540.05 });
  });

  it('devuelve null si la boleta no existe', async () => {
    expect(await boletas().obtenerPorId('no-existe')).toBeNull();
  });

  it('sembrar de nuevo no duplica ni pisa', async () => {
    await sembrarBoletasDemo(pool);
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM boletas_pago');
    expect(rows[0].n).toBe(boletasPagoSemilla().length);
  });

  it('rechaza una boleta de un docente que no existe, un período mal escrito o un haber negativo', async () => {
    const insertar = (id: string, docente: string, periodo: string, haber: number) =>
      pool.query(`INSERT INTO boletas_pago (id, docente_id, periodo, haber, sincronizada_en) VALUES ($1, $2, $3, $4, now())`, [id, docente, periodo, haber]);
    await expect(insertar('x1', 'fantasma', '2026-10', 100)).rejects.toThrow();
    await expect(insertar('x2', DOCENTE_JUAN_JALDIN_ID, '2026-13', 100)).rejects.toThrow();
    await expect(insertar('x3', DOCENTE_JUAN_JALDIN_ID, '2026-12', -1)).rejects.toThrow();
  });

  it('no admite dos boletas del mismo docente y período', async () => {
    await expect(
      pool.query(`INSERT INTO boletas_pago (id, docente_id, periodo, haber, sincronizada_en) VALUES ('dup', $1, '2026-10', 1, now())`, [DOCENTE_JUAN_JALDIN_ID])
    ).rejects.toThrow();
  });
});
