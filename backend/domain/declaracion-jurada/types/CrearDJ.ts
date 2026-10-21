import type { Rol } from '../../administracion/types/Rol.js';
import type { EstadoDJ } from './EstadoDJ.js';

export interface CrearDJCommand {
  docenteId: string;
  facultadId: string;
  docenteVinculacionActiva: boolean;
  tipo: string;
  periodoAcademico: string;
  camposFormulario: Record<string, unknown>;
}

export interface ActorContext {
  userId: string;
  rol: Rol;
  facultadId?: string;
}

export interface ListarDJQuery {
  estado?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Conteo de DJ por estado dentro del alcance del actor.
 * `porEstado` siempre trae los 6 estados de `EstadoDJ` (0 por defecto).
 * @see FSD-UC-002 · RB-05
 */
export interface EstadisticasDJ {
  porEstado: Record<EstadoDJ, number>;
  total: number;
}
