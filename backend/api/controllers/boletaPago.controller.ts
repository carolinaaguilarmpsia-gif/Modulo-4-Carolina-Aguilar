import type { Response } from 'express';
import type { z } from 'zod';
import type { ConsultarBoletasService } from '../../domain/boletas-pago/services/ConsultarBoletasService.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { ListarBoletasQuerySchema } from '../validators/boletaPago.validator.js';

/** @see FSD-UC-005 */
export class BoletaPagoController {
  constructor(private readonly service: ConsultarBoletasService) {}

  listar = async (
    req: AuthenticatedRequest & { validatedQuery: z.infer<typeof ListarBoletasQuerySchema> },
    res: Response
  ): Promise<void> => {
    const boletas = await this.service.listar(actor(req), req.validatedQuery.periodo);
    res.json({ boletas, correlationId: req.correlationId });
  };

  obtener = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const boleta = await this.service.obtener(req.params.id, actor(req));
    res.json({ boleta: { ...boleta, sincronizadaEn: boleta.sincronizadaEn.toISOString() }, correlationId: req.correlationId });
  };
}

function actor(req: AuthenticatedRequest) {
  return { userId: req.user.userId, rol: req.user.rol, facultadId: req.user.facultadId };
}
