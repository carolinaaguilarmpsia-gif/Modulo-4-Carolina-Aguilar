// spec: e2e/specs/A-autenticacion.plan.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';
import { CUENTAS, loginUI } from './fixtures';

test.describe('Autenticación', () => {
  test('Login exitoso', async ({ page }) => {
    // 1. Ir a /login, completar credenciales válidas y enviar
    await loginUI(page, CUENTAS.docente.email, CUENTAS.docente.password);

    // Resultado esperado: aterriza en el listado de DJ propio
    await expect(page.getByRole('link', { name: 'Mis declaraciones' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mis declaraciones juradas' })).toBeVisible();
  });

  test('Login con contraseña incorrecta', async ({ page }) => {
    // 1. Ir a /login
    await page.goto('/login');
    // 2. Completar con credenciales inválidas
    await page.getByLabel('Correo institucional').fill(CUENTAS.docente.email);
    await page.getByLabel('Contraseña').fill('password-incorrecta');
    // 3. Enviar
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Resultado esperado: alerta de error, sigue en /login
    await expect(page.getByRole('alert').getByText('No se pudo iniciar sesión')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Cerrar sesión', async ({ page }) => {
    // 1. Login válido
    await loginUI(page, CUENTAS.docente.email, CUENTAS.docente.password);
    // 2. Cerrar sesión
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    // Resultado esperado: vuelve a /login, ya no se ve el listado
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('link', { name: 'Mis declaraciones' })).not.toBeVisible();
  });

  test('Acceso directo sin sesión redirige a login', async ({ page }) => {
    // 1. Sin loguearse, ir directo a una ruta protegida
    await page.goto('/declaraciones-juradas');

    // Resultado esperado: redirige a /login, no se ve el listado
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });
});
