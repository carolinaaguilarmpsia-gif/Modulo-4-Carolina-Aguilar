import type { Usuario } from '../../domain/administracion/entities/Usuario.js';
import type { IUsuarioRepository } from '../../domain/administracion/ports/out/IUsuarioRepository.js';
import { usuariosSemilla } from './seedUsuarios.js';

/** Repositorio in-memory — demo/desarrollo sin PostgreSQL. @see DD-UC-002 §4 (reemplazar por PrismaUsuarioRepository) */
export class InMemoryUsuarioRepository implements IUsuarioRepository {
  private readonly store = new Map<string, Usuario>(usuariosSemilla().map((u) => [u.email, u]));

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = this.store.get(email);
    return usuario ? { ...usuario } : null;
  }

  async listar(): Promise<Usuario[]> {
    return [...this.store.values()].map((u) => ({ ...u }));
  }

  async registrarIntentoFallido(
    userId: string,
    params: { intentosFallidos: number; bloqueadoHasta: Date | null }
  ): Promise<void> {
    const usuario = this.buscarPorId(userId);
    if (!usuario) return;

    usuario.intentosFallidos = params.intentosFallidos;
    usuario.bloqueadoHasta = params.bloqueadoHasta;
  }

  async registrarLoginExitoso(userId: string): Promise<void> {
    const usuario = this.buscarPorId(userId);
    if (!usuario) return;

    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = null;
  }

  private buscarPorId(userId: string): Usuario | undefined {
    return [...this.store.values()].find((u) => u.id === userId);
  }
}
