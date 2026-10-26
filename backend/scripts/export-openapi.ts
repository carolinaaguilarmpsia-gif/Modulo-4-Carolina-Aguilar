import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { construirDocumentoOpenApi } from '../api/openapi/document.js';

/**
 * Exporta el contrato generado desde el código a `openapi.json` (raíz del repositorio).
 *   npm run openapi:export          → escribe el archivo
 *   npm run openapi:check           → falla (código 1) si el archivo versionado difiere del código (drift)
 */
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const destino = resolve(raiz, 'openapi.json');
const generado = `${JSON.stringify(construirDocumentoOpenApi(), null, 2)}\n`;

if (process.argv.includes('--check')) {
  let actual = '';
  try {
    actual = readFileSync(destino, 'utf-8');
  } catch {
    // no existe: se trata como drift
  }
  if (actual !== generado) {
    console.error('DRIFT: openapi.json no coincide con lo que genera el código. Ejecute `npm run openapi:export` y haga commit.');
    process.exit(1);
  }
  console.info('openapi.json coincide con el código.');
} else {
  writeFileSync(destino, generado, 'utf-8');
  console.info(`Contrato exportado a ${destino}`);
}
