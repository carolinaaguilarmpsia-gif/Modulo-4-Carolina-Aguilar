import { usuariosSemilla } from '../seedUsuarios.js';
import { FACULTAD_ECONOMICAS_ID, FACULTAD_ECONOMICAS_NOMBRE, FACULTAD_TECNOLOGIA_ID, FACULTAD_TECNOLOGIA_NOMBRE } from '../seedIds.js';
import type { PgPool } from './pool.js';

/**
 * Facultades y usuarios demo (clave `Demo1234!`). Es idempotente y no pisa la contraseña ni el
 * bloqueo de un usuario que ya existe. NO debe correr en producción: son cuentas conocidas.
 */
export async function sembrarUsuariosDemo(pool: PgPool): Promise<{ facultades: number; usuarios: number }> {
  const facultades = [
    { id: FACULTAD_ECONOMICAS_ID, nombre: FACULTAD_ECONOMICAS_NOMBRE },
    { id: FACULTAD_TECNOLOGIA_ID, nombre: FACULTAD_TECNOLOGIA_NOMBRE },
  ];
  const usuarios = usuariosSemilla();
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    for (const f of facultades) {
      await cliente.query('INSERT INTO facultades (id, nombre) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre', [f.id, f.nombre]);
    }
    for (const u of usuarios) {
      await cliente.query(
        `INSERT INTO usuarios (id, email, nombre_completo, password_hash_local, rol, facultad_id, vinculacion_activa, intentos_fallidos, bloqueado_hasta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, nombre_completo = EXCLUDED.nombre_completo,
           rol = EXCLUDED.rol, facultad_id = EXCLUDED.facultad_id, vinculacion_activa = EXCLUDED.vinculacion_activa`,
        [u.id, u.email, u.nombreCompleto, u.passwordHashLocal, u.rol, u.facultadId, u.vinculacionActiva, u.intentosFallidos, u.bloqueadoHasta]
      );
    }
    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
  return { facultades: facultades.length, usuarios: usuarios.length };
}
