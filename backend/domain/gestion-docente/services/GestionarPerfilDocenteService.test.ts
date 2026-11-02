import { describe, expect, it } from '@jest/globals';
import { Rol } from '../../administracion/types/Rol.js';
import type { ActorContext } from '../../shared/types/ActorContext.js';
import type { IPerfilDocenteRepository } from '../ports/out/IPerfilDocenteRepository.js';
import type { PerfilDocente, SeccionPerfil } from '../types/PerfilDocente.js';
import { GestionarPerfilDocenteService } from './GestionarPerfilDocenteService.js';

class FakePerfiles implements IPerfilDocenteRepository {
  private readonly store = new Map<string, PerfilDocente>();
  async obtener(docenteId: string): Promise<PerfilDocente | null> { return this.store.get(docenteId) ?? null; }
  async upsertSeccion(docenteId: string, seccion: SeccionPerfil, data: unknown[], ahora: Date): Promise<PerfilDocente> {
    const base = this.store.get(docenteId) ?? {
      docenteId, formacion_academica: [], publicaciones: [], experiencia_docente: [], updatedAt: null,
    };
    const nuevo = { ...base, [seccion]: data, updatedAt: ahora };
    this.store.set(docenteId, nuevo);
    return nuevo;
  }
}

const ahora = new Date('2026-10-25T12:00:00Z');
const docente: ActorContext = { userId: 'doc-1', rol: Rol.DOCENTE, facultadId: 'f1' };
const adminSistema: ActorContext = { userId: 'sys-1', rol: Rol.ADMIN_SISTEMA, facultadId: 'f1' };
const formacion = [{ titulo: 'Msc. Informática', institucion: 'UMSS', anio: 2020 }];

function armar() {
  return new GestionarPerfilDocenteService(new FakePerfiles(), () => ahora);
}

describe('GestionarPerfilDocenteService (FSD-UC-006)', () => {
  it('el primer PATCH crea el perfil (UPSERT) y devuelve updatedAt', async () => {
    const service = armar();

    const perfil = await service.actualizarSeccion(docente, { seccion: 'formacion_academica', data: formacion });

    expect(perfil.docenteId).toBe('doc-1');
    expect(perfil.formacion_academica).toEqual(formacion);
    expect(perfil.publicaciones).toEqual([]);
    expect(perfil.updatedAt).toEqual(ahora);
  });

  it('editar una sección no pisa las demás', async () => {
    const service = armar();
    await service.actualizarSeccion(docente, { seccion: 'formacion_academica', data: formacion });

    const perfil = await service.actualizarSeccion(docente, {
      seccion: 'publicaciones',
      data: [{ titulo: 'Un artículo', anio: 2024 }],
    });

    expect(perfil.formacion_academica).toEqual(formacion);
    expect(perfil.publicaciones).toHaveLength(1);
  });

  it('RB-04: editar el perfil de otro docente lanza FORBIDDEN_PROFILE_EDIT', async () => {
    const service = armar();

    await expect(
      service.actualizarSeccion(docente, { seccion: 'formacion_academica', data: formacion, docenteId: 'otro-docente' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN_PROFILE_EDIT', httpStatus: 403 });
  });

  it('el Admin. Sistema es de solo lectura: editar lanza FORBIDDEN_PROFILE_EDIT', async () => {
    const service = armar();

    await expect(
      service.actualizarSeccion(adminSistema, { seccion: 'formacion_academica', data: formacion })
    ).rejects.toMatchObject({ code: 'FORBIDDEN_PROFILE_EDIT' });
  });

  it('un docente sin perfil recibe uno vacío, no un error', async () => {
    const service = armar();

    const perfil = await service.obtener(docente);

    expect(perfil).toEqual({
      docenteId: 'doc-1', formacion_academica: [], publicaciones: [], experiencia_docente: [], updatedAt: null,
    });
  });

  it('un docente no puede consultar el perfil de otro', async () => {
    const service = armar();

    await expect(service.obtener(docente, 'otro-docente')).rejects.toMatchObject({
      code: 'UNAUTHORIZED_DATA_ACCESS',
      httpStatus: 403,
    });
  });

  it('el Admin. Sistema consulta el perfil de un docente indicado, y debe indicarlo', async () => {
    const service = armar();
    await service.actualizarSeccion(docente, { seccion: 'formacion_academica', data: formacion });

    expect((await service.obtener(adminSistema, 'doc-1')).formacion_academica).toEqual(formacion);
    await expect(service.obtener(adminSistema)).rejects.toMatchObject({ code: 'DOCENTE_ID_REQUIRED', httpStatus: 422 });
  });
});
