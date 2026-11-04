import type { AsistenteTramitesResult, EstadoAsistenteTramites } from '../../types/AsistenteTramites.js';

export interface OpcionesLlamada {
  /** Plazo/cancelación de quien llama. En la forma HTTP corta la petición; en proceso se comprueba antes de empezar. */
  signal?: AbortSignal;
}

/**
 * Puerto de entrada de la frontera del módulo Trámites DPA (experimento E3). Todo lo que está fuera
 * del módulo (controlador público, orquestador) habla con él solo a través de esta interfaz, de modo
 * que el módulo pueda vivir dentro del proceso o detrás de HTTP sin que el consumidor lo note.
 * Es asíncrono a propósito: una versión remota no puede ser síncrona.
 */
export interface IAsistenteTramites {
  preguntar(pregunta: string, opciones?: OpcionesLlamada): Promise<AsistenteTramitesResult>;
  estado(opciones?: OpcionesLlamada): Promise<EstadoAsistenteTramites>;
}

export type MotivoNoDisponible = 'timeout' | 'red' | 'http-5xx' | 'circuito-abierto' | 'rechazada';

/** El módulo no respondió a tiempo o no respondió bien. Solo lo lanza la forma HTTP. */
export class TramitesNoDisponibleError extends Error {
  constructor(
    public readonly motivo: MotivoNoDisponible,
    detalle?: string
  ) {
    super(`El módulo de trámites no está disponible (${motivo})${detalle ? `: ${detalle}` : ''}`);
    this.name = 'TramitesNoDisponibleError';
  }
}
