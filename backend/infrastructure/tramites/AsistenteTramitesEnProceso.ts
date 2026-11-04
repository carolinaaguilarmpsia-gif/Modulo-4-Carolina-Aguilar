import type { IAsistenteTramites, OpcionesLlamada } from '../../domain/tramites-dpa/ports/in/IAsistenteTramites.js';
import type { AsistenteTramitesService } from '../../domain/tramites-dpa/services/AsistenteTramitesService.js';
import type { AsistenteTramitesResult, EstadoAsistenteTramites } from '../../domain/tramites-dpa/types/AsistenteTramites.js';

/** Forma 1 (monolito modular): el módulo corre dentro del mismo proceso; es una llamada a función. */
export class AsistenteTramitesEnProceso implements IAsistenteTramites {
  constructor(private readonly servicio: AsistenteTramitesService) {}

  async preguntar(pregunta: string, opciones?: OpcionesLlamada): Promise<AsistenteTramitesResult> {
    opciones?.signal?.throwIfAborted();
    return this.servicio.preguntar(pregunta);
  }

  async estado(opciones?: OpcionesLlamada): Promise<EstadoAsistenteTramites> {
    opciones?.signal?.throwIfAborted();
    return this.servicio.estado();
  }
}
