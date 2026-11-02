import { z } from 'zod';

export const PreguntarAgenteDjSchema = z.object({
  pregunta: z.string().max(500).trim().min(3, 'Escriba su pregunta'),
});

export const ConfirmarAgenteDjSchema = z.object({
  sessionId: z.string().trim().min(1, 'Falta el sessionId'),
  confirmar: z.boolean(),
});
