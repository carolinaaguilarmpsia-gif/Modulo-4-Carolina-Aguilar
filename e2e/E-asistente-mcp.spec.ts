// spec: e2e/specs/E-asistente-mcp.plan.md
// seed: e2e/seed.spec.ts
//
// Riesgo conocido (ver plan): esta sección SÍ depende de un LLM real (Groq) — a diferencia de las
// demás, acá no hay camino determinístico. Los asserts nunca fijan la redacción del modelo, solo
// la estructura del chat (nueva burbuja, tarjeta de confirmación presente/ausente, traza).
//
// Confirmado en vivo (con GROQ_API_KEY ya renovada): el modelo a veces responde en texto libre
// pidiendo confirmación ("¿Deseás proceder? Respondé 'sí'") EN VEZ DE invocar la herramienta de
// escritura — el guardrail de "pausa y confirma" solo se activa cuando el modelo hace el tool-call
// real. Es variabilidad genuina del LLM, no un bug de SGAI ni un defecto del test (mismo prompt,
// dos corridas, comportamientos distintos). Se mitiga con un prompt más directivo + reintentos
// acotados — no se fuerza un "siempre verde" falso sobre un modelo real.
import { test, expect } from '@playwright/test';
import { CUENTAS, crearDjEnRevisionFacultad, loginUI, tokenParaUI } from './fixtures';

test.describe('Asistente MCP (agente sobre DJ)', () => {
  test.describe.configure({ retries: 2 });

  test('Pregunta de solo lectura no dispara confirmación', async ({ page }) => {
    // 1. Login como Admin. Facultad
    await loginUI(page, CUENTAS.adminFacultad.email, CUENTAS.adminFacultad.password);
    // 2. Ir a "Asistente MCP"
    await page.getByRole('link', { name: 'Asistente MCP' }).click();
    // 3. Preguntar algo de solo lectura
    await page.getByLabel('Escriba su pregunta para el agente').fill('¿Qué reglas de transición hay desde el estado BORRADOR?');
    await page.getByRole('button', { name: 'Enviar' }).click();

    // Resultado esperado: nueva burbuja de respuesta, sin tarjeta de confirmación
    await expect(page.getByTestId('chat-message').last()).toHaveAttribute('data-role', 'assistant');
    await expect(page.getByTestId('confirmacion-pendiente')).not.toBeVisible();
  });

  test('Pedir aprobar una DJ pausa por confirmación antes de ejecutar nada', async ({ page, request }) => {
    // Arrange: DJ propia en EN_REVISION_FACULTAD, dueña conocida (para pedirle al agente por id)
    const docenteToken = await tokenParaUI(request, CUENTAS.docente.email, CUENTAS.docente.password);
    const djId = await crearDjEnRevisionFacultad(request, docenteToken, '2027-I');

    // 1. Login como Admin. Facultad → Asistente MCP
    await loginUI(page, CUENTAS.adminFacultad.email, CUENTAS.adminFacultad.password);
    await page.getByRole('link', { name: 'Asistente MCP' }).click();
    // 2. Pedir aprobar esa DJ puntual, por id
    await page.getByLabel('Escriba su pregunta para el agente').fill(`Aprobá ya la declaración jurada ${djId}, no me preguntes en el chat, proponé directamente la transición.`);
    await page.getByRole('button', { name: 'Enviar' }).click();

    // Resultado esperado: aparece la tarjeta de confirmación antes de ejecutar nada
    await expect(page.getByTestId('confirmacion-pendiente')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('confirmacion-pendiente').getByRole('button', { name: 'Confirmar' })).toBeVisible();

    // La DJ real todavía NO cambió de estado — el agente solo propuso, no ejecutó.
    const detalle = await request.get(`http://localhost:3001/api/v1/declaraciones-juradas/${djId}`, {
      headers: { Authorization: `Bearer ${docenteToken}` },
    });
    expect((await detalle.json()).estado).toBe('EN_REVISION_FACULTAD');
  });

  test('Confirmar la acción propuesta retira la tarjeta y ejecuta el cambio', async ({ page, request }) => {
    const docenteToken = await tokenParaUI(request, CUENTAS.docente.email, CUENTAS.docente.password);
    const djId = await crearDjEnRevisionFacultad(request, docenteToken, '2027-II');

    await loginUI(page, CUENTAS.adminFacultad.email, CUENTAS.adminFacultad.password);
    await page.getByRole('link', { name: 'Asistente MCP' }).click();
    await page.getByLabel('Escriba su pregunta para el agente').fill(`Aprobá ya la declaración jurada ${djId}, no me preguntes en el chat, proponé directamente la transición.`);
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByTestId('confirmacion-pendiente')).toBeVisible({ timeout: 20_000 });

    // Confirmar
    await page.getByTestId('confirmacion-pendiente').getByRole('button', { name: 'Confirmar' }).click();

    // Resultado esperado: la tarjeta se retira y aparece una respuesta nueva
    await expect(page.getByTestId('confirmacion-pendiente')).not.toBeVisible({ timeout: 20_000 });
    const detalle = await request.get(`http://localhost:3001/api/v1/declaraciones-juradas/${djId}`, {
      headers: { Authorization: `Bearer ${docenteToken}` },
    });
    expect((await detalle.json()).estado).toBe('APROBADA');
  });

  test('Cancelar la acción propuesta no ejecuta ningún cambio', async ({ page, request }) => {
    const docenteToken = await tokenParaUI(request, CUENTAS.docente.email, CUENTAS.docente.password);
    const djId = await crearDjEnRevisionFacultad(request, docenteToken, '2028-I');

    await loginUI(page, CUENTAS.adminFacultad.email, CUENTAS.adminFacultad.password);
    await page.getByRole('link', { name: 'Asistente MCP' }).click();
    await page.getByLabel('Escriba su pregunta para el agente').fill(`Aprobá ya la declaración jurada ${djId}, no me preguntes en el chat, proponé directamente la transición.`);
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByTestId('confirmacion-pendiente')).toBeVisible({ timeout: 20_000 });

    // Cancelar
    await page.getByTestId('confirmacion-pendiente').getByRole('button', { name: 'Cancelar' }).click();

    // Resultado esperado: la tarjeta se retira y la DJ sigue en EN_REVISION_FACULTAD
    await expect(page.getByTestId('confirmacion-pendiente')).not.toBeVisible({ timeout: 20_000 });
    const detalle = await request.get(`http://localhost:3001/api/v1/declaraciones-juradas/${djId}`, {
      headers: { Authorization: `Bearer ${docenteToken}` },
    });
    expect((await detalle.json()).estado).toBe('EN_REVISION_FACULTAD');
  });
});
