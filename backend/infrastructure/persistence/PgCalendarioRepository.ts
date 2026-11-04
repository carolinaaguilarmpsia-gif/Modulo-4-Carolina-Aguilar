import type { ICalendarioRepository } from '../../domain/gestion-academica/ports/out/ICalendarioRepository.js';
import type { CalendarioAcademico, EventoCalendario } from '../../domain/gestion-academica/types/Calendario.js';
import type { PgPool } from './postgres/pool.js';

interface FilaCalendario {
  periodo: string;
  facultad_id: string | null;
  eventos: EventoCalendario[];
  updated_at: Date;
}

const AMBITO_INSTITUCIONAL = 'INSTITUCIONAL';

/** Calendario académico en PostgreSQL. `guardar` reemplaza el calendario completo (UPSERT por período y ámbito). */
export class PgCalendarioRepository implements ICalendarioRepository {
  constructor(private readonly pool: PgPool) {}

  async obtener(periodo: string, facultadId: string | null): Promise<CalendarioAcademico | null> {
    const { rows } = await this.pool.query<FilaCalendario>(
      'SELECT periodo, facultad_id, eventos, updated_at FROM calendarios_academicos WHERE periodo = $1 AND ambito = $2',
      [periodo, facultadId ?? AMBITO_INSTITUCIONAL]
    );
    const f = rows[0];
    if (!f) return null;
    return { periodo: f.periodo, facultadId: f.facultad_id, eventos: f.eventos, updatedAt: f.updated_at };
  }

  async guardar(calendario: CalendarioAcademico): Promise<void> {
    await this.pool.query(
      `INSERT INTO calendarios_academicos (periodo, ambito, facultad_id, eventos, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5)
       ON CONFLICT (periodo, ambito) DO UPDATE SET eventos = EXCLUDED.eventos, updated_at = EXCLUDED.updated_at`,
      [calendario.periodo, calendario.facultadId ?? AMBITO_INSTITUCIONAL, calendario.facultadId, JSON.stringify(calendario.eventos), calendario.updatedAt]
    );
  }
}
