#!/usr/bin/env node
// Resume bench/e3/resultados/*.json: mediana y rango [mín–máx] por forma, falla, ruta y fase.
// Uso: node bench/e3/resumir.mjs [carpeta]   -> imprime Markdown y lo guarda en <carpeta>/resumen.md
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? new URL('./resultados', import.meta.url).pathname;
const mediana = (v) => { const s = [...v].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const celda = (v, d = 0) => `${mediana(v).toFixed(d)} [${Math.min(...v).toFixed(d)}–${Math.max(...v).toFixed(d)}]`;

const grupos = new Map();
for (const f of readdirSync(dir).filter((n) => n.endsWith('.json') && !n.endsWith('.meta.json'))) {
  const k6 = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  let meta = {};
  try { meta = JSON.parse(readFileSync(join(dir, f.replace(/\.json$/, '.meta.json')), 'utf8')); } catch {}
  const forma = k6.nombre.split('-')[0];
  const clave = `${forma} · falla ${forma === 'proceso' ? 'no inyectable (sin red)' : meta.falla ?? k6.falla}`;
  if (!grupos.has(clave)) grupos.set(clave, []);
  grupos.get(clave).push({ k6, meta });
}

const sal = ['# Resumen E3 (mediana [mín–máx] de las corridas)\n'];
for (const [clave, corridas] of [...grupos].sort()) {
  sal.push(`## ${clave} — ${corridas.length} corridas\n`);
  const ups = corridas.map((c) => c.meta.up_s).filter((x) => x != null);
  const builds = corridas.map((c) => c.meta.build_s).filter((x) => x != null);
  if (ups.length) sal.push(`Tiempos: \`up\` hasta sano ${celda(ups, 1)} s · build ${celda(builds, 1)} s\n`);
  const k6 = corridas[0].k6;
  sal.push(`Carga: ${k6.rate_por_ruta}/s por ruta · ${k6.duracion_s} s (calentamiento ${k6.calentamiento_s} s, falla en ${k6.ventana_falla_s.join('–')} s)\n`);
  sal.push('| Ruta | Fase | p95 (ms) | Errores (%) | Peticiones |', '|---|---|---|---|---|');
  for (const ruta of ['modulo', 'control']) for (const fase of ['antes', 'durante', 'despues']) {
    const filas = corridas.map((c) => c.k6.fases[`${ruta}.${fase}`]).filter(Boolean);
    if (!filas.length) continue;
    sal.push(`| ${ruta} | ${fase} | ${celda(filas.map((x) => x.p95_ms), 0)} | ${celda(filas.map((x) => x.errores_pct), 1)} | ${celda(filas.map((x) => x.peticiones))} |`);
  }
  const rec = corridas.map((c) => c.k6.recuperacion_s).filter((x) => x != null);
  if (rec.length) {
    const cens = corridas.filter((c) => c.k6.recuperacion_censurada).length;
    sal.push(`\nRecuperación de la ruta del módulo tras terminar la falla (s hasta 0 % de errores): ${celda(rec, 0)}${cens ? ` — ${cens} corrida(s) NO se recuperaron dentro de la ventana (el valor es un mínimo)` : ''}`);
  }
  const cargas = corridas.map((c) => c.meta.carga_uptime).filter(Boolean);
  if (cargas.length) sal.push(`\nCarga del equipo antes de cada corrida (uptime): ${cargas.join(' | ')}\n`);
}
const texto = sal.join('\n') + '\n';
writeFileSync(join(dir, 'resumen.md'), texto);
process.stdout.write(texto);
