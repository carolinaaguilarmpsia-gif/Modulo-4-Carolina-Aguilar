import { expect, type APIRequestContext, type Page } from '@playwright/test';

/**
 * SGAI guarda la sesión SOLO en una variable de módulo en memoria (authStore.ts) — nunca en
 * localStorage/cookies, por diseño de seguridad (@see AGENTS.md). Esto significa que:
 *  - No existe storageState posible entre tests: cada test que necesita una sesión de UI
 *    tiene que loguearse de verdad a través del formulario, siempre.
 *  - Un `page.goto` directo a una URL profunda después de loguearse recarga la página y pierde
 *    la sesión (confirmado explorando en vivo) — hay que navegar por los links de la propia SPA.
 * Por eso `loginUI` hace el login real por formulario, y el "arrange" de datos (crear/transicionar
 * una DJ antes del test) se hace por API directa contra :3001, sin pasar por el navegador.
 */

const API_BASE = 'http://localhost:3001/api/v1';

export const CUENTAS = {
  docente: { email: 'docente@universidad.edu.bo', password: 'Demo1234!' },
  docenteVinculacionInactiva: { email: 'carlos.paz@universidad.edu.bo', password: 'Demo1234!' },
  adminFacultad: { email: 'admin.facultad@universidad.edu.bo', password: 'Demo1234!' },
} as const;

export async function loginUI(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Correo institucional').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
}

export async function tokenParaUI(request: APIRequestContext, email: string, password: string): Promise<string> {
  const res = await request.post(`${API_BASE}/auth/login`, { data: { email, password } });
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { token: string };
  return body.token;
}

/** Crea una DJ propia del test (datos únicos por `periodoAcademico`) como `docente`, vía API. */
export async function crearDjPropia(
  request: APIRequestContext,
  token: string,
  overrides: { periodoAcademico?: string } = {}
): Promise<{ id: string; estado: string }> {
  const res = await request.post(`${API_BASE}/declaraciones-juradas`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      tipo: 'LABORAL',
      periodoAcademico: overrides.periodoAcademico ?? '2026-I',
      camposFormulario: {
        dependencia: 'Facultad de Ciencias Económicas',
        cargoInstitucional: 'Docente — dato propio del test E2E',
        actividadesDescripcion: 'Actividades generadas por el test E2E, no son datos reales de producción.',
        declaracionVeracidad: true,
      },
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

/** Avanza una DJ propia hasta EN_REVISION_FACULTAD (comando ENVIAR, como el mismo docente dueño). */
export async function enviarAFacultad(request: APIRequestContext, token: string, djId: string): Promise<void> {
  const res = await request.patch(`${API_BASE}/declaraciones-juradas/${djId}/estado`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { comando: 'ENVIAR' },
  });
  expect(res.ok()).toBeTruthy();
}

/** Arma una DJ propia ya en EN_REVISION_FACULTAD, lista para que un Admin. Facultad actúe sobre ella. */
export async function crearDjEnRevisionFacultad(
  request: APIRequestContext,
  docenteToken: string,
  periodoAcademico: string
): Promise<string> {
  const { id } = await crearDjPropia(request, docenteToken, { periodoAcademico });
  await enviarAFacultad(request, docenteToken, id);
  return id;
}
