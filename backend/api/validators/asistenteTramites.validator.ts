import { z } from 'zod';

export const AsistenteTramitesSchema = z.object({
  pregunta: z.string().max(300).trim().min(3, 'Escriba su pregunta'),
});
