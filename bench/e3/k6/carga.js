// E3 — carga a ritmo fijo sobre Trámites DPA, con una falla inyectada a mitad de corrida.
//
// Dos rutas, al mismo ritmo cada una:
//   modulo  -> POST /api/v1/asistente-tramites/preguntar  (usa el módulo; IA apagada = camino keyword)
//   control -> GET  /health                                (no usa el módulo)
// Un calentamiento inicial (CALENTAMIENTO s, no se reporta: JIT, conexiones y caches en frío) y tres fases
// por tiempo: antes (..FALLO_DESDE), durante (..FALLO_HASTA) y despues (..DURACION).
// En la forma extraída (TOXIPROXY_URL definida) un tercer escenario rompe el proxy durante "durante".
// En la forma en proceso no hay red que romper: la ventana existe igual, para comparar las mismas fases.
//
// Uso (desde la raíz del repo):
//   docker compose -f compose.e3.yaml --env-file bench/e3/formas/http.env run --rm \
//     -e FALLA=colgado -e NOMBRE=http-colgado-1 -e TOXIPROXY_URL=http://toxiproxy:8474 k6 run /k6/carga.js
import http from 'k6/http';
import exec from 'k6/execution';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const API = __ENV.API_URL || 'http://api:3001';
const TOX = __ENV.TOXIPROXY_URL || '';
const RATE = Number(__ENV.RATE || 40); // peticiones/s POR RUTA
const DURACION = Number(__ENV.DURACION || 70); // s, incluye el calentamiento
const CALENTAMIENTO = Number(__ENV.CALENTAMIENTO || 10); // s
const DESDE = Number(__ENV.FALLO_DESDE || 30); // s desde el inicio
const HASTA = Number(__ENV.FALLO_HASTA || 50); // s desde el inicio
const FALLA = __ENV.FALLA || 'colgado'; // colgado | lento | caido
const NOMBRE = __ENV.NOMBRE || 'corrida';

const preguntas = new SharedArray('preguntas', () => JSON.parse(open('./preguntas.json')));
const FASES = ['antes', 'durante', 'despues'];
const RUTAS = ['modulo', 'control'];

const escenario = (funcion) => ({
  executor: 'constant-arrival-rate',
  rate: RATE,
  timeUnit: '1s',
  duration: `${DURACION}s`,
  preAllocatedVUs: 50,
  maxVUs: 400,
  exec: funcion,
});

export const options = {
  scenarios: {
    modulo: escenario('modulo'),
    control: escenario('control'),
    ...(TOX && { falla: { executor: 'shared-iterations', vus: 1, iterations: 1, startTime: `${DESDE}s`, maxDuration: `${HASTA - DESDE + 10}s`, exec: 'inyectarFalla' } }),
  },
  // Estos umbrales no son criterios: obligan a k6 a calcular cada ruta x fase por separado.
  thresholds: Object.fromEntries([
    ...RUTAS.flatMap((r) =>
      FASES.flatMap((f) => [
        [`http_req_duration{ruta:${r},fase:${f}}`, ['p(95)>=0']],
        [`http_req_failed{ruta:${r},fase:${f}}`, ['rate>=0']],
        [`http_reqs{ruta:${r},fase:${f}}`, ['count>=0']],
      ])
    ),
    // Un cubo por segundo tras terminar la falla, solo para la ruta del módulo: mide la recuperación.
    ...Array.from({ length: Math.max(0, DURACION - HASTA) }, (_, i) => [`http_req_failed{ruta:modulo,seg:${HASTA + i}}`, ['rate>=0']]),
  ]),
  summaryTrendStats: ['med', 'p(95)', 'max'],
};

function fase() {
  const s = exec.instance.currentTestRunDuration / 1000;
  if (s < CALENTAMIENTO) return 'calentamiento';
  return s < DESDE ? 'antes' : s < HASTA ? 'durante' : 'despues';
}

function segTrasFalla() {
  const s = Math.floor(exec.instance.currentTestRunDuration / 1000);
  return s >= HASTA && s < DURACION ? { seg: String(s) } : {};
}

export function setup() {
  const r = http.post(`${API}/api/v1/asistente-tramites/preguntar`, JSON.stringify({ pregunta: preguntas[0] }), { headers: { 'content-type': 'application/json' } });
  if (r.status !== 200) throw new Error(`El módulo no responde antes de empezar (HTTP ${r.status})`);
  if (TOX) {
    // Deja el proxy limpio por si una corrida anterior murió a medias.
    http.post(`${TOX}/reset`);
  }
}

export function modulo() {
  const pregunta = preguntas[exec.scenario.iterationInTest % preguntas.length];
  const r = http.post(`${API}/api/v1/asistente-tramites/preguntar`, JSON.stringify({ pregunta }), {
    headers: { 'content-type': 'application/json' },
    tags: { ruta: 'modulo', fase: fase(), ...segTrasFalla() },
    timeout: '5s',
  });
  check(r, { 'camino keyword': (x) => x.status === 200 && x.json('camino') === 'keyword' });
}

export function control() {
  http.get(`${API}/health`, { tags: { ruta: 'control', fase: fase() }, timeout: '5s' });
}

const JSON_H = { headers: { 'content-type': 'application/json' } };

export function inyectarFalla() {
  const proxy = `${TOX}/proxies/tramites`;
  if (FALLA === 'caido') http.post(proxy, JSON.stringify({ enabled: false }), JSON_H);
  else {
    const toxico = FALLA === 'lento' ? { type: 'latency', attributes: { latency: 1500, jitter: 0 } } : { type: 'timeout', attributes: { timeout: 0 } };
    http.post(`${proxy}/toxics`, JSON.stringify({ name: 'falla', stream: 'downstream', toxicity: 1, ...toxico }), JSON_H);
  }
  sleep(HASTA - DESDE);
  if (FALLA === 'caido') http.post(proxy, JSON.stringify({ enabled: true }), JSON_H);
  else http.del(`${proxy}/toxics/falla`);
}

export function handleSummary(data) {
  const m = data.metrics;
  const tabla = {};
  const lineas = ['ruta     fase      peticiones   p95 (ms)   errores %'];
  for (const r of RUTAS) {
    for (const f of FASES) {
      const k = `{ruta:${r},fase:${f}}`;
      const dur = m[`http_req_duration${k}`];
      const fallo = m[`http_req_failed${k}`];
      const n = m[`http_reqs${k}`];
      if (!dur || !fallo || !n) continue;
      const fila = { peticiones: n.values.count, p95_ms: Number(dur.values['p(95)'].toFixed(2)), errores_pct: Number((fallo.values.rate * 100).toFixed(2)) };
      tabla[`${r}.${f}`] = fila;
      lineas.push(`${r.padEnd(9)}${f.padEnd(10)}${String(fila.peticiones).padStart(10)}${String(fila.p95_ms).padStart(11)}${String(fila.errores_pct).padStart(12)}`);
    }
  }
  // Recuperación: segundos tras terminar la falla hasta el último segundo con errores (0 = sin errores tras la falla).
  let ultimoConErrores = -1;
  let sinDato = true;
  for (let sg = HASTA; sg < DURACION; sg++) {
    const c = m[`http_req_failed{ruta:modulo,seg:${sg}}`];
    if (!c) continue;
    sinDato = false;
    if (c.values.rate > 0) ultimoConErrores = sg;
  }
  const recuperacion_s = sinDato ? null : ultimoConErrores < 0 ? 0 : ultimoConErrores + 1 - HASTA;
  const sinRecuperar = ultimoConErrores === DURACION - 1; // seguía con errores al final de la ventana
  const resumen = { nombre: NOMBRE, falla: TOX ? FALLA : 'ninguna (en proceso)', rate_por_ruta: RATE, duracion_s: DURACION, calentamiento_s: CALENTAMIENTO, ventana_falla_s: [DESDE, HASTA], recuperacion_s, recuperacion_censurada: sinRecuperar, fases: tabla };
  lineas.push(`recuperación tras la falla: ${recuperacion_s === null ? 'sin datos' : recuperacion_s + ' s' + (sinRecuperar ? ' (o más: no se recuperó en la ventana)' : '')}`);
  return { [`/out/${NOMBRE}.json`]: JSON.stringify(resumen, null, 2), stdout: lineas.join('\n') + '\n' };
}
