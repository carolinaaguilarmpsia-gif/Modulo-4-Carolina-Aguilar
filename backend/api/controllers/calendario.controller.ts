import type { Response } from 'express';
import type { z } from 'zod';
import type { GestionarCalendarioService } from '../../domain/gestion-academica/services/GestionarCalendarioService.js';
import type { EventoCalendario } from '../../domain/gestion-academica/types/Calendario.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { ConsultarCalendarioQuerySchema, PublicarCalendarioSchema } from '../validators/calendario.validator.js';

/** @see FSD-UC-008 */
export class CalendarioController {
  constructor(private readonly service: GestionarCalendarioService) {}

  consultar = async (
    req: AuthenticatedRequest & { validatedQuery: z.infer<typeof ConsultarCalendarioQuerySchema> },
    res: Response
  ): Promise<void> => {
    const { periodo, facultadId } = req.validatedQuery;
    const eventos = await this.service.consultar(periodo, actor(req), facultadId);
    res.json({ periodo, eventos, correlationId: req.correlationId });
  };

  publicar = async (
    req: AuthenticatedRequest & { validatedBody: z.infer<typeof PublicarCalendarioSchema> },
    res: Response
  ): Promise<void> => {
    const body = req.validatedBody;
    const calendario = await this.service.publicar(
      { periodo: body.periodo, facultadId: body.facultadId, eventos: body.eventos as EventoCalendario[] },
      actor(req)
    );
    res.json({
      calendario: {
        periodo: calendario.periodo,
        facultadId: calendario.facultadId,
        eventos: calendario.eventos,
        updatedAt: calendario.updatedAt.toISOString(),
      },
      correlationId: req.correlationId,
    });
  };
}

function actor(req: AuthenticatedRequest) {
  return { userId: req.user.userId, rol: req.user.rol, facultadId: req.user.facultadId };
}
