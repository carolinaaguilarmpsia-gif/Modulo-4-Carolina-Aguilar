import type { PerfilDocente, SeccionPerfil } from '../../types/PerfilDocente.js';

/** Puerto de salida — persistencia del perfil/CV. @see FSD-UC-006 */
export interface IPerfilDocenteRepository {
  obtener(docenteId: string): Promise<PerfilDocente | null>;
  /** UPSERT de una sección: crea el perfil si no existe y actualiza `updatedAt`. */
  upsertSeccion(docenteId: string, seccion: SeccionPerfil, data: unknown[], ahora: Date): Promise<PerfilDocente>;
}
