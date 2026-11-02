import type { CalendarioAcademico } from '../../types/Calendario.js';

/** Puerto de salida — calendario académico. @see FSD-UC-008 */
export interface ICalendarioRepository {
  obtener(periodo: string, facultadId: string | null): Promise<CalendarioAcademico | null>;
  /** UPSERT por (periodo, facultadId): reemplaza el calendario completo. */
  guardar(calendario: CalendarioAcademico): Promise<void>;
}
