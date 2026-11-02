import { randomBytes } from 'node:crypto';

/**
 * Resuelve el secreto de JWT. En producción es obligatorio: sin él, cada reinicio (o cada
 * instancia) generaría un secreto distinto e invalidaría los tokens ya emitidos.
 * Fuera de producción conserva el secreto efímero para desarrollo y pruebas locales.
 * @see docs/auditoria/12factor.md F12-01
 */
export function resolverJwtSecret(env: NodeJS.ProcessEnv = process.env): string {
  const secreto = env.JWT_SECRET;
  if (secreto) return secreto;

  if (env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET es obligatorio en producción. Defínelo en el entorno (ver backend/.env.example).'
    );
  }

  console.warn('[SGAI] JWT_SECRET no configurado en .env — usando secreto efímero solo para desarrollo local.');
  return randomBytes(32).toString('hex');
}
