import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cargarCatalogo, cargarDataset, cargarRespuestas, contextoDe, RAIZ, RUTA_RESULTADOS } from './dataset.js';
import { completitud, sinProhibidos } from './metricas.js';
import type { Caso, Juez } from './tipos.js';

export interface ResultadoCaso {
  caso: Caso;
  respuesta: string;
  camino: string | null | undefined;
  completitud: number;
  sinProhibidos: number;
  fidelidad: number | null;
  oracionesNoRespaldadas: string[];
  errorJuez?: string;
}

export interface Resumen {
  version: string;
  juez: string;
  resultados: ResultadoCaso[];
}

export interface Umbrales {
  completitud_promedio_minima: number;
  fidelidad_promedio_minima: number;
  casos_criticos: string;
  justificacion?: Record<string, string>;
}

/** Un caso aprueba si cumple las tres métricas al máximo. */
export const aprobado = (r: ResultadoCaso): boolean => r.completitud === 1 && r.sinProhibidos === 1 && r.fidelidad === 1;

export function promedio(resumen: Resumen, metrica: 'completitud' | 'sinProhibidos' | 'fidelidad'): number {
  const v = resumen.resultados.map((r) => r[metrica]).filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

export const criticosFallidos = (r: Resumen): string[] => r.resultados.filter((x) => x.caso.critico && !aprobado(x)).map((x) => x.caso.id);
export const erroresJuez = (r: Resumen): string[] => r.resultados.filter((x) => x.errorJuez).map((x) => x.caso.id);

export async function evaluar(version: string, juez: Juez): Promise<Resumen> {
  const respuestas = cargarRespuestas(version);
  const catalogo = cargarCatalogo();
  const resultados: ResultadoCaso[] = [];
  for (const caso of cargarDataset()) {
    const grabada = respuestas.get(caso.id);
    const respuesta = grabada?.respuesta ?? '';
    const v = await juez.fidelidad(respuesta, contextoDe(caso, catalogo));
    resultados.push({
      caso,
      respuesta,
      camino: grabada?.camino,
      completitud: completitud(caso, respuesta),
      sinProhibidos: sinProhibidos(caso, respuesta),
      fidelidad: v.puntaje,
      oracionesNoRespaldadas: v.detalle.filter((d) => !d.respaldada).map((d) => d.oracion),
      errorJuez: v.error,
    });
  }
  return { version, juez: juez.nombre, resultados };
}

export function cargarUmbrales(ruta = join(RAIZ, 'umbrales.json')): Umbrales {
  return JSON.parse(readFileSync(ruta, 'utf-8')) as Umbrales;
}

/** La compuerta: (pasa, motivos). Promedio = calidad general; críticos = el daño que no se diluye. */
export function compuerta(resumen: Resumen, umbrales: Umbrales): { pasa: boolean; motivos: string[] } {
  const motivos: string[] = [];
  const c = promedio(resumen, 'completitud');
  const f = promedio(resumen, 'fidelidad');
  if (c < umbrales.completitud_promedio_minima) motivos.push(`completitud promedio ${c.toFixed(2)} < ${umbrales.completitud_promedio_minima.toFixed(2)}`);
  if (f < umbrales.fidelidad_promedio_minima) motivos.push(`fidelidad promedio ${f.toFixed(2)} < ${umbrales.fidelidad_promedio_minima.toFixed(2)}`);
  const crit = criticosFallidos(resumen);
  if (crit.length) motivos.push(`casos críticos que fallan: ${crit.join(', ')}`);
  const err = erroresJuez(resumen);
  if (err.length) motivos.push(`el juez no pudo evaluar: ${err.join(', ')}`);
  return { pasa: motivos.length === 0, motivos };
}

export function escribirInforme(resumen: Resumen, pasa: boolean, motivos: string[], extra: string[] = []): string {
  mkdirSync(RUTA_RESULTADOS, { recursive: true });
  const ruta = join(RUTA_RESULTADOS, `informe_${resumen.version}_${resumen.juez}.md`);
  const fmt = (x: number | null) => (x === null ? '—' : x.toFixed(2));
  const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const lineas = [
    `# Informe de evaluación · versión ${resumen.version} · juez ${resumen.juez}`,
    `Fecha: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    '',
    `**Compuerta: ${pasa ? 'PASA' : 'NO PASA'}**${pasa ? '' : ' — ' + motivos.join('; ')}`,
    '',
    `Promedios: completitud ${promedio(resumen, 'completitud').toFixed(2)} · sin prohibidos ${promedio(resumen, 'sinProhibidos').toFixed(2)} · fidelidad ${promedio(resumen, 'fidelidad').toFixed(2)}`,
    ...extra,
    '',
    '| Caso | Tipo | Crítico | Camino | Completitud | Sin prohibidos | Fidelidad | Oraciones no respaldadas |',
    '|---|---|---|---|---|---|---|---|',
    ...resumen.resultados.map(
      (r) =>
        `| ${r.caso.id} | ${r.caso.tipo} | ${r.caso.critico ? 'sí' : ''} | ${r.camino ?? '—'} | ${fmt(r.completitud)} | ${fmt(r.sinProhibidos)} | ${fmt(r.fidelidad)} | ${esc(r.oracionesNoRespaldadas.join(' / ') || r.errorJuez || '')} |`
    ),
  ];
  writeFileSync(ruta, lineas.join('\n') + '\n', 'utf-8');
  return ruta;
}
