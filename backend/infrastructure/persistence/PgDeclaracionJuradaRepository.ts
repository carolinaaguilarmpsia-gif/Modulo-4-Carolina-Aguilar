import { randomUUID } from 'node:crypto';
import type { DeclaracionJurada } from '../../domain/declaracion-jurada/entities/DeclaracionJurada.js';
import type {
  HistorialDJRecord,
  IDeclaracionJuradaRepository,
  ListarDJResult,
} from '../../domain/declaracion-jurada/ports/out/IDeclaracionJuradaRepository.js';
import type { EstadoDJ } from '../../domain/declaracion-jurada/types/EstadoDJ.js';
import type { PgPool } from './postgres/pool.js';

interface FilaDJ {
  id: string;
  docente_id: string;
  facultad_id: string;
  estado: EstadoDJ;
  docente_vinculacion_activa: boolean;
  tipo: string;
  periodo_academico: string;
  campos_formulario: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

interface FilaHistorial {
  id: string;
  dj_id: string;
  actor_id: string;
  estado_anterior: EstadoDJ;
  estado_nuevo: EstadoDJ;
  observaciones: string | null;
  ocurrido_en: Date;
}

function aDJ(f: FilaDJ): DeclaracionJurada {
  return {
    id: f.id,
    docenteId: f.docente_id,
    facultadId: f.facultad_id,
    estado: f.estado,
    docenteVinculacionActiva: f.docente_vinculacion_activa,
    tipo: f.tipo,
    periodoAcademico: f.periodo_academico,
    camposFormulario: f.campos_formulario,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  };
}

function aHistorial(f: FilaHistorial): HistorialDJRecord {
  return {
    id: f.id,
    djId: f.dj_id,
    actorId: f.actor_id,
    estadoAnterior: f.estado_anterior,
    estadoNuevo: f.estado_nuevo,
    ...(f.observaciones !== null && { observaciones: f.observaciones }),
    timestamp: f.ocurrido_en,
  };
}

/**
 * Declaraciones juradas en PostgreSQL.
 * @see RB-06 — el cambio de estado y su fila de historial se escriben en una sola transacción.
 */
export class PgDeclaracionJuradaRepository implements IDeclaracionJuradaRepository {
  constructor(private readonly pool: PgPool) {}

  async create(dj: DeclaracionJurada): Promise<DeclaracionJurada> {
    const { rows } = await this.pool.query<FilaDJ>(
      `INSERT INTO declaraciones_juradas
         (id, docente_id, facultad_id, estado, docente_vinculacion_activa, tipo, periodo_academico, campos_formulario, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
       RETURNING *`,
      [dj.id, dj.docenteId, dj.facultadId, dj.estado, dj.docenteVinculacionActiva, dj.tipo, dj.periodoAcademico, JSON.stringify(dj.camposFormulario), dj.createdAt, dj.updatedAt]
    );
    return aDJ(rows[0]!);
  }

  async findById(djId: string): Promise<DeclaracionJurada | null> {
    const { rows } = await this.pool.query<FilaDJ>('SELECT * FROM declaraciones_juradas WHERE id = $1', [djId]);
    return rows[0] ? aDJ(rows[0]) : null;
  }

  async list(params: {
    estado?: EstadoDJ;
    docenteId?: string;
    facultadId?: string;
    page: number;
    pageSize: number;
  }): Promise<ListarDJResult> {
    const condiciones: string[] = [];
    const valores: unknown[] = [];
    // Los filtros son valores parametrizados; los nombres de columna son literales fijos de aquí.
    if (params.estado) { valores.push(params.estado); condiciones.push(`estado = $${valores.length}`); }
    if (params.docenteId) { valores.push(params.docenteId); condiciones.push(`docente_id = $${valores.length}`); }
    if (params.facultadId) { valores.push(params.facultadId); condiciones.push(`facultad_id = $${valores.length}`); }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const total = await this.pool.query<{ n: string }>(`SELECT count(*) AS n FROM declaraciones_juradas ${where}`, valores);
    const { rows } = await this.pool.query<FilaDJ>(
      `SELECT * FROM declaraciones_juradas ${where} ORDER BY updated_at DESC, id LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`,
      [...valores, params.pageSize, (params.page - 1) * params.pageSize]
    );
    return { items: rows.map(aDJ), total: Number(total.rows[0]!.n) };
  }

  async updateCampos(djId: string, camposFormulario: Record<string, unknown>): Promise<DeclaracionJurada> {
    const { rows } = await this.pool.query<FilaDJ>(
      'UPDATE declaraciones_juradas SET campos_formulario = $2::jsonb, updated_at = now() WHERE id = $1 RETURNING *',
      [djId, JSON.stringify(camposFormulario)]
    );
    if (!rows[0]) throw new Error('DJ_NOT_FOUND');
    return aDJ(rows[0]);
  }

  async transicionarAtomica(params: {
    djId: string;
    estadoNuevo: EstadoDJ;
    actorId: string;
    estadoAnterior: EstadoDJ;
    observaciones?: string;
  }): Promise<HistorialDJRecord> {
    const cliente = await this.pool.connect();
    try {
      await cliente.query('BEGIN');
      // FOR UPDATE: dos transiciones simultáneas sobre la misma DJ se ordenan; la segunda ve el estado ya cambiado.
      const actual = await cliente.query<{ estado: EstadoDJ }>('SELECT estado FROM declaraciones_juradas WHERE id = $1 FOR UPDATE', [params.djId]);
      if (!actual.rows[0]) throw new Error('DJ_NOT_FOUND');
      if (actual.rows[0].estado !== params.estadoAnterior) {
        throw new Error('PERSISTENCE_ERROR: estado concurrente modificado');
      }
      await cliente.query('UPDATE declaraciones_juradas SET estado = $2, updated_at = now() WHERE id = $1', [params.djId, params.estadoNuevo]);
      const { rows } = await cliente.query<FilaHistorial>(
        `INSERT INTO historial_dj (id, dj_id, actor_id, estado_anterior, estado_nuevo, observaciones, ocurrido_en)
         VALUES ($1, $2, $3, $4, $5, $6, now()) RETURNING *`,
        [randomUUID(), params.djId, params.actorId, params.estadoAnterior, params.estadoNuevo, params.observaciones ?? null]
      );
      await cliente.query('COMMIT');
      return aHistorial(rows[0]!);
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  async getHistorial(djId: string): Promise<HistorialDJRecord[]> {
    const { rows } = await this.pool.query<FilaHistorial>('SELECT * FROM historial_dj WHERE dj_id = $1 ORDER BY ocurrido_en, id', [djId]);
    return rows.map(aHistorial);
  }
}
