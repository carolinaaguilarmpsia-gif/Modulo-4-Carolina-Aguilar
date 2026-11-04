import type { IConversacionRepository } from '../../domain/orquestador-atencion/ports/out/IConversacionRepository.js';
import type { ConversacionEstado, EstadoFlujo, TurnoConversacion } from '../../domain/orquestador-atencion/types/Orquestador.js';
import type { PgPool } from './postgres/pool.js';

interface FilaConversacion {
  conversacion_id: string;
  actor_user_id: string;
  docente_id: string | null;
  historial: TurnoConversacion[];
  estado_flujo: EstadoFlujo;
  creado_en: Date;
  actualizado_en: Date;
}

/** Estado del orquestador en PostgreSQL: sobrevive reinicios y, a diferencia del archivo JSON, admite varias instancias. */
export class PgConversacionRepository implements IConversacionRepository {
  constructor(private readonly pool: PgPool) {}

  async obtener(conversacionId: string): Promise<ConversacionEstado | null> {
    const { rows } = await this.pool.query<FilaConversacion>('SELECT * FROM conversaciones WHERE conversacion_id = $1', [conversacionId]);
    const f = rows[0];
    if (!f) return null;
    return {
      conversacionId: f.conversacion_id,
      actorUserId: f.actor_user_id,
      ...(f.docente_id !== null && { docenteId: f.docente_id }),
      historial: f.historial,
      estadoFlujo: f.estado_flujo,
      creadoEn: f.creado_en.toISOString(),
      actualizadoEn: f.actualizado_en.toISOString(),
    };
  }

  async guardar(estado: ConversacionEstado): Promise<void> {
    await this.pool.query(
      `INSERT INTO conversaciones (conversacion_id, actor_user_id, docente_id, historial, estado_flujo, creado_en, actualizado_en)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
       ON CONFLICT (conversacion_id) DO UPDATE SET actor_user_id = EXCLUDED.actor_user_id, docente_id = EXCLUDED.docente_id,
         historial = EXCLUDED.historial, estado_flujo = EXCLUDED.estado_flujo, actualizado_en = EXCLUDED.actualizado_en`,
      [estado.conversacionId, estado.actorUserId, estado.docenteId ?? null, JSON.stringify(estado.historial), estado.estadoFlujo, estado.creadoEn, estado.actualizadoEn]
    );
  }
}
