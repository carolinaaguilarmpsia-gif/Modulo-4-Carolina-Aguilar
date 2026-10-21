// spec: e2e/specs/D-transiciones.plan.md
// seed: e2e/seed.spec.ts
//
// Nota de diseño (hallazgo de la auditoría, ver e2e/specs/data-testid-agregados.md):
// - El listado de DJ no muestra el id en ningún texto visible (solo Período/Tipo/Estado/
//   Actualizado/Acción) y el backend guarda todo en memoria durante la vida del proceso — la
//   bandeja de un rol puede tener varias DJ con el mismo período/estado (semilla + las que van
//   creando otros tests). `.first()` sobre "Ver detalle" sería frágil e inestable entre corridas.
// - Se agregó `data-testid="dj-row-<id>"` a cada fila (ListaDeclaracionesJuradasPage.tsx) para que
//   cada test ubique EXACTAMENTE su propia DJ, sin importar qué más haya en la bandeja.
import { test, expect } from '@playwright/test';
import { CUENTAS, crearDjEnRevisionFacultad, crearDjPropia, loginUI, tokenParaUI } from './fixtures';

test.describe('Transiciones de estado de DJ', () => {
  test('Docente envía su DJ a Facultad', async ({ page, request }) => {
    // Arrange: crear una DJ propia en BORRADOR, vía API, antes de tocar el navegador
    const token = await tokenParaUI(request, CUENTAS.docente.email, CUENTAS.docente.password);
    const dj = await crearDjPropia(request, token, { periodoAcademico: '2026-I' });

    // 1. Login UI como el mismo docente
    await loginUI(page, CUENTAS.docente.email, CUENTAS.docente.password);
    // 2. Abrir el detalle de ESA DJ puntual desde el listado (nunca por goto directo a la URL)
    await page.getByTestId(`dj-row-${dj.id}`).getByRole('link', { name: 'Ver detalle' }).click();
    // 3. Enviar a Facultad
    await page.getByRole('button', { name: 'Enviar a Facultad' }).click();

    // Resultado esperado: badge "En revisión — Facultad" + fila nueva en el historial
    await expect(page.getByTestId('dj-estado-actual')).toHaveAttribute('data-estado', 'EN_REVISION_FACULTAD');
    await expect(page.getByRole('row', { name: /Borrador.*En revisión — Facultad/ })).toBeVisible();
  });

  test('Admin. Facultad aprueba una DJ en revisión de su facultad', async ({ page, request }) => {
    // Arrange: DJ propia ya en EN_REVISION_FACULTAD (misma facultad que el admin)
    const docenteToken = await tokenParaUI(request, CUENTAS.docente.email, CUENTAS.docente.password);
    const djId = await crearDjEnRevisionFacultad(request, docenteToken, '2026-I');

    // 1. Login UI como Admin. Facultad
    await loginUI(page, CUENTAS.adminFacultad.email, CUENTAS.adminFacultad.password);
    // 2. Abrir ESA DJ puntual en la bandeja de revisión
    await page.getByTestId(`dj-row-${djId}`).getByRole('link', { name: 'Ver detalle' }).click();
    // 3. Aprobar
    await page.getByRole('button', { name: 'Aprobar' }).click();

    // Resultado esperado: badge "Aprobada" + panel de acciones muestra "Trámite cerrado"
    await expect(page.getByTestId('dj-estado-actual')).toHaveAttribute('data-estado', 'APROBADA');
    await expect(page.getByText('Trámite cerrado')).toBeVisible();
  });

  test('Devolver exige al menos 10 caracteres de observaciones', async ({ page, request }) => {
    // Arrange: otra DJ propia en EN_REVISION_FACULTAD
    const docenteToken = await tokenParaUI(request, CUENTAS.docente.email, CUENTAS.docente.password);
    const djId = await crearDjEnRevisionFacultad(request, docenteToken, '2026-II');

    // 1. Login UI como Admin. Facultad
    await loginUI(page, CUENTAS.adminFacultad.email, CUENTAS.adminFacultad.password);
    // 2. Abrir ESA DJ puntual
    await page.getByTestId(`dj-row-${djId}`).getByRole('link', { name: 'Ver detalle' }).click();
    // 3. Click en "Devolver con observaciones"
    await page.getByRole('button', { name: 'Devolver con observaciones' }).click();

    // El botón "Confirmar" debe estar deshabilitado sin observaciones
    await expect(page.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
    // 4. Escribir menos de 10 caracteres — sigue deshabilitado
    await page.getByLabel(/Observaciones/).fill('corto');
    await expect(page.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
    // 5. Completar 10+ caracteres y confirmar
    await page.getByLabel(/Observaciones/).fill('Faltan datos por completar en el formulario.');
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Resultado esperado: badge "Devuelta"
    await expect(page.getByTestId('dj-estado-actual')).toHaveAttribute('data-estado', 'DEVUELTA');
  });

  test('Docente con vinculación inactiva no puede crear una DJ', async ({ page }) => {
    // 1. Login UI como Carlos Paz (vinculación inactiva)
    await loginUI(page, CUENTAS.docenteVinculacionInactiva.email, CUENTAS.docenteVinculacionInactiva.password);
    // 2. Ir a "Nueva declaración" y completar el formulario válido
    await page.getByRole('link', { name: 'Nueva declaración' }).click();
    await page.getByLabel('Cargo institucional').fill('Docente — dato propio del test E2E');
    await page.getByLabel('Descripción de actividades').fill('Actividades declaradas por el test E2E, con más de veinte caracteres.');
    // 3. Intentar guardar
    await page.getByRole('button', { name: 'Guardar como borrador' }).click();

    // Resultado esperado: aviso de vinculación inactiva (RB-01), no navega
    await expect(page.getByText('Vinculación inactiva')).toBeVisible();
    await expect(page).toHaveURL(/\/declaraciones-juradas\/nueva$/);
  });
});
