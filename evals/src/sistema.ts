import { resolve } from 'node:path';
import { OllamaClient } from '../../backend/infrastructure/ai/OllamaClient.js';
import { OllamaEmbeddingsClient } from '../../backend/infrastructure/ai/OllamaEmbeddingsClient.js';
import { JsonTramiteRepository } from '../../backend/infrastructure/persistence/JsonTramiteRepository.js';
import { AsistenteTramitesService } from '../../backend/domain/tramites-dpa/services/AsistenteTramitesService.js';
import { RetrieverSemanticoTramitesService } from '../../backend/domain/tramites-dpa/services/RetrieverSemanticoTramitesService.js';
import { RUTA_DB } from './dataset.js';

/**
 * Versiones del SISTEMA que se comparan. El asistente nunca deja que el LLM redacte la respuesta:
 * la arma en código desde db.json. Lo que cambia entre versiones es el ROUTER (qué trámite elige).
 *
 *  v1 · solo keyword      → iaHabilitada=false, sin RAG ni LLM.            [CONGELADA]
 *  v2 · router completo   → keyword → RAG → LLM-router → fuera de alcance. [CONGELADA]
 *  v3 · v2 corregida      → el código actual del backend: umbral RAG 0.70, guard de fuera de
 *                           alcance/seguridad antes de RAG y LLM, «sin dato» para costos y
 *                           keyword «nombramiento» (ver backend/domain/tramites-dpa).
 *
 * v1 y v2 se grabaron con el código anterior a v3 (commit 62da628). Sus respuestas viven en
 * respuestas/*.jsonl y NO se regeneran: con el código corregido ya no serían las mismas, y
 * reescribirlas sería borrar la evidencia de lo que falló.
 */
export function crearSistema(version: string): AsistenteTramitesService {
  if (version === 'v1' || version === 'v2') {
    throw new Error(`${version} está congelada: sus respuestas se grabaron con el código previo a v3 (commit 62da628) y no se regeneran. Solo se puede generar v3.`);
  }
  if (version !== 'v3') throw new Error(`Versión desconocida "${version}". Solo v3 se puede generar (v1 y v2 están grabadas).`);
  const repo = new JsonTramiteRepository(resolve(RUTA_DB));
  const retriever = new RetrieverSemanticoTramitesService(new OllamaEmbeddingsClient(), repo.listarTodos());
  return new AsistenteTramitesService(repo, new OllamaClient(), true, retriever);
}
