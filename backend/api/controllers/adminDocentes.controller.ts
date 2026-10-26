import type { Response } from 'express';
import type { z } from 'zod';
import type { AsignarRolInstitucionalService } from '../../domain/gestion-docente/services/AsignarRolInstitucionalService.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { AsignarRolSchema } from '../validators/gestionDocente.validator.js';

/** @see FSD-UC-009 */
export class AdminDocentesController {
  constructor(private readonly service: AsignarRolInstitucionalService) {}

  asignarRol = async (
    req: AuthenticatedRequest & { validatedBody: z.infer<typeof AsignarRolSchema> },
    res: Response
  ): Promise<void> => {
    const resultado = await this.service.asignar(
      { docenteId: req.params.id, rolInstitucional: req.validatedBody.rolInstitucional },
      { userId: req.user.userId, rol: req.user.rol, facultadId: req.user.facultadId }
    );

    res.json({
      docenteId: resultado.docenteId,
      rolAnterior: resultado.rolAnterior,
      rolNuevo: resultado.rolNuevo,
      correlationId: req.correlationId,
    });
  };
}
