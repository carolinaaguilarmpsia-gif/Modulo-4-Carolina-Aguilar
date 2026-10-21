// spec: e2e/specs/C-listado-creacion.plan.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';
import { CUENTAS, loginUI } from './fixtures';

test.describe('Declaraciones juradas — listado y creación', () => {
  test('Listado vacío', async ({ page }) => {
    // 1. Login como docente sin DJ registradas
    await loginUI(page, CUENTAS.docente.email, CUENTAS.docente.password);

    // Resultado esperado: aviso de listado vacío + link para crear la primera
    await expect(page.getByText('Sin declaraciones')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nueva declaración' })).toBeVisible();
  });

  test('Crear DJ con datos válidos', async ({ page }) => {
    // 1. Login como docente
    await loginUI(page, CUENTAS.docente.email, CUENTAS.docente.password);
    // 2. Ir a "Nueva declaración"
    await page.getByRole('link', { name: 'Nueva declaración' }).click();
    // 3. Completar los campos obligatorios
    await page.getByLabel('Cargo institucional').fill('Docente Titular — dato propio del test E2E');
    await page.getByLabel('Descripción de actividades').fill('Actividades declaradas por el test E2E, con más de veinte caracteres.');
    // 4. Guardar como borrador
    await page.getByRole('button', { name: 'Guardar como borrador' }).click();

    // Resultado esperado: alerta de éxito y redirección al detalle en BORRADOR
    await expect(page.getByText('Declaración jurada creada correctamente')).toBeVisible();
    await expect(page).toHaveURL(/\/declaraciones-juradas\/[\w-]+$/, { timeout: 5000 });
    await expect(page.getByTestId('dj-estado-actual')).toHaveAttribute('data-estado', 'BORRADOR');
  });

  test('Descripción de actividades demasiado corta no navega', async ({ page }) => {
    // 1. Login como docente
    await loginUI(page, CUENTAS.docente.email, CUENTAS.docente.password);
    // 2. Ir a "Nueva declaración"
    await page.getByRole('link', { name: 'Nueva declaración' }).click();
    // 3. Completar cargo, pero una descripción de menos de 20 caracteres
    await page.getByLabel('Cargo institucional').fill('Docente');
    await page.getByLabel('Descripción de actividades').fill('muy corta');
    // 4. Intentar guardar
    await page.getByRole('button', { name: 'Guardar como borrador' }).click();

    // Resultado esperado: error de validación de campo, sigue en el formulario
    await expect(page.getByText('Describa sus actividades (mínimo 20 caracteres)')).toBeVisible();
    await expect(page).toHaveURL(/\/declaraciones-juradas\/nueva$/);
  });

  test('El código de referencia se autogenera con el patrón esperado', async ({ page }) => {
    // 1. Login como docente
    await loginUI(page, CUENTAS.docente.email, CUENTAS.docente.password);
    // 2. Ir a "Nueva declaración" (tipo LABORAL y período 2026-I son los valores iniciales)
    await page.getByRole('link', { name: 'Nueva declaración' }).click();

    // Resultado esperado: el campo de solo lectura sigue el patrón EXP-<TIPO>-<periodo>-<sufijo>,
    // NUNCA un valor exacto — el sufijo sale de Math.random() (createDjSchema.ts:97).
    await expect(page.getByLabel('Código de referencia')).toHaveValue(/^EXP-[A-Z]{3}-\d{4}-(I|II)-\d{4}$/);
  });
});
