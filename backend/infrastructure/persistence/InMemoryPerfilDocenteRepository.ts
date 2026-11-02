import type { IPerfilDocenteRepository } from '../../domain/gestion-docente/ports/out/IPerfilDocenteRepository.js';
import type { PerfilDocente, SeccionPerfil } from '../../domain/gestion-docente/types/PerfilDocente.js';

/** Demo/desarrollo — in-memory como el resto de repos de SGAI. */
export class InMemoryPerfilDocenteRepository implements IPerfilDocenteRepository {
  private readonly store = new Map<string, PerfilDocente>();

  async obtener(docenteId: string): Promise<PerfilDocente | null> {
    const perfil = this.store.get(docenteId);
    return perfil ? { ...perfil } : null;
  }

  async upsertSeccion(docenteId: string, seccion: SeccionPerfil, data: unknown[], ahora: Date): Promise<PerfilDocente> {
    const actual: PerfilDocente = this.store.get(docenteId) ?? {
      docenteId,
      formacion_academica: [],
      publicaciones: [],
      experiencia_docente: [],
      updatedAt: null,
    };
    const actualizado: PerfilDocente = { ...actual, [seccion]: data, updatedAt: ahora };
    this.store.set(docenteId, actualizado);
    return { ...actualizado };
  }
}
