/** Orígenes de desarrollo (Vite salta al 5174 si el 5173 está ocupado). */
export const CORS_ORIGINS_POR_DEFECTO = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

/**
 * Lee CORS_ORIGINS (lista separada por comas). Sin la variable, usa los de desarrollo.
 * @see docs/auditoria/12factor.md F12-01
 */
export function leerCorsOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const lista = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  return lista.length > 0 ? lista : CORS_ORIGINS_POR_DEFECTO;
}
