import type { IEmbeddingsClient } from '../ports/out/IEmbeddingsClient.js';
import type { TramiteConDepartamento } from '../types/Tramite.js';

/**
 * Cuánto tiene que parecerse la pregunta al trámite más cercano para confiar en el match.
 *
 * v3 (evals offline M7, dataset dorado de 18 casos, nomic-embed-text): 0.5 era demasiado laxo.
 * Medido: las preguntas que SÍ son de un trámite recuperan el correcto con 0.71–0.83; las que no
 * lo son (inversiones 0.61, pasaporte 0.52, inyección de prompt 0.67, datos personales 0.68) quedan
 * por debajo de 0.70 pero por encima de 0.5, por eso con 0.5 devolvían un trámite cualquiera.
 * Límite honesto: el hueco entre 0.68 (peor no-trámite) y 0.71 (peor trámite real) es angosto y
 * se midió sobre 18 casos; al crecer el dataset (S11, monitoreo) hay que volver a medirlo.
 * @see evals/README.md · evals/resultados/
 */
export const UMBRAL_SIMILITUD = 0.7;

/**
 * v3 — piso de corroboración para el LLM-router. El 3B propone un trámite; la similitud semántica
 * lo corrobora o lo veta. Medido: el trámite que el LLM elegía para «¿cómo saco mi pasaporte?»
 * (DPA-01) da 0.47; el correcto para una orden real de designación (DCA-04) da 0.68.
 * Límite honesto: dos puntos de medición, no una curva. Revisar con más casos (S11).
 */
export const UMBRAL_CORROBORACION_LLM = 0.55;

export interface MatchSemantico {
  codigo: string;
  similitud: number;
}

interface ChunkIndexado {
  codigo: string;
  vector: number[];
}

/** Un trámite entero es la unidad de recuperación — cada uno ya es un documento corto y autocontenido, no hace falta partirlo en fragmentos más chicos. */
function construirChunk(t: TramiteConDepartamento): string {
  return [
    t.nombre,
    t.departamento,
    t.descripcion ?? '',
    `Requisitos: ${t.requisitos.join('; ')}`,
    t.normativa ? `Normativa: ${t.normativa}` : '',
    `Tiempo: ${t.tiempo}`,
  ]
    .filter(Boolean)
    .join('. ');
}

function similitudCoseno(a: number[], b: number[]): number {
  let producto = 0;
  let normaA = 0;
  let normaB = 0;
  for (let i = 0; i < a.length; i++) {
    producto += a[i] * b[i];
    normaA += a[i] * a[i];
    normaB += b[i] * b[i];
  }
  if (normaA === 0 || normaB === 0) return 0;
  return producto / (Math.sqrt(normaA) * Math.sqrt(normaB));
}

/**
 * RAG del asistente de trámites — Nivel 3 de la escalera: recuperación por embeddings (no
 * keyword), con umbral de confianza explícito. Top-k=1: cada trámite es un documento atómico,
 * no hay fragmentos parciales que combinar.
 *
 * El índice (un embedding por trámite) se calcula una sola vez y se cachea en memoria — mismo
 * patrón que los repositorios In-Memory del resto del backend, solo que acá lo que se cachea es
 * el resultado de una llamada a un modelo, no datos de un repositorio.
 * @see AsistenteTramitesService — paso 2 del router (entre keyword y el LLM-router de tools)
 */
export class RetrieverSemanticoTramitesService {
  private indice: Promise<ChunkIndexado[]> | null = null;

  constructor(
    private readonly embeddings: IEmbeddingsClient,
    private readonly tramites: TramiteConDepartamento[],
    private readonly umbral: number = UMBRAL_SIMILITUD
  ) {}

  async buscar(pregunta: string): Promise<MatchSemantico | null> {
    const [indice, vectorPregunta] = await Promise.all([this.obtenerIndice(), this.embeddings.embed(pregunta)]);

    let mejor: MatchSemantico | null = null;
    for (const chunk of indice) {
      const similitud = similitudCoseno(vectorPregunta, chunk.vector);
      if (!mejor || similitud > mejor.similitud) {
        mejor = { codigo: chunk.codigo, similitud };
      }
    }

    return mejor && mejor.similitud >= this.umbral ? mejor : null;
  }

  /** Similitud coseno entre la pregunta y UN trámite concreto (para corroborar la decisión del LLM). */
  async similitudCon(pregunta: string, codigo: string): Promise<number> {
    const [indice, vectorPregunta] = await Promise.all([this.obtenerIndice(), this.embeddings.embed(pregunta)]);
    const chunk = indice.find((c) => c.codigo === codigo);
    return chunk ? similitudCoseno(vectorPregunta, chunk.vector) : 0;
  }

  private obtenerIndice(): Promise<ChunkIndexado[]> {
    if (!this.indice) {
      this.indice = Promise.all(
        this.tramites.map(async (t) => ({ codigo: t.codigo, vector: await this.embeddings.embed(construirChunk(t)) }))
      );
    }
    return this.indice;
  }
}
