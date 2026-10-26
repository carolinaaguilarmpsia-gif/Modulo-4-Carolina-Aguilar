/** @see FSD-UC-008 */
export type TipoEventoCalendario =
  | 'INICIO_SEMESTRE'
  | 'FIN_SEMESTRE'
  | 'INSCRIPCIONES'
  | 'EXAMENES'
  | 'FERIADO'
  | 'OTRO';

export const TIPOS_EVENTO_CALENDARIO: readonly TipoEventoCalendario[] = [
  'INICIO_SEMESTRE',
  'FIN_SEMESTRE',
  'INSCRIPCIONES',
  'EXAMENES',
  'FERIADO',
  'OTRO',
];

export interface EventoCalendario {
  tipo: TipoEventoCalendario;
  nombre: string;
  /** Fecha ISO `YYYY-MM-DD` */
  fechaInicio: string;
  /** Fecha ISO `YYYY-MM-DD`, nunca anterior a fechaInicio */
  fechaFin: string;
}

/** `facultadId = null` es el calendario institucional. */
export interface CalendarioAcademico {
  periodo: string;
  facultadId: string | null;
  eventos: EventoCalendario[];
  updatedAt: Date;
}

export interface EventoCalendarioConsulta extends EventoCalendario {
  ambito: 'INSTITUCIONAL' | 'FACULTAD';
}
