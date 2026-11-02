import rateLimit from 'express-rate-limit';

/**
 * Defensa adicional a nivel de aplicación en POST /auth/login — complementa
 * (no reemplaza) el rate limiting de Nginx descrito en DTI vFinal §13.1.
 * @see docs/SKILLS/auth-rbac-guard.md
 */
// AUTH_RATE_LIMIT_MAX — configurable para no romper una suite E2E que loguea muchas veces por
// corrida (cada test necesita su propia sesión real, @see e2e/fixtures.ts). Default 20, sin
// cambios para producción; en desarrollo/E2E se sube vía backend/.env.
//
// `limit` es una función (no un número fijo) a propósito: este módulo se importa — y por lo
// tanto se evalúa — ANTES de que `loadEnvFile()` corra en app.ts (los imports de ES modules se
// resuelven antes que el cuerpo del módulo que importa), así que leer process.env acá arriba
// siempre veía la env todavía vacía y el override nunca surtía efecto. Evaluando la env recién
// en cada request, ya después de loadEnvFile(), el valor de backend/.env se respeta de verdad.
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: () => Number(process.env.AUTH_RATE_LIMIT_MAX ?? 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos de login. Intente más tarde.' },
});
