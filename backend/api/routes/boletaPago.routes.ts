import { Router } from 'express';
import type { BoletaPagoController } from '../controllers/boletaPago.controller.js';
import type { IJwtSigner } from '../../domain/administracion/ports/out/IJwtSigner.js';
import type { IUsuarioRepository } from '../../domain/administracion/ports/out/IUsuarioRepository.js';
import { Rol } from '../../domain/administracion/types/Rol.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { ListarBoletasQuerySchema } from '../validators/boletaPago.validator.js';
import { validateQuery } from '../validators/dj.validator.js';

/** @see FSD-UC-005 — montado en /api/v1/boletas-pago. Solo el docente consulta sus boletas. */
export function createBoletaPagoRouter(
  controller: BoletaPagoController,
  jwtSigner: IJwtSigner,
  usuarios: IUsuarioRepository
): Router {
  const router = Router();

  router.use(requireRole(jwtSigner, usuarios, [Rol.DOCENTE]));
  router.get('/', validateQuery(ListarBoletasQuerySchema), asyncHandler(controller.listar));
  router.get('/:id', asyncHandler(controller.obtener));

  return router;
}
