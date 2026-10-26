import { Router } from 'express';
import type { PerfilDocenteController } from '../controllers/perfilDocente.controller.js';
import type { IJwtSigner } from '../../domain/administracion/ports/out/IJwtSigner.js';
import type { IUsuarioRepository } from '../../domain/administracion/ports/out/IUsuarioRepository.js';
import { Rol } from '../../domain/administracion/types/Rol.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../validators/dj.validator.js';
import { ActualizarPerfilSchema } from '../validators/gestionDocente.validator.js';

/** @see FSD-UC-006 — montado en /api/v1/perfil-docente */
export function createPerfilDocenteRouter(
  controller: PerfilDocenteController,
  jwtSigner: IJwtSigner,
  usuarios: IUsuarioRepository
): Router {
  const router = Router();
  router.use(requireRole(jwtSigner, usuarios, [Rol.DOCENTE, Rol.ADMIN_SISTEMA]));
  router.get('/', asyncHandler(controller.obtener));
  router.patch('/', validateBody(ActualizarPerfilSchema), asyncHandler(controller.actualizar));
  // Misma operación con el id del docente en la ruta: solo el titular puede editar (403 si no lo es).
  router.patch('/:docenteId', validateBody(ActualizarPerfilSchema), asyncHandler(controller.actualizar));
  return router;
}
