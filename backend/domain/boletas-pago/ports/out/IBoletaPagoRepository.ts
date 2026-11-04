import type { BoletaPago } from '../../types/BoletaPago.js';

/** Puerto de salida — boletas de pago. @see FSD-UC-005 */
export interface IBoletaPagoRepository {
  /** Boletas del docente, la más reciente primero. */
  listarPorDocente(docenteId: string): Promise<BoletaPago[]>;
  obtenerPorId(id: string): Promise<BoletaPago | null>;
}
