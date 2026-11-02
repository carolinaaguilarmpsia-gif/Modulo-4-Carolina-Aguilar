import { Rol } from '../../administracion/types/Rol.js';
import { ForbiddenError, ValidationError } from '../../shared/errors/DomainError.js';
import type { ActorContext } from '../../shared/types/ActorContext.js';
import type { ICalendarioRepository } from '../ports/out/ICalendarioRepository.js';
import type { CalendarioAcademico, EventoCalendario, EventoCalendarioConsulta } from '../types/Calendario.js';

export interface PublicarCalendarioCommand {
  periodo: string;
  /** Omitido: ADMIN_FACULTAD usa la suya; ADMIN_SISTEMA publica el calendario institucional. */
  facultadId?: string;
  eventos: EventoCalendario[];
}

/**
 * Publicación y consulta del calendario académico.
 * @see FSD-UC-008 · RB-05 (un Admin. Facultad solo publica en su facultad)
 */
export class GestionarCalendarioService {
  constructor(
    private readonly calendarios: ICalendarioRepository,
    private readonly ahora: () => Date = () => new Date()
  ) {}

  async publicar(cmd: PublicarCalendarioCommand, actor: ActorContext): Promise<CalendarioAcademico> {
    let facultadId: string | null;
    if (actor.rol === Rol.ADMIN_FACULTAD) {
      if (cmd.facultadId && cmd.facultadId !== actor.facultadId) {
        throw new ForbiddenError('CROSS_FACULTY_FORBIDDEN', {
          facultadActor: actor.facultadId,
          facultadSolicitada: cmd.facultadId,
        });
      }
      facultadId = actor.facultadId;
    } else if (actor.rol === Rol.ADMIN_SISTEMA) {
      facultadId = cmd.facultadId ?? null;
    } else {
      throw new ForbiddenError('INSUFFICIENT_ROLE', { rol: actor.rol });
    }

    for (const evento of cmd.eventos) {
      if (evento.fechaFin < evento.fechaInicio) {
        throw new ValidationError('INVALID_DATE_RANGE', { evento: evento.nombre });
      }
    }

    const calendario: CalendarioAcademico = {
      periodo: cmd.periodo,
      facultadId,
      eventos: [...cmd.eventos],
      updatedAt: this.ahora(),
    };
    await this.calendarios.guardar(calendario);
    return calendario;
  }

  /**
   * DOCENTE y ADMIN_FACULTAD ven el calendario de su facultad fusionado con el institucional.
   * ADMIN_SISTEMA puede elegir la facultad; sin ella ve solo el institucional.
   */
  async consultar(periodo: string, actor: ActorContext, facultadId?: string): Promise<EventoCalendarioConsulta[]> {
    let facultadConsulta: string | null;
    if (actor.rol === Rol.DOCENTE || actor.rol === Rol.ADMIN_FACULTAD) {
      facultadConsulta = actor.facultadId;
    } else if (actor.rol === Rol.ADMIN_SISTEMA) {
      facultadConsulta = facultadId ?? null;
    } else {
      throw new ForbiddenError('INSUFFICIENT_ROLE', { rol: actor.rol });
    }

    const institucional = await this.calendarios.obtener(periodo, null);
    const deFacultad = facultadConsulta ? await this.calendarios.obtener(periodo, facultadConsulta) : null;

    const eventos: EventoCalendarioConsulta[] = [
      ...(institucional?.eventos ?? []).map((e) => ({ ...e, ambito: 'INSTITUCIONAL' as const })),
      ...(deFacultad?.eventos ?? []).map((e) => ({ ...e, ambito: 'FACULTAD' as const })),
    ];
    return eventos.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  }
}
