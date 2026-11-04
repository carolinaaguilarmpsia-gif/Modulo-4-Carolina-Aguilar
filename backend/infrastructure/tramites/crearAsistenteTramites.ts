import type { IAsistenteTramites } from '../../domain/tramites-dpa/ports/in/IAsistenteTramites.js';
import type { ITramiteRepository } from '../../domain/tramites-dpa/ports/out/ITramiteRepository.js';
import { AsistenteTramitesService } from '../../domain/tramites-dpa/services/AsistenteTramitesService.js';
import { RetrieverSemanticoTramitesService } from '../../domain/tramites-dpa/services/RetrieverSemanticoTramitesService.js';
import { GroqClient } from '../ai/GroqClient.js';
import { OllamaEmbeddingsClient } from '../ai/OllamaEmbeddingsClient.js';
import { AsistenteTramitesEnProceso } from './AsistenteTramitesEnProceso.js';
import { AsistenteTramitesHttp } from './AsistenteTramitesHttp.js';

export type ModoTramites = 'proceso' | 'http';

export function leerModoTramites(env: NodeJS.ProcessEnv = process.env): ModoTramites {
  const modo = env.TRAMITES_MODO ?? 'proceso';
  if (modo !== 'proceso' && modo !== 'http') throw new Error(`TRAMITES_MODO inválido: "${modo}" (use proceso o http).`);
  return modo;
}

/** No falla el arranque si falta GROQ_API_KEY: el cliente real se crea en la primera pregunta. */
class LazyGroqClient {
  preguntar(prompt: string): Promise<string> {
    return new GroqClient().preguntar(prompt);
  }
}

/** Arma el módulo completo (router keyword → RAG → LLM) sobre un repositorio. Lo usan el monolito y main-tramites. */
export function crearServicioTramites(tramites: ITramiteRepository, env: NodeJS.ProcessEnv = process.env): AsistenteTramitesService {
  const iaHabilitada = env.IA_HABILITADA !== 'false';
  const retriever = iaHabilitada ? new RetrieverSemanticoTramitesService(new OllamaEmbeddingsClient(), tramites.listarTodos()) : null;
  return new AsistenteTramitesService(tramites, iaHabilitada ? new LazyGroqClient() : null, iaHabilitada, retriever);
}

/** Lado del consumidor: devuelve la forma elegida por TRAMITES_MODO. `tramites` solo hace falta en `proceso`. */
export function crearAsistenteTramites(tramites: ITramiteRepository | null, env: NodeJS.ProcessEnv = process.env): IAsistenteTramites {
  if (leerModoTramites(env) === 'http') {
    const baseUrl = env.TRAMITES_URL;
    if (!baseUrl) throw new Error('TRAMITES_URL es obligatorio con TRAMITES_MODO=http.');
    const numero = (v: string | undefined) => (v === undefined || v === '' ? undefined : Number(v));
    return new AsistenteTramitesHttp({
      baseUrl,
      ...(numero(env.TRAMITES_TIMEOUT_MS) !== undefined && { timeoutMs: numero(env.TRAMITES_TIMEOUT_MS)! }),
      ...(numero(env.TRAMITES_REINTENTOS) !== undefined && { reintentos: numero(env.TRAMITES_REINTENTOS)! }),
    });
  }
  if (!tramites) throw new Error('TRAMITES_MODO=proceso necesita el repositorio de trámites.');
  return new AsistenteTramitesEnProceso(crearServicioTramites(tramites, env));
}
