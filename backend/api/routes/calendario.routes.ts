import { Router } from 'express';
import type { CalendarioController } from '../controllers/calendario.controller.js';
import type { IJwtSigner } from '../../domain/administracion/ports/out/IJwtSigner.js';
import type { IUsuarioRepository } from '../../domain/administracion/ports/out/IUsuarioRepository.js';
import { Rol } from '../../domain/administracion/types/Rol.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../validators/dj.validator.js';
import { ConsultarCalendarioQuerySchema, PublicarCalendarioSchema, validateQuery } from '../validators/calendario.validator.js';

/** @see FSD-UC-008 — montado en /api/v1/calendario-academico */
export function createCalendarioRouter(
  controller: CalendarioController,
  jwtSigner: IJwtSigner,
  usuarios: IUsuarioRepository
): Router {
  const router = Router();

  router.get(
    '/',
    requireRole(jwtSigner, usuarios, [Rol.DOCENTE, Rol.ADMIN_FACULTAD, Rol.ADMIN_SISTEMA]),
    validateQuery(ConsultarCalendarioQuerySchema),
    asyncHandler(controller.consultar)
  );
  router.put(
    '/',
    requireRole(jwtSigner, usuarios, [Rol.ADMIN_FACULTAD, Rol.ADMIN_SISTEMA]),
    validateBody(PublicarCalendarioSchema),
    asyncHandler(controller.publicar)
  );

  return router;
}
