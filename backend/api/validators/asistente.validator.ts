import { z } from 'zod';

export const ValidarDJSchema = z.object({
  facultad: z.string().max(150).trim().min(3, 'Indique la facultad'),
  nombreDocente: z.string().max(120).trim().min(2, 'Indique el nombre del docente'),
  periodoAcademico: z
    .string()
    .regex(/^\d{4}-(I|II)$/, 'Use el formato 2026-I o 2026-II')
    .optional(),
  consulta: z.string().max(500).trim().min(3, 'Escriba su consulta'),
});
