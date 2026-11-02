import { Router } from 'express';
import type { AdminDocentesController } from '../controllers/adminDocentes.controller.js';
import type { IJwtSigner } from '../../domain/administracion/ports/out/IJwtSigner.js';
import type { IUsuarioRepository } from '../../domain/administracion/ports/out/IUsuarioRepository.js';
import { Rol } from '../../domain/administracion/types/Rol.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../validators/dj.validator.js';
import { AsignarRolSchema } from '../validators/gestionDocente.validator.js';

/** @see FSD-UC-009 — montado en /api/v1/admin/docentes */
export function createAdminDocentesRouter(
  controller: AdminDocentesController,
  jwtSigner: IJwtSigner,
  usuarios: IUsuarioRepository
): Router {
  const router = Router();
  router.use(requireRole(jwtSigner, usuarios, [Rol.ADMIN_FACULTAD, Rol.ADMIN_SISTEMA]));
  router.patch('/:id/rol-institucional', validateBody(AsignarRolSchema), asyncHandler(controller.asignarRol));
  return router;
}
