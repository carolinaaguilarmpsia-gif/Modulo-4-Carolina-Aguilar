import type { INotificacionPublisher } from '../../backend/domain/declaracion-jurada/ports/out/INotificacionPublisher.js';
import type { EstadoDJ } from '../../backend/domain/declaracion-jurada/types/EstadoDJ.js';

export class ConsoleNotificacionPublisher implements INotificacionPublisher {
  readonly events: Array<{ djId: string; estadoNuevo: EstadoDJ; destinatarioRol: string }> = [];

  async publicarDjStateChanged(event: {
    djId: string;
    estadoNuevo: EstadoDJ;
    destinatarioRol: string;
  }): Promise<void> {
    this.events.push({ ...event });
  }
}
