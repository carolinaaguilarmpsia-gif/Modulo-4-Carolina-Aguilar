import type {
  CambioRolInstitucional,
  IRolInstitucionalRepository,
} from '../../domain/gestion-docente/ports/out/IRolInstitucionalRepository.js';
import type { RolInstitucional } from '../../domain/gestion-docente/types/RolInstitucional.js';

export interface RegistroAuditoriaRol {
  docenteId: string;
  rolAnterior: RolInstitucional | null;
  rolNuevo: RolInstitucional | null;
  actorId: string;
  timestamp: Date;
}

/** Demo/desarrollo — in-memory como el resto de repos de SGAI. El cambio y su auditoría se escriben juntos. */
export class InMemoryRolInstitucionalRepository implements IRolInstitucionalRepository {
  private readonly roles = new Map<string, RolInstitucional>();
  private readonly auditoria: RegistroAuditoriaRol[] = [];

  async obtener(docenteId: string): Promise<RolInstitucional | null> {
    return this.roles.get(docenteId) ?? null;
  }

  async asignar(cambio: CambioRolInstitucional): Promise<{ rolAnterior: RolInstitucional | null }> {
    const rolAnterior = this.roles.get(cambio.docenteId) ?? null;

    // Un solo bloque síncrono: no hay await entre el cambio y su registro de auditoría.
    if (cambio.rolNuevo === null) this.roles.delete(cambio.docenteId);
    else this.roles.set(cambio.docenteId, cambio.rolNuevo);
    this.auditoria.push({
      docenteId: cambio.docenteId,
      rolAnterior,
      rolNuevo: cambio.rolNuevo,
      actorId: cambio.actorId,
      timestamp: cambio.timestamp,
    });

    return { rolAnterior };
  }

  /** Solo para pruebas y diagnóstico. */
  registrosAuditoria(): readonly RegistroAuditoriaRol[] {
    return this.auditoria;
  }
}
