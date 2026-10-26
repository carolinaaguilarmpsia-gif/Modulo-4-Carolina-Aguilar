import type { RolInstitucional } from '../../types/RolInstitucional.js';

export interface CambioRolInstitucional {
  docenteId: string;
  /** null = revocar el rol institucional */
  rolNuevo: RolInstitucional | null;
  actorId: string;
  timestamp: Date;
}

/**
 * Puerto de salida — rol institucional del docente.
 * @see FSD-UC-009 · RB-06 — `asignar` MUST cambiar el rol y registrar la auditoría de forma
 * atómica (una sola transacción en la implementación real).
 */
export interface IRolInstitucionalRepository {
  obtener(docenteId: string): Promise<RolInstitucional | null>;
  asignar(cambio: CambioRolInstitucional): Promise<{ rolAnterior: RolInstitucional | null }>;
}
