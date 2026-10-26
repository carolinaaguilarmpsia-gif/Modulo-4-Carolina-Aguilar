import { describe, expect, it } from '@jest/globals';
import type { Usuario } from '../../administracion/entities/Usuario.js';
import type { IUsuarioRepository } from '../../administracion/ports/out/IUsuarioRepository.js';
import { Rol } from '../../administracion/types/Rol.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors/DomainError.js';
import type { ActorContext } from '../../shared/types/ActorContext.js';
import type {
  CambioRolInstitucional,
  IRolInstitucionalRepository,
} from '../ports/out/IRolInstitucionalRepository.js';
import { RolInstitucional } from '../types/RolInstitucional.js';
import { AsignarRolInstitucionalService } from './AsignarRolInstitucionalService.js';

const F1 = 'facultad-1';
const F2 = 'facultad-2';

function usuario(id: string, rol: Rol, facultadId: string): Usuario {
  return {
    id,
    email: `${id}@u.test`,
    nombreCompleto: id,
    passwordHashLocal: 'x',
    rol,
    facultadId,
    vinculacionActiva: true,
    intentosFallidos: 0,
    bloqueadoHasta: null,
  };
}

class FakeUsuarios implements IUsuarioRepository {
  constructor(private readonly todos: Usuario[]) {}
  async findByEmail(): Promise<Usuario | null> { return null; }
  async listar(): Promise<Usuario[]> { return this.todos; }
  async registrarIntentoFallido(): Promise<void> {}
  async registrarLoginExitoso(): Promise<void> {}
}

class FakeRoles implements IRolInstitucionalRepository {
  cambios: CambioRolInstitucional[] = [];
  private actual: RolInstitucional | null = null;
  async obtener(): Promise<RolInstitucional | null> { return this.actual; }
  async asignar(cambio: CambioRolInstitucional): Promise<{ rolAnterior: RolInstitucional | null }> {
    const rolAnterior = this.actual;
    this.actual = cambio.rolNuevo;
    this.cambios.push(cambio);
    return { rolAnterior };
  }
}

const ahora = new Date('2026-10-25T12:00:00Z');
const adminF1: ActorContext = { userId: 'admin-1', rol: Rol.ADMIN_FACULTAD, facultadId: F1 };

function armar() {
  const roles = new FakeRoles();
  const usuarios = new FakeUsuarios([
    usuario('doc-f1', Rol.DOCENTE, F1),
    usuario('doc-f2', Rol.DOCENTE, F2),
    usuario('admin-1', Rol.ADMIN_FACULTAD, F1),
  ]);
  return { roles, service: new AsignarRolInstitucionalService(usuarios, roles, () => ahora) };
}

describe('AsignarRolInstitucionalService (FSD-UC-009)', () => {
  it('un Admin. Facultad asigna un rol a un docente de su facultad y queda el actor y la fecha', async () => {
    const { roles, service } = armar();

    const r = await service.asignar({ docenteId: 'doc-f1', rolInstitucional: RolInstitucional.INVESTIGADOR }, adminF1);

    expect(r).toEqual({ docenteId: 'doc-f1', rolAnterior: null, rolNuevo: RolInstitucional.INVESTIGADOR });
    expect(roles.cambios).toEqual([
      { docenteId: 'doc-f1', rolNuevo: RolInstitucional.INVESTIGADOR, actorId: 'admin-1', timestamp: ahora },
    ]);
  });

  it('RB-05: un docente de otra facultad lanza CROSS_FACULTY_FORBIDDEN y no cambia nada', async () => {
    const { roles, service } = armar();

    await expect(
      service.asignar({ docenteId: 'doc-f2', rolInstitucional: RolInstitucional.AUTORIDAD }, adminF1)
    ).rejects.toMatchObject({ code: 'CROSS_FACULTY_FORBIDDEN', httpStatus: 403 });
    expect(roles.cambios).toHaveLength(0);
  });

  it('un Admin. Sistema puede asignar a un docente de cualquier facultad', async () => {
    const { service } = armar();
    const adminSistema: ActorContext = { userId: 'sys', rol: Rol.ADMIN_SISTEMA, facultadId: F1 };

    const r = await service.asignar({ docenteId: 'doc-f2', rolInstitucional: RolInstitucional.ADMINISTRATIVO }, adminSistema);

    expect(r.rolNuevo).toBe(RolInstitucional.ADMINISTRATIVO);
  });

  it('null revoca el rol y devuelve el anterior', async () => {
    const { service } = armar();
    await service.asignar({ docenteId: 'doc-f1', rolInstitucional: RolInstitucional.AUTORIDAD }, adminF1);

    const r = await service.asignar({ docenteId: 'doc-f1', rolInstitucional: null }, adminF1);

    expect(r).toEqual({ docenteId: 'doc-f1', rolAnterior: RolInstitucional.AUTORIDAD, rolNuevo: null });
  });

  it('un rol que no existe lanza ValidationError (422)', async () => {
    const { service } = armar();

    await expect(
      service.asignar({ docenteId: 'doc-f1', rolInstitucional: 'REY' as RolInstitucional }, adminF1)
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('un docente inexistente, o un usuario que no es docente, lanza NotFoundError', async () => {
    const { service } = armar();

    await expect(service.asignar({ docenteId: 'nadie', rolInstitucional: RolInstitucional.AUTORIDAD }, adminF1)).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.asignar({ docenteId: 'admin-1', rolInstitucional: RolInstitucional.AUTORIDAD }, adminF1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('un DOCENTE o TECNICO_DPA no puede asignar roles', async () => {
    const { service } = armar();
    const docente: ActorContext = { userId: 'doc-f1', rol: Rol.DOCENTE, facultadId: F1 };

    await expect(service.asignar({ docenteId: 'doc-f1', rolInstitucional: RolInstitucional.AUTORIDAD }, docente)).rejects.toBeInstanceOf(ForbiddenError);
  });
});
