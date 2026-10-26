import type { IUsuarioRepository } from '../../administracion/ports/out/IUsuarioRepository.js';
import { Rol } from '../../administracion/types/Rol.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors/DomainError.js';
import type { ActorContext } from '../../shared/types/ActorContext.js';
import type { IRolInstitucionalRepository } from '../ports/out/IRolInstitucionalRepository.js';
import { RolInstitucional } from '../types/RolInstitucional.js';

export interface AsignarRolCommand {
  docenteId: string;
  /** null = revocar */
  rolInstitucional: RolInstitucional | null;
}

export interface AsignarRolResult {
  docenteId: string;
  rolAnterior: RolInstitucional | null;
  rolNuevo: RolInstitucional | null;
}

/**
 * Asignación o revocación del rol institucional de un docente.
 * @see FSD-UC-009 · RB-05 (misma facultad) · RB-06 (cambio + auditoría atómicos)
 */
export class AsignarRolInstitucionalService {
  constructor(
    private readonly usuarios: IUsuarioRepository,
    private readonly roles: IRolInstitucionalRepository,
    private readonly ahora: () => Date = () => new Date()
  ) {}

  async asignar(cmd: AsignarRolCommand, actor: ActorContext): Promise<AsignarRolResult> {
    if (actor.rol !== Rol.ADMIN_FACULTAD && actor.rol !== Rol.ADMIN_SISTEMA) {
      throw new ForbiddenError('INSUFFICIENT_ROLE', { rol: actor.rol });
    }

    if (cmd.rolInstitucional !== null && !Object.values(RolInstitucional).includes(cmd.rolInstitucional)) {
      throw new ValidationError('INVALID_ROL_INSTITUCIONAL', { rolInstitucional: cmd.rolInstitucional });
    }

    const docente = (await this.usuarios.listar()).find((u) => u.id === cmd.docenteId && u.rol === Rol.DOCENTE);
    if (!docente) throw new NotFoundError('DOCENTE_NOT_FOUND', { docenteId: cmd.docenteId });

    // RB-05 — un Admin. Facultad solo gestiona docentes de su propia facultad.
    if (actor.rol === Rol.ADMIN_FACULTAD && docente.facultadId !== actor.facultadId) {
      throw new ForbiddenError('CROSS_FACULTY_FORBIDDEN', {
        facultadActor: actor.facultadId,
        facultadDocente: docente.facultadId,
      });
    }

    const { rolAnterior } = await this.roles.asignar({
      docenteId: docente.id,
      rolNuevo: cmd.rolInstitucional,
      actorId: actor.userId,
      timestamp: this.ahora(),
    });

    return { docenteId: docente.id, rolAnterior, rolNuevo: cmd.rolInstitucional };
  }
}
