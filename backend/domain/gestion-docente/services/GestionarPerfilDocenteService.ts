import { Rol } from '../../administracion/types/Rol.js';
import { ForbiddenError, ValidationError } from '../../shared/errors/DomainError.js';
import type { ActorContext } from '../../shared/types/ActorContext.js';
import type { IPerfilDocenteRepository } from '../ports/out/IPerfilDocenteRepository.js';
import type { PerfilDocente, SeccionPerfil } from '../types/PerfilDocente.js';

/**
 * Perfil y CV del docente. El contenido del CV es dato personal: nunca se escribe en logs (Ley 164).
 * @see FSD-UC-006 · RB-04 (solo el titular edita)
 */
export class GestionarPerfilDocenteService {
  constructor(
    private readonly perfiles: IPerfilDocenteRepository,
    private readonly ahora: () => Date = () => new Date()
  ) {}

  /** DOCENTE: el suyo. ADMIN_SISTEMA: solo lectura de un docente indicado. */
  async obtener(actor: ActorContext, docenteId?: string): Promise<PerfilDocente> {
    let objetivo: string;
    if (actor.rol === Rol.DOCENTE) {
      if (docenteId && docenteId !== actor.userId) throw new ForbiddenError('UNAUTHORIZED_DATA_ACCESS');
      objetivo = actor.userId;
    } else if (actor.rol === Rol.ADMIN_SISTEMA) {
      if (!docenteId) throw new ValidationError('DOCENTE_ID_REQUIRED');
      objetivo = docenteId;
    } else {
      throw new ForbiddenError('INSUFFICIENT_ROLE', { rol: actor.rol });
    }

    return (await this.perfiles.obtener(objetivo)) ?? perfilVacio(objetivo);
  }

  async actualizarSeccion(
    actor: ActorContext,
    params: { seccion: SeccionPerfil; data: unknown[]; docenteId?: string }
  ): Promise<PerfilDocente> {
    // RB-04 — solo el docente titular edita; ADMIN_SISTEMA es de solo lectura.
    if (actor.rol !== Rol.DOCENTE || (params.docenteId && params.docenteId !== actor.userId)) {
      throw new ForbiddenError('FORBIDDEN_PROFILE_EDIT');
    }

    return this.perfiles.upsertSeccion(actor.userId, params.seccion, params.data, this.ahora());
  }
}

function perfilVacio(docenteId: string): PerfilDocente {
  return { docenteId, formacion_academica: [], publicaciones: [], experiencia_docente: [], updatedAt: null };
}
