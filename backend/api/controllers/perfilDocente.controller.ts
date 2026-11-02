import type { Response } from 'express';
import type { z } from 'zod';
import type { GestionarPerfilDocenteService } from '../../domain/gestion-docente/services/GestionarPerfilDocenteService.js';
import type { PerfilDocente } from '../../domain/gestion-docente/types/PerfilDocente.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { ActualizarPerfilSchema } from '../validators/gestionDocente.validator.js';

/** @see FSD-UC-006 — el contenido del CV nunca se escribe en logs (Ley 164) */
export class PerfilDocenteController {
  constructor(private readonly service: GestionarPerfilDocenteService) {}

  obtener = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const docenteId = typeof req.query.docenteId === 'string' ? req.query.docenteId : undefined;
    const perfil = await this.service.obtener(actor(req), docenteId);
    res.json({ perfil: toDto(perfil), correlationId: req.correlationId });
  };

  actualizar = async (
    req: AuthenticatedRequest & { validatedBody: z.infer<typeof ActualizarPerfilSchema> },
    res: Response
  ): Promise<void> => {
    const { seccion, data } = req.validatedBody;
    const perfil = await this.service.actualizarSeccion(actor(req), {
      seccion,
      data,
      docenteId: req.params.docenteId,
    });
    res.json({ perfil: toDto(perfil), updatedAt: perfil.updatedAt?.toISOString() ?? null, correlationId: req.correlationId });
  };
}

function actor(req: AuthenticatedRequest) {
  return { userId: req.user.userId, rol: req.user.rol, facultadId: req.user.facultadId };
}

function toDto(perfil: PerfilDocente) {
  return { ...perfil, updatedAt: perfil.updatedAt ? perfil.updatedAt.toISOString() : null };
}
