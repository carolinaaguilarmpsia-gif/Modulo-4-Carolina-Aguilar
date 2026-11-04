import type { Request, Response } from 'express';
import type { z } from 'zod';
import { TramitesNoDisponibleError, type IAsistenteTramites } from '../../domain/tramites-dpa/ports/in/IAsistenteTramites.js';
import type { AsistenteTramitesSchema } from '../validators/asistenteTramites.validator.js';

type PreguntarRequest = Request & {
  validatedBody: z.infer<typeof AsistenteTramitesSchema>;
  correlationId: string;
};

/** Endpoint público (sin login) — chat de trámites DPA visible en la pantalla de login. */
export class AsistenteTramitesController {
  constructor(private readonly service: IAsistenteTramites) {}

  preguntar = async (req: PreguntarRequest, res: Response): Promise<void> => {
    try {
      const resultado = await this.service.preguntar(req.validatedBody.pregunta);
      res.json({ ...resultado, correlationId: req.correlationId });
    } catch (e) {
      if (!(e instanceof TramitesNoDisponibleError)) throw e;
      // Solo ocurre con TRAMITES_MODO=http: el módulo extraído no respondió.
      res.status(503).json({ error: 'TRAMITES_NO_DISPONIBLE', message: e.message, motivo: e.motivo, correlationId: req.correlationId });
    }
  };

  estado = async (req: Request & { correlationId: string }, res: Response): Promise<void> => {
    res.json({ ...(await this.service.estado()), correlationId: req.correlationId });
  };
}
