import { z } from 'zod';

/** Forma de respuesta del agente MCP (`AgenteDJResult`): la traza y la confirmación pendiente son abiertas. */
export const AgenteDjSchemas = {
  resultado: z
    .object({
      respuesta: z.string().optional(),
      traza: z.array(z.record(z.unknown())),
      confirmacionPendiente: z.record(z.unknown()).optional(),
      sessionId: z.string().optional(),
      correlationId: z.string(),
    })
    .passthrough(),
};
