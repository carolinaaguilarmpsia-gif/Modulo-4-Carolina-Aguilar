import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ILlmClient } from '../ports/out/ILlmClient.js';
import type { IEmbeddingsClient } from '../ports/out/IEmbeddingsClient.js';
import { JsonTramiteRepository } from '../../../infrastructure/persistence/JsonTramiteRepository.js';
import { AsistenteTramitesService } from './AsistenteTramitesService.js';
import { RetrieverSemanticoTramitesService } from './RetrieverSemanticoTramitesService.js';

/**
 * Integración — Actividad 3, paso 5. Flujo real del producto:
 *
 *   entrada del usuario (pregunta en texto libre)
 *     → recuperación (JsonTramiteRepository leyendo un db.json REAL de disco,
 *       + RetrieverSemanticoTramitesService haciendo similitud coseno REAL sobre esos datos)
 *     → respuesta (AsistenteTramitesService armando el texto final desde el trámite recuperado)
 *
 * Lo único que se sustituye es la frontera de RED — el modelo de embeddings y el LLM-router,
 * que en producción llaman a Ollama/Groq — porque esta suite no puede depender de un servicio
 * externo levantado. Todo lo demás (lectura de archivo, índice, caché, similitud, armado de
 * la respuesta) es el código real, no un doble.
 *
 * @see AsistenteTramitesService.test.ts — la contraparte unitaria (fakes en memoria en cada capa)
 */
describe('AsistenteTramitesService — integración: archivo real + recuperación real', () => {
  let dir: string;
  let rutaDbJson: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'sgai-db-tramites-'));
    rutaDbJson = join(dir, 'db.json');
    // db.json real en disco — mismo shape que el de producción (backend/data/db.json).
    writeFileSync(
      rutaDbJson,
      JSON.stringify([
        {
          departamento: 'Personal Académico',
          tramites: [
            {
              codigo: 'DPA-01',
              nombre: 'Emisión de Certificado de Trabajo',
              requisitos: ['Carnet de identidad', 'Ítem asignado vigente'],
              tiempo: '1 día hábil (24 horas) antes.',
            },
          ],
        },
      ]),
      'utf-8'
    );
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('camino keyword: lee el trámite real desde el archivo real, sin pasar por RAG ni LLM', async () => {
    // Pieza real 1: el repositorio lee de VERDAD el archivo que acabamos de escribir en disco.
    const repo = new JsonTramiteRepository(rutaDbJson);
    const llm: ILlmClient = {
      preguntar: async () => {
        throw new Error('no debería llamarse — la pregunta matchea por keyword');
      },
    };
    const service = new AsistenteTramitesService(repo, llm, true, null);

    const resultado = await service.preguntar('¿Qué requisitos necesito para el certificado de trabajo?');

    // No solo el resultado final — el CAMINO recorrido: debe haber resuelto por keyword,
    // directo desde el archivo real, sin tocar ninguna pieza de IA.
    expect(resultado.camino).toBe('keyword');
    expect(resultado.fuente).toEqual({
      codigo: 'DPA-01',
      nombre: 'Emisión de Certificado de Trabajo',
      departamento: 'Personal Académico',
    });
    // El texto viene realmente del archivo (no de un fixture hardcodeado en el test):
    // si alguien cambia los requisitos en db.json, este assert lo detecta.
    expect(resultado.respuesta).toContain('Ítem asignado vigente');
  });

  it('camino RAG: recupera por similitud real (coseno) sobre el índice construido desde el archivo real', async () => {
    const repo = new JsonTramiteRepository(rutaDbJson);
    // Única pieza no-real: el vector que devolvería Ollama (frontera de red). La similitud
    // coseno que decide el match SÍ es el código real de RetrieverSemanticoTramitesService.
    const embeddings: IEmbeddingsClient = {
      embed: async (texto: string) => {
        if (texto.includes('Certificado de Trabajo')) return [1, 0];
        if (texto.includes('constancia laboral')) return [0.95, 0.05]; // muy cercano, sin overlap textual
        return [0, 1];
      },
    };
    const retriever = new RetrieverSemanticoTramitesService(embeddings, repo.listarTodos());
    const llm: ILlmClient = {
      preguntar: async () => {
        throw new Error('no debería llamarse — el RAG ya resolvió el trámite antes de llegar al LLM-router');
      },
    };
    const service = new AsistenteTramitesService(repo, llm, true, retriever);

    // "constancia laboral" no comparte ni una palabra con "Emisión de Certificado de Trabajo"
    // en el archivo — solo la similitud vectorial real (calculada por el código, no simulada)
    // puede resolver esto.
    const resultado = await service.preguntar('¿Qué necesito para que me den una constancia laboral?');

    expect(resultado.camino).toBe('rag');
    expect(resultado.similitud).toBeGreaterThan(0.9);
    expect(resultado.fuente?.codigo).toBe('DPA-01');
    expect(resultado.respuesta).toContain('Ítem asignado vigente');
  });
});
