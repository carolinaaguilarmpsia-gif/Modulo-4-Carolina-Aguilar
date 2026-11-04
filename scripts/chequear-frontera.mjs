#!/usr/bin/env node
// Frontera del módulo Trámites DPA (E3): nadie fuera de backend/domain/tramites-dpa puede importar
// sus clases internas (services/, types/Tramite, ports/out). Solo se permite el puerto de entrada
// (ports/in/IAsistenteTramites) y los tipos de la respuesta (types/AsistenteTramites).
// Excepciones: la infraestructura que arma el módulo, y los adaptadores de infrastructure/ que implementan
// sus puertos de salida (ports/out), que es justo para lo que existen.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const RAIZ = new URL('../backend/', import.meta.url).pathname;
const PERMITIDOS = [/tramites-dpa\/ports\/in\//, /tramites-dpa\/types\/AsistenteTramites(\.js)?['"]/];
const QUIEN_ARMA_EL_MODULO = [`infrastructure${sep}tramites${sep}`, `infrastructure${sep}persistence${sep}`, `infrastructure${sep}config${sep}persistencia`, `api${sep}main-tramites`];

function* archivos(dir) {
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules' || n === 'data') continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* archivos(p);
    else if (p.endsWith('.ts')) yield p;
  }
}

const violaciones = [];
for (const f of archivos(RAIZ)) {
  const rel = relative(RAIZ, f);
  if (rel.startsWith(`domain${sep}tramites-dpa${sep}`)) continue;
  if (QUIEN_ARMA_EL_MODULO.some((p) => rel.startsWith(p))) continue;
  if (rel.endsWith('.test.ts')) continue;
  const esAdaptador = rel.startsWith(`infrastructure${sep}`);
  readFileSync(f, 'utf8').split('\n').forEach((linea, i) => {
    if (!/^\s*(import|export)\b.*from\s+['"]/.test(linea) || !linea.includes('tramites-dpa/')) return;
    if (PERMITIDOS.some((re) => re.test(linea))) return;
    if (esAdaptador && /tramites-dpa\/ports\/out\//.test(linea)) return;
    violaciones.push(`${rel}:${i + 1}  ${linea.trim()}`);
  });
}

if (violaciones.length) {
  console.error('Frontera de Trámites DPA violada:\n' + violaciones.join('\n'));
  process.exit(1);
}
console.log('Frontera de Trámites DPA: OK');
