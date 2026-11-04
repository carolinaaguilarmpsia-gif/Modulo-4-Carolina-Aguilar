import type {
  CambioRolInstitucional,
  IRolInstitucionalRepository,
} from '../../domain/gestion-docente/ports/out/IRolInstitucionalRepository.js';
import type { RolInstitucional } from '../../domain/gestion-docente/types/RolInstitucional.js';
import type { PgPool } from './postgres/pool.js';

export class PgRolInstitucionalRepository implements IRolInstitucionalRepository {
  constructor(private readonly pool: PgPool) {}

  async obtener(docenteId: string): Promise<RolInstitucional | null> {
    const { rows } = await this.pool.query<{ rol: RolInstitucional }>('SELECT rol FROM roles_institucionales WHERE docente_id = $1', [docenteId]);
    return rows[0]?.rol ?? null;
  }

  /** RB-06: el cambio y su auditoría van en una sola transacción; el candado serializa cambios simultáneos del mismo docente. */
  async asignar(cambio: CambioRolInstitucional): Promise<{ rolAnterior: RolInstitucional | null }> {
    const cliente = await this.pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`rol-institucional:${cambio.docenteId}`]);
      const previo = await cliente.query<{ rol: RolInstitucional }>('SELECT rol FROM roles_institucionales WHERE docente_id = $1', [cambio.docenteId]);
      const rolAnterior = previo.rows[0]?.rol ?? null;

      if (cambio.rolNuevo === null) {
        await cliente.query('DELETE FROM roles_institucionales WHERE docente_id = $1', [cambio.docenteId]);
      } else {
        await cliente.query(
          'INSERT INTO roles_institucionales (docente_id, rol) VALUES ($1, $2) ON CONFLICT (docente_id) DO UPDATE SET rol = EXCLUDED.rol',
          [cambio.docenteId, cambio.rolNuevo]
        );
      }
      await cliente.query(
        'INSERT INTO auditoria_roles_institucionales (docente_id, rol_anterior, rol_nuevo, actor_id, ocurrido_en) VALUES ($1, $2, $3, $4, $5)',
        [cambio.docenteId, rolAnterior, cambio.rolNuevo, cambio.actorId, cambio.timestamp]
      );
      await cliente.query('COMMIT');
      return { rolAnterior };
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }
}
