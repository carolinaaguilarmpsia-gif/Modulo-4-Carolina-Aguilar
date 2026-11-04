import type { IPerfilDocenteRepository } from '../../domain/gestion-docente/ports/out/IPerfilDocenteRepository.js';
import type { PerfilDocente, SeccionPerfil } from '../../domain/gestion-docente/types/PerfilDocente.js';
import { SECCIONES_PERFIL } from '../../domain/gestion-docente/types/PerfilDocente.js';
import type { PgPool } from './postgres/pool.js';

interface FilaPerfil {
  docente_id: string;
  formacion_academica: unknown[];
  publicaciones: unknown[];
  experiencia_docente: unknown[];
  updated_at: Date | null;
}

function aPerfil(f: FilaPerfil): PerfilDocente {
  return {
    docenteId: f.docente_id,
    formacion_academica: f.formacion_academica,
    publicaciones: f.publicaciones,
    experiencia_docente: f.experiencia_docente,
    updatedAt: f.updated_at,
  };
}

export class PgPerfilDocenteRepository implements IPerfilDocenteRepository {
  constructor(private readonly pool: PgPool) {}

  async obtener(docenteId: string): Promise<PerfilDocente | null> {
    const { rows } = await this.pool.query<FilaPerfil>('SELECT * FROM perfiles_docente WHERE docente_id = $1', [docenteId]);
    return rows[0] ? aPerfil(rows[0]) : null;
  }

  async upsertSeccion(docenteId: string, seccion: SeccionPerfil, data: unknown[], ahora: Date): Promise<PerfilDocente> {
    // El nombre de la columna no se puede enviar como parámetro: se valida contra la lista cerrada.
    if (!SECCIONES_PERFIL.includes(seccion)) throw new Error(`Sección de perfil desconocida: ${String(seccion)}`);
    const { rows } = await this.pool.query<FilaPerfil>(
      `INSERT INTO perfiles_docente (docente_id, ${seccion}, updated_at) VALUES ($1, $2::jsonb, $3)
       ON CONFLICT (docente_id) DO UPDATE SET ${seccion} = EXCLUDED.${seccion}, updated_at = EXCLUDED.updated_at
       RETURNING *`,
      [docenteId, JSON.stringify(data), ahora]
    );
    return aPerfil(rows[0]);
  }
}
