import { z } from 'zod';
import { EstadoDJ } from '../../domain/declaracion-jurada/types/EstadoDJ.js';
import type { NextFunction, Request, Response } from 'express';

export const CreateDjSchema = z.object({
  tipo: z.enum(['LABORAL', 'PATRIMONIAL', 'INTERESES']),
  periodoAcademico: z.string().regex(/^\d{4}-(I|II)$/),
  camposFormulario: z.record(z.unknown()).refine((obj) => Object.keys(obj).length > 0, {
    message: 'camposFormulario no puede estar vacío',
  }),
});

export const UpdateDjCamposSchema = z.object({
  camposFormulario: z.record(z.unknown()),
});

export const TransicionDjSchema = z.object({
  comando: z.enum(['ENVIAR', 'APROBAR', 'DEVOLVER', 'ESCALAR_DPA', 'REENVIAR', 'RECHAZAR']),
  observaciones: z.string().min(10).max(1000).optional(),
});

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        error: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details: result.error.flatten().fieldErrors,
        correlationId: (req as { correlationId?: string }).correlationId,
      });
      return;
    }
    (req as Request & { validatedBody: T }).validatedBody = result.data;
    next();
  };
}

export const ListDjQuerySchema = z.object({
  estado: z.nativeEnum(EstadoDJ).optional(),
  page: z.coerce.number().int().min(1).optional(),
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
