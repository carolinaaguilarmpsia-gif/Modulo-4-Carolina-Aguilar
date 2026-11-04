// Genera bench/e3/k6/preguntas.json: preguntas fijas que el camino keyword resuelve (sin LLM ni red).
// Uso (desde backend/): node --import tsx ../bench/e3/generar-preguntas.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { AsistenteTramitesService } from '../../backend/domain/tramites-dpa/services/AsistenteTramitesService.js';
import { JsonTramiteRepository } from '../../backend/infrastructure/persistence/JsonTramiteRepository.js';

const ruta = new URL('../../backend/data/db.json', import.meta.url).pathname;
const servicio = new AsistenteTramitesService(new JsonTramiteRepository(ruta), null, false);
const nombres = (JSON.parse(readFileSync(ruta, 'utf8')) as { tramites: { nombre: string }[] }[]).flatMap((d) => d.tramites.map((t) => t.nombre));
const buenas: string[] = [];
for (const n of nombres) {
  const pregunta = `requisitos de ${n}`;
  if ((await servicio.preguntar(pregunta)).camino === 'keyword') buenas.push(pregunta);
}
writeFileSync(new URL('./k6/preguntas.json', import.meta.url).pathname, JSON.stringify(buenas, null, 2) + '\n');
console.log(`${buenas.length} de ${nombres.length} preguntas resueltas por keyword`);
