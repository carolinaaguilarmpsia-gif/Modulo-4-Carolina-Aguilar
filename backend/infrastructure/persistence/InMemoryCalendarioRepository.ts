import type { ICalendarioRepository } from '../../domain/gestion-academica/ports/out/ICalendarioRepository.js';
import type { CalendarioAcademico } from '../../domain/gestion-academica/types/Calendario.js';

/** Demo/desarrollo — in-memory como el resto de repos de SGAI. */
export class InMemoryCalendarioRepository implements ICalendarioRepository {
  private readonly store = new Map<string, CalendarioAcademico>();

  private clave(periodo: string, facultadId: string | null): string {
    return `${periodo}|${facultadId ?? 'INSTITUCIONAL'}`;
  }

  async obtener(periodo: string, facultadId: string | null): Promise<CalendarioAcademico | null> {
    return this.store.get(this.clave(periodo, facultadId)) ?? null;
  }

  async guardar(calendario: CalendarioAcademico): Promise<void> {
    this.store.set(this.clave(calendario.periodo, calendario.facultadId), calendario);
  }
}
