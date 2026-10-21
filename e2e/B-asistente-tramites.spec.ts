// spec: e2e/specs/B-asistente-tramites.plan.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Asistente de trámites (chat público)', () => {
  test('Pregunta que matchea por keyword', async ({ page }) => {
    // 1. Ir a /login (el chat vive ahí, sin necesidad de sesión)
    await page.goto('/login');
    // 2. Escribir una pregunta que matchea un trámite por keyword
    await page.getByLabel('Escriba su pregunta sobre un trámite').fill('¿Qué requisitos necesito para el certificado de trabajo?');
    // 3. Enviar
    await page.getByRole('button', { name: 'Enviar' }).click();

    // Resultado esperado: nueva burbuja con etiqueta "Keyword" y fuente db.json
    const ultimaRespuesta = page.getByTestId('chat-message').last();
    await expect(ultimaRespuesta).toHaveAttribute('data-role', 'assistant');
    await expect(ultimaRespuesta).toContainText('Keyword');
    await expect(ultimaRespuesta).toContainText('Fuente: db.json');
  });

  test('Pregunta fuera de alcance', async ({ page }) => {
    // 1. Ir a /login
    await page.goto('/login');
    // 2. Escribir una pregunta que no corresponde a ningún trámite
    await page.getByLabel('Escriba su pregunta sobre un trámite').fill('¿Cuánto gana un docente a dedicación exclusiva?');
    // 3. Enviar
    await page.getByRole('button', { name: 'Enviar' }).click();

    // Resultado esperado: etiqueta "Fuera de alcance" + listado de trámites disponibles
    const ultimaRespuesta = page.getByTestId('chat-message').last();
    await expect(ultimaRespuesta).toContainText('Fuera de alcance');
    await expect(ultimaRespuesta).toContainText('No puedo responder eso');
  });
});
