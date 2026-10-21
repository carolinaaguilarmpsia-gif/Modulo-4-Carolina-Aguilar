/**
 * evaluar.ts — CLI de las evals offline del Asistente de Trámites DPA (M7 · Día 10).
 *
 *   npx tsx evals/evaluar.ts verificar                    ¿dataset y fuentes consistentes? (sin modelo)
 *   npx tsx evals/evaluar.ts generar v3                   corre el asistente y GRABA respuestas/v3.jsonl (v1 y v2 están congeladas)
 *   npx tsx evals/evaluar.ts correr v2 [--juez modelo]    métricas + compuerta (exit 0 = PASA, 1 = NO PASA)
 *   npx tsx evals/evaluar.ts comparar v1 v2 [--juez ...]  qué mejoró y qué empeoró entre versiones
 *   npx tsx evals/evaluar.ts etiquetar v2                 imprime respuesta + fuentes para etiquetar a mano
 *   npx tsx evals/evaluar.ts calibrar v2 [--juez modelo]  acuerdo y kappa del juez contra las personas
 *   npx tsx evals/evaluar.ts exportar <ruta.jsonl>        dataset con el contexto resuelto en cada caso */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { acuerdo, kappaCohen } from './src/calibracion.js';
import { writeFileSync } from 'node:fs';
import { cargarCatalogo, cargarDataset, cargarRespuestas, contextoDe, guardarRespuestas, RAIZ, RUTA_ETIQUETAS } from './src/dataset.js';
import { aprobado, cargarUmbrales, compuerta, escribirInforme, evaluar, promedio } from './src/evaluador.js';
import { JuezHeuristico, JuezModelo } from './src/juez.js';
import { costo, OllamaJuez } from './src/proveedor.js';
import type { Juez, RespuestaGrabada } from './src/tipos.js';

const [comando, ...resto] = process.argv.slice(2);
const posicionales = resto.filter((a) => !a.startsWith('--'));
const tipoJuez = resto.includes('--juez') ? resto[resto.indexOf('--juez') + 1] : 'heuristico';

function crearJuez(): Juez {
  if (tipoJuez === 'heuristico') return new JuezHeuristico();
  const ollama = new OllamaJuez();
  console.log(`Juez con modelo · ${ollama.modelo} (temperature 0)`);
  const juez = new JuezModelo(ollama);
  return {
    nombre: juez.nombre,
    async fidelidad(respuesta, contexto) {
      const t0 = Date.now();
      const v = await juez.fidelidad(respuesta, contexto);
      console.error(`  juez #${costo.llamadas} · ${((Date.now() - t0) / 1000).toFixed(1)}s · fidelidad ${v.puntaje ?? v.error}`);
      return v;
    },
  };
}

const fmt = (x: number | null) => (x === null ? ' — ' : x.toFixed(2));

function lineaCosto(): string[] {
  if (costo.llamadas === 0) return ['Costo: 0 llamadas al juez (juez heurístico, sin modelo).'];
  return [`Costo: ${costo.llamadas} llamadas al juez · ${costo.tokensEntrada} tokens de entrada + ${costo.tokensSalida} de salida = ${costo.tokensEntrada + costo.tokensSalida} tokens.`];
}

async function verificar(): Promise<number> {
  const casos = cargarDataset();
  const catalogo = cargarCatalogo();
  const ids = casos.map((c) => c.id);
  if (new Set(ids).size !== ids.length) throw new Error('hay ids repetidos en el dataset');
  casos.forEach((c) => contextoDe(c, catalogo)); // falla si una fuente no existe
  console.log(`Dataset dorado: ${casos.length} casos (${casos.filter((c) => c.critico).length} críticos) · fuentes OK`);
  for (const v of ['v1', 'v2', 'v3']) {
    try { cargarRespuestas(v); console.log(`  respuestas/${v}.jsonl: OK`); } catch { console.log(`  respuestas/${v}.jsonl: falta (generar ${v})`); }
  }
  return 0;
}

async function generar(): Promise<number> {
  const version = posicionales[0];
  // import dinámico: solo `generar` necesita el backend; verificar/correr/calibrar funcionan sin él (zip de entrega).
  const { crearSistema } = await import('./src/sistema.js');
  const sistema = crearSistema(version);
  const filas: RespuestaGrabada[] = [];
  for (const caso of cargarDataset()) {
    const r = await sistema.preguntar(caso.pregunta);
    filas.push({ id: caso.id, respuesta: r.respuesta, camino: r.camino });
    console.log(`  ${caso.id} [${r.camino ?? 'fuera'}] ${r.respuesta.replace(/\n/g, ' ').slice(0, 90)}`);
  }
  console.log(`Guardado en ${guardarRespuestas(version, filas).replace(RAIZ + '/', 'evals/')}`);
  return 0;
}

async function correr(): Promise<number> {
  const version = posicionales[0];
  const resumen = await evaluar(version, crearJuez());
  const { pasa, motivos } = compuerta(resumen, cargarUmbrales());
  console.log(`\nVersión ${version} · juez ${resumen.juez}\n`);
  console.log('caso     crít compl prohib fidel  oraciones no respaldadas');
  for (const r of resumen.resultados) {
    console.log(`${r.caso.id.padEnd(8)} ${(r.caso.critico ? 'sí' : '').padEnd(4)} ${fmt(r.completitud)} ${fmt(r.sinProhibidos).padStart(6)} ${fmt(r.fidelidad)}  ${(r.oracionesNoRespaldadas.join(' / ') || r.errorJuez || '').slice(0, 70)}`);
  }
  console.log(`\nPromedios → completitud ${promedio(resumen, 'completitud').toFixed(2)} · fidelidad ${promedio(resumen, 'fidelidad').toFixed(2)}`);
  console.log(pasa ? 'COMPUERTA: PASA' : 'COMPUERTA: NO PASA\n  - ' + motivos.join('\n  - '));
  lineaCosto().forEach((l) => console.log(l));
  console.log(`Informe: ${escribirInforme(resumen, pasa, motivos, ['', ...lineaCosto()]).replace(RAIZ + '/', 'evals/')}`);
  return pasa ? 0 : 1;
}

async function comparar(): Promise<number> {
  const [a, b] = posicionales;
  const juez = crearJuez();
  const [ra, rb] = [await evaluar(a, juez), await evaluar(b, juez)];
  console.log(`\n${'métrica'.padEnd(16)} ${a.padStart(6)} ${b.padStart(6)}`);
  for (const m of ['completitud', 'sinProhibidos', 'fidelidad'] as const) {
    console.log(`${m.padEnd(16)} ${promedio(ra, m).toFixed(2).padStart(6)} ${promedio(rb, m).toFixed(2).padStart(6)}`);
  }
  console.log('\nCasos que cambian de estado:');
  ra.resultados.forEach((x, i) => {
    const y = rb.resultados[i];
    if (aprobado(x) !== aprobado(y)) console.log(`  ${x.caso.id}${x.caso.critico ? ' (crítico)' : ''}: ${a} ${aprobado(x) ? 'aprueba' : 'falla'} → ${b} ${aprobado(y) ? 'aprueba' : 'falla'}`);
  });
  return 0;
}

async function etiquetar(): Promise<number> {
  const respuestas = cargarRespuestas(posicionales[0]);
  const catalogo = cargarCatalogo();
  console.log('Etiquetá SIN correr el juez. «Fiel» = TODO lo que afirma la respuesta está en las fuentes.\n');
  for (const c of cargarDataset()) {
    console.log(`── ${c.id} ──────────────\nPREGUNTA: ${c.pregunta}\nRESPUESTA:\n${respuestas.get(c.id)?.respuesta}\nFUENTES:\n${contextoDe(c, catalogo).split('\n').slice(0, 12).join('\n')}\n`);
  }
  return 0;
}

async function calibrar(): Promise<number> {
  const version = posicionales[0];
  const [cabecera, ...filas] = readFileSync(RUTA_ETIQUETAS, 'utf-8').trim().split('\n');
  const cols = cabecera.split(',');
  const humanas = new Map<string, boolean>();
  for (const f of filas) {
    const v = Object.fromEntries(f.split(',').map((x, i) => [cols[i], x.trim()]));
    if (v.version === version && v.fiel) humanas.set(v.id, ['si', 'sí'].includes(v.fiel.toLowerCase()));
  }
  if (humanas.size < 15) {
    console.error(`Hay ${humanas.size} etiquetas humanas para ${version}; el entregable pide 15. Completá datos/etiquetas_humanas.csv (npx tsx evals/evaluar.ts etiquetar ${version}).`);
    return 2;
  }
  const resumen = await evaluar(version, crearJuez());
  const pares = resumen.resultados.filter((r) => humanas.has(r.caso.id)).map((r) => ({ r, persona: humanas.get(r.caso.id)!, juez: r.fidelidad === 1 }));
  console.log(`\nCalibración · versión ${version} · juez ${resumen.juez} · ${pares.length} casos`);
  pares.filter((p) => p.persona !== p.juez).forEach((p) => console.log(`  DESACUERDO ${p.r.caso.id}: persona=${p.persona ? 'fiel' : 'no fiel'} · juez=${p.r.fidelidad}  ← escribí aquí una línea: ¿paráfrasis, criterio, o error del juez?`));
  console.log(`Acuerdo: ${(acuerdo(pares.map((p) => p.persona), pares.map((p) => p.juez)) * 100).toFixed(0)}% · kappa de Cohen: ${kappaCohen(pares.map((p) => p.persona), pares.map((p) => p.juez)).toFixed(2)}`);
  lineaCosto().forEach((l) => console.log(l));
  return 0;
}

/** Escribe el dataset con el CONTEXTO ya resuelto en cada caso (para revisar sin abrir db.json). */
async function exportar(): Promise<number> {
  const catalogo = cargarCatalogo();
  const destino = posicionales[0] ?? 'dataset_dorado_con_contexto.jsonl';
  writeFileSync(destino, cargarDataset().map((c) => JSON.stringify({ ...c, contexto: contextoDe(c, catalogo) })).join('\n') + '\n', 'utf-8');
  console.log(`Escrito ${destino} (${cargarDataset().length} casos con contexto)`);
  return 0;
}

const comandos: Record<string, () => Promise<number>> = { verificar, generar, correr, comparar, etiquetar, calibrar, exportar };
if (!comando || !comandos[comando]) {
  console.error('Uso: verificar | generar <v> | correr <v> [--juez modelo] | comparar <a> <b> | etiquetar <v> | calibrar <v> [--juez modelo] | exportar <ruta>');
  process.exit(64);
}
comandos[comando]().then((c) => process.exit(c), (e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
