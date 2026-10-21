import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Caso, RespuestaGrabada } from './tipos.js';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/**
 * Dos disposiciones, mismo código:
 *  · repo: evals/datos/ + evals/respuestas/ + backend/data/db.json
 *  · zip de entrega (M7_Evals_*): dataset/ + respuestas/ + evals/, con db.json dentro de dataset/
 */
const EN_REPO = existsSync(join(RAIZ, 'datos'));
export const RUTA_DB = EN_REPO ? resolve(RAIZ, '..', 'backend', 'data', 'db.json') : resolve(RAIZ, '..', 'dataset', 'db.json');
export const RUTA_DATASET = EN_REPO ? join(RAIZ, 'datos', 'dataset_dorado.jsonl') : resolve(RAIZ, '..', 'dataset', 'dataset_dorado.jsonl');
export const RUTA_ETIQUETAS = EN_REPO ? join(RAIZ, 'datos', 'etiquetas_humanas.csv') : resolve(RAIZ, '..', 'dataset', 'etiquetas_humanas.csv');
export const RUTA_RESPUESTAS = EN_REPO ? join(RAIZ, 'respuestas') : resolve(RAIZ, '..', 'respuestas');
export const RUTA_RESULTADOS = EN_REPO ? join(RAIZ, 'resultados') : resolve(RAIZ, 'resultados');

interface TramiteDb {
  codigo: string;
  nombre: string;
  normativa?: string;
  requisitos: string[];
  tiempo: string;
}

export function cargarDataset(ruta: string = RUTA_DATASET): Caso[] {
  return readFileSync(ruta, 'utf-8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as Caso);
}

/** Catálogo real: db.json es la fuente de verdad del asistente, también de la eval. */
export function cargarCatalogo(rutaDb: string = RUTA_DB): Map<string, TramiteDb & { departamento: string }> {
  const deps = JSON.parse(readFileSync(rutaDb, 'utf-8')) as { departamento: string; tramites: TramiteDb[] }[];
  const mapa = new Map<string, TramiteDb & { departamento: string }>();
  for (const d of deps) for (const t of d.tramites) mapa.set(t.codigo, { ...t, departamento: d.departamento });
  return mapa;
}

/** Texto de las fuentes del caso: lo que el asistente tenía que tener delante al responder. */
export function contextoDe(caso: Caso, catalogo = cargarCatalogo()): string {
  if (caso.fuentes.length === 0) {
    return 'Sin fuentes: la pregunta no corresponde a ningún trámite registrado en db.json.';
  }
  return caso.fuentes
    .map((codigo) => {
      const t = catalogo.get(codigo);
      if (!t) throw new Error(`El caso ${caso.id} cita el trámite ${codigo}, que no existe en db.json`);
      return [
        `${t.codigo} — ${t.nombre} (${t.departamento})`,
        'Requisitos:',
        ...t.requisitos.map((r) => `- ${r}`),
        `Tiempo: ${t.tiempo}`,
        t.normativa ? `Normativa: ${t.normativa}` : 'Normativa: (no registrada)',
      ].join('\n');
    })
    .join('\n\n');
}

export function cargarRespuestas(version: string): Map<string, RespuestaGrabada> {
  const ruta = join(RUTA_RESPUESTAS, `${version}.jsonl`);
  if (!existsSync(ruta)) {
    throw new Error(`No existe respuestas/${version}.jsonl. Generalo con: npx tsx evals/evaluar.ts generar ${version}`);
  }
  const filas = readFileSync(ruta, 'utf-8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as RespuestaGrabada);
  return new Map(filas.map((f) => [f.id, f]));
}

export function guardarRespuestas(version: string, filas: RespuestaGrabada[]): string {
  const ruta = join(RUTA_RESPUESTAS, `${version}.jsonl`);
  writeFileSync(ruta, filas.map((f) => JSON.stringify(f)).join('\n') + '\n', 'utf-8');
  return ruta;
}
