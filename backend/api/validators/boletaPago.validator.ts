import { z } from 'zod';

/** @see FSD-UC-005 — filtro opcional del listado por mes (AAAA-MM). */
export const ListarBoletasQuerySchema = z.object({
  periodo: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use el formato AAAA-MM, por ejemplo 2026-10')
    .optional(),
});
