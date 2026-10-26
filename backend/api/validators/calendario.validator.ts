import { z } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { TIPOS_EVENTO_CALENDARIO } from '../../domain/gestion-academica/types/Calendario.js';

const PERIODO = /^\d{4}-(I|II)$/;

const fechaIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use el formato AAAA-MM-DD')
  .refine((valor) => !Number.isNaN(Date.parse(`${valor}T00:00:00Z`)), 'Fecha inválida');

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

/** Igual que `validateBody` pero sobre `req.query`; mismo formato 422 con `correlationId`. */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(422).json({
        error: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details: result.error.flatten().fieldErrors,
        correlationId: (req as { correlationId?: string }).correlationId,
      });
      return;
    }
    (req as Request & { validatedQuery: T }).validatedQuery = result.data;
    next();
  };
}
