import { z } from 'zod';
import { TIPOS_EVENTO_CALENDARIO } from '../../domain/gestion-academica/types/Calendario.js';

const PERIODO = /^\d{4}-(I|II)$/;

const fechaIso = z
  .string()
  .date('Use una fecha válida con el formato AAAA-MM-DD');

const EventoSchema = z
  .object({
    tipo: z.enum(TIPOS_EVENTO_CALENDARIO as [string, ...string[]]),
    nombre: z.string().trim().min(2).max(150),
    fechaInicio: fechaIso,
    fechaFin: fechaIso,
  })
  .refine((e) => e.fechaFin >= e.fechaInicio, {
    message: 'fechaFin no puede ser anterior a fechaInicio',
    path: ['fechaFin'],
  });

/** @see FSD-UC-008 */
export const PublicarCalendarioSchema = z.object({
  periodo: z.string().regex(PERIODO, 'Use el formato 2026-I o 2026-II'),
  facultadId: z.string().trim().min(1).optional(),
  eventos: z.array(EventoSchema).min(1).max(100),
});

export const ConsultarCalendarioQuerySchema = z.object({
  periodo: z.string().regex(PERIODO, 'Use el formato 2026-I o 2026-II'),
  facultadId: z.string().trim().min(1).optional(),
});
