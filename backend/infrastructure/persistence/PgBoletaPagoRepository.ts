import type { IBoletaPagoRepository } from '../../domain/boletas-pago/ports/out/IBoletaPagoRepository.js';
import type { BoletaPago, DescuentoBoleta } from '../../domain/boletas-pago/types/BoletaPago.js';
import type { PgPool } from './postgres/pool.js';

interface FilaBoleta {
  id: string;
  docente_id: string;
  periodo: string;
  haber: string; // numeric llega como texto
  descuentos: DescuentoBoleta[];
  sincronizada_en: Date;
}

const COLUMNAS = 'id, docente_id, periodo, haber, descuentos, sincronizada_en';

function aBoleta(f: FilaBoleta): BoletaPago {
  return { id: f.id, docenteId: f.docente_id, periodo: f.periodo, haber: Number(f.haber), descuentos: f.descuentos, sincronizadaEn: f.sincronizada_en };
}

/** Boletas de pago en PostgreSQL (solo lectura: las escribe nómina, no la API). */
export class PgBoletaPagoRepository implements IBoletaPagoRepository {
  constructor(private readonly pool: PgPool) {}

  async listarPorDocente(docenteId: string): Promise<BoletaPago[]> {
    const { rows } = await this.pool.query<FilaBoleta>(
      `SELECT ${COLUMNAS} FROM boletas_pago WHERE docente_id = $1 ORDER BY periodo DESC`,
      [docenteId]
    );
    return rows.map(aBoleta);
  }

  async obtenerPorId(id: string): Promise<BoletaPago | null> {
    const { rows } = await this.pool.query<FilaBoleta>(`SELECT ${COLUMNAS} FROM boletas_pago WHERE id = $1`, [id]);
    return rows[0] ? aBoleta(rows[0]) : null;
  }
}
