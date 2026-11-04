import type { Usuario } from '../../domain/administracion/entities/Usuario.js';
import type { IUsuarioRepository } from '../../domain/administracion/ports/out/IUsuarioRepository.js';
import type { Rol } from '../../domain/administracion/types/Rol.js';
import type { PgPool } from './postgres/pool.js';

interface FilaUsuario {
  id: string;
  email: string;
  nombre_completo: string;
  password_hash_local: string;
  rol: Rol;
  facultad_id: string;
  vinculacion_activa: boolean;
  intentos_fallidos: number;
  bloqueado_hasta: Date | null;
}

function aUsuario(f: FilaUsuario): Usuario {
  return {
    id: f.id,
    email: f.email,
    nombreCompleto: f.nombre_completo,
    passwordHashLocal: f.password_hash_local,
    rol: f.rol,
    facultadId: f.facultad_id,
    vinculacionActiva: f.vinculacion_activa,
    intentosFallidos: f.intentos_fallidos,
    bloqueadoHasta: f.bloqueado_hasta,
  };
}

export class PgUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly pool: PgPool) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    const { rows } = await this.pool.query<FilaUsuario>('SELECT * FROM usuarios WHERE email = $1', [email]);
    return rows[0] ? aUsuario(rows[0]) : null;
  }

  async listar(): Promise<Usuario[]> {
    const { rows } = await this.pool.query<FilaUsuario>('SELECT * FROM usuarios ORDER BY nombre_completo, id');
    return rows.map(aUsuario);
  }

  async registrarIntentoFallido(userId: string, params: { intentosFallidos: number; bloqueadoHasta: Date | null }): Promise<void> {
    await this.pool.query('UPDATE usuarios SET intentos_fallidos = $2, bloqueado_hasta = $3 WHERE id = $1', [
      userId,
      params.intentosFallidos,
      params.bloqueadoHasta,
    ]);
  }

  async registrarLoginExitoso(userId: string): Promise<void> {
    await this.pool.query('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1', [userId]);
  }
}
