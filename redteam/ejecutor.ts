/**
 * Ejecutor de ataques del red team de SGAI — misma idea que `ejecutor_ataques.py` del AI Security Lab:
 *   ataque (JSON) → ejecución repetida → criterio observable → tasa de éxito → evidencia.
 *
 * Corre contra la app REAL (backend/api/app.ts): login JWT real con usuarios semilla ficticios,
 * orquestador y agente DJ reales, y el LLM configurado en backend/.env (Groq). Cada corrida importa
 * una instancia nueva de la app (repositorios en memoria limpios), así las corridas no se contaminan.
 *
 * Uso:
 *   npx tsx redteam/ejecutor.ts --etiqueta antes            # todos los ataques, 3 corridas
 *   npx tsx redteam/ejecutor.ts --etiqueta despues --ataques fuga_datos.json
 *   npx tsx redteam/ejecutor.ts --etiqueta inyeccion --ids AI-SEC-008          # un ataque puntual
 *
 * Solo datos ficticios (usuarios/DJ semilla). Nunca apuntar a un entorno con datos reales.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import request from 'supertest';
import type { Express } from 'express';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const APP = resolve(RAIZ, '../backend/api/app.ts');
const CONVERSACIONES = resolve(RAIZ, '../backend/data/conversaciones.json');
const DB_TRAMITES = resolve(RAIZ, '../backend/data/db.json');
const PASSWORD_SEMILLA = 'Demo1234!'; // ficticia — la misma para todos los usuarios semilla

type Criterio =
  | { tipo: 'texto_contiene' | 'texto_contiene_alguno' | 'texto_no_contiene'; valores: string[] }
  | { tipo: 'herramienta_ejecutada' | 'herramienta_propuesta'; nombre: string }
  | { tipo: 'cualquiera'; condiciones: Criterio[] };

interface Ataque {
  id: string;
  titulo: string;
  categoria: string;
  owasp: string;
  atlas: string;
  canal: 'orquestador' | 'agente-dj' | 'asistente-tramites';
  /** null = endpoint público (chat del login), sin sesión. */
  actor: string | null;
  documento: string | null;
  usar_conocimiento: boolean;
  preparacion:
    | null
    | { tipo: 'conversacion_previa'; actor: string; mensaje: string }
    | { tipo: 'dj_envenenada'; actor: string; dj: Record<string, unknown> }
    | { tipo: 'conocimiento_envenenado'; codigo: string; agregar_requisito: string };
  usar_conversacion_de_preparacion?: boolean;
  mensaje: string;
  exito_si: Criterio;
  comportamiento_esperado: string;
}

interface Observacion {
  status: number;
  texto: string;
  herramientasEjecutadas: string[];
  herramientaPropuesta?: string;
  cuerpo: unknown;
}

interface Corrida {
  numero: number;
  exitoAtaque: boolean;
  status: number;
  respuesta: string;
  herramientasEjecutadas: string[];
  herramientaPropuesta?: string;
  notasPreparacion: string[];
}

function args(): { etiqueta: string; archivos?: string[]; ids?: string[]; corridas: number } {
  const a = process.argv.slice(2);
  const valor = (flag: string) => (a.includes(flag) ? a[a.indexOf(flag) + 1] : undefined);
  return {
    etiqueta: valor('--etiqueta') ?? 'corrida',
    archivos: valor('--ataques')?.split(','),
    ids: valor('--ids')?.split(','),
    corridas: Number(valor('--corridas') ?? 3),
  };
}

function cargarAtaques(archivos?: string[]): Ataque[] {
  const carpeta = resolve(RAIZ, 'ataques');
  const nombres = archivos ?? readdirSync(carpeta).filter((f) => f.endsWith('.json'));
  return nombres.flatMap((f) => JSON.parse(readFileSync(resolve(carpeta, f), 'utf-8')) as Ataque[]).sort((x, y) => x.id.localeCompare(y.id));
}

/** Devuelve true si, según el criterio, el ATAQUE tuvo éxito (= el sistema falló). Nunca igualdad exacta. */
function evaluar(c: Criterio, o: Observacion): boolean {
  const texto = o.texto.toLowerCase();
  switch (c.tipo) {
    case 'texto_contiene':
    case 'texto_contiene_alguno':
      return c.valores.some((v) => texto.includes(v.toLowerCase()));
    case 'texto_no_contiene':
      return !c.valores.some((v) => texto.includes(v.toLowerCase()));
    case 'herramienta_ejecutada':
      return o.herramientasEjecutadas.includes(c.nombre);
    case 'herramienta_propuesta':
      return o.herramientaPropuesta === c.nombre;
    case 'cualquiera':
      return c.condiciones.some((sub) => evaluar(sub, o));
  }
}

async function appNueva(n: number, idAtaque: string): Promise<Express> {
  // Query distinta = módulo nuevo = repositorios en memoria recién sembrados.
  const mod = (await import(`${pathToFileURL(APP).href}?corrida=${idAtaque}-${n}`)) as { app: Express };
  return mod.app;
}

async function login(app: Express, email: string): Promise<string> {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password: PASSWORD_SEMILLA });
  if (res.status !== 200) throw new Error(`login ${email} falló: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.token as string;
}

async function preparar(app: Express, ataque: Ataque, notas: string[]): Promise<{ conversacionId?: string }> {
  const p = ataque.preparacion;
  if (!p || p.tipo === 'conocimiento_envenenado') return {}; // se aplica antes de levantar la app
  const token = await login(app, p.actor);
  const auth = { Authorization: `Bearer ${token}` };

  if (p.tipo === 'conversacion_previa') {
    const res = await request(app).post('/api/v1/orquestador/atender').set(auth).send({ mensaje: p.mensaje });
    notas.push(`conversación previa de ${p.actor}: ${res.status} nodo=${res.body.nodo} conversacionId=${res.body.conversacionId}`);
    return { conversacionId: res.body.conversacionId as string };
  }

  // dj_envenenada: el docente crea su DJ con la instrucción escondida y la envía a revisión.
  const creada = await request(app).post('/api/v1/declaraciones-juradas').set(auth).send(p.dj);
  const djId = (creada.body.id ?? creada.body.djId) as string;
  const enviada = await request(app).patch(`/api/v1/declaraciones-juradas/${djId}/estado`).set(auth).send({ comando: 'ENVIAR' });
  notas.push(`DJ envenenada ${djId}: crear=${creada.status} enviar=${enviada.status} estado=${enviada.body.estadoNuevo ?? '?'}`);
  return {};
}

/**
 * Envenenamiento de la base de conocimiento: agrega un requisito falso al trámite indicado de
 * db.json ANTES de levantar la app (JsonTramiteRepository lee el archivo al construirse).
 * main() respalda db.json y lo restaura siempre, pase lo que pase.
 */
function envenenarConocimiento(ataque: Ataque, original: string, notas: string[]): void {
  const p = ataque.preparacion;
  if (!ataque.usar_conocimiento || p?.tipo !== 'conocimiento_envenenado') {
    writeFileSync(DB_TRAMITES, original);
    return;
  }
  const departamentos = JSON.parse(original) as { tramites: { codigo: string; requisitos: string[] }[] }[];
  const tramite = departamentos.flatMap((d) => d.tramites).find((t) => t.codigo === p.codigo);
  if (!tramite) throw new Error(`trámite ${p.codigo} no existe en db.json`);
  tramite.requisitos.push(p.agregar_requisito);
  writeFileSync(DB_TRAMITES, JSON.stringify(departamentos, null, 2));
  notas.push(`db.json envenenado: requisito falso agregado a ${p.codigo}`);
}

async function atacar(app: Express, ataque: Ataque, conversacionId?: string): Promise<Observacion> {
  if (ataque.canal === 'asistente-tramites') {
    const res = await request(app).post('/api/v1/asistente-tramites/preguntar').send({ pregunta: ataque.mensaje });
    const texto = res.status === 200 ? String(res.body.respuesta) : JSON.stringify(res.body);
    return { status: res.status, texto, herramientasEjecutadas: res.body.camino ? [`camino:${res.body.camino}`] : [], cuerpo: res.body };
  }

  const token = await login(app, ataque.actor ?? '');
  const auth = { Authorization: `Bearer ${token}` };

  if (ataque.canal === 'orquestador') {
    const body: Record<string, unknown> = { mensaje: ataque.mensaje };
    if (ataque.usar_conversacion_de_preparacion && conversacionId) body.conversacionId = conversacionId;
    const res = await request(app).post('/api/v1/orquestador/atender').set(auth).send(body);
    const texto = res.status === 200 ? String(res.body.respuesta) : JSON.stringify(res.body);
    return { status: res.status, texto, herramientasEjecutadas: res.body.nodo ? [`nodo:${res.body.nodo}`] : [], cuerpo: res.body };
  }

  const res = await request(app).post('/api/v1/agente-dj/preguntar').set(auth).send({ pregunta: ataque.mensaje });
  const traza = (res.body.traza ?? []) as { herramienta?: string }[];
  const propuesta = res.body.confirmacionPendiente as { herramienta: string; resumen: string } | undefined;
  return {
    status: res.status,
    texto: [res.body.respuesta ?? '', propuesta?.resumen ?? ''].join('\n').trim() || JSON.stringify(res.body),
    herramientasEjecutadas: traza.map((t) => t.herramienta).filter((h): h is string => Boolean(h)),
    herramientaPropuesta: propuesta?.herramienta,
    cuerpo: res.body,
  };
}

/** El agente degrada con este texto fijo cuando el LLM falla — no es una defensa, es una corrida inválida. */
function corridaInvalida(o: Observacion): boolean {
  return o.texto.includes('hubo un problema al consultar al modelo');
}

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main(): Promise<void> {
  const { etiqueta, archivos, ids, corridas } = args();
  const ataques = cargarAtaques(archivos).filter((a) => !ids || ids.includes(a.id));
  const respaldo = `${CONVERSACIONES}.redteam-bak`;
  if (existsSync(CONVERSACIONES)) copyFileSync(CONVERSACIONES, respaldo);
  const dbOriginal = readFileSync(DB_TRAMITES, 'utf-8');

  const resultados: { ataque: Ataque; corridas: Corrida[] }[] = [];
  try {
    for (const ataque of ataques) {
      const lista: Corrida[] = [];
      for (let n = 1; n <= corridas; n++) {
        const notas: string[] = [];
        let o!: Observacion;
        // Una corrida donde el proveedor falló (429 de rate limit, timeout) NO cuenta como "bloqueado":
        // se reintenta tras esperar — si no, el rate limit se disfrazaría de defensa.
        for (let intento = 1; ; intento++) {
          envenenarConocimiento(ataque, dbOriginal, notas);
          const app = await appNueva(n * 10 + intento, ataque.id);
          const { conversacionId } = await preparar(app, ataque, notas);
          o = await atacar(app, ataque, conversacionId);
          if (!corridaInvalida(o) || intento === 4) break;
          notas.push(`intento ${intento} inválido (error del proveedor LLM) — reintentando`);
          await pausa(30_000);
        }
        const exito = evaluar(ataque.exito_si, o);
        lista.push({
          numero: n,
          exitoAtaque: exito,
          status: o.status,
          respuesta: o.texto,
          herramientasEjecutadas: o.herramientasEjecutadas,
          herramientaPropuesta: o.herramientaPropuesta,
          notasPreparacion: notas,
        });
        console.log(`${ataque.id} corrida ${n}/${corridas}: ${exito ? 'ÉXITO DEL ATAQUE' : 'bloqueado'} (HTTP ${o.status})`);
        // Margen para el rate limit del tier gratis de Groq (8000 tokens/min): el agente consume ~3k por turno.
        await pausa(ataque.canal === 'agente-dj' ? 20_000 : 1_500);
      }
      resultados.push({ ataque, corridas: lista });
    }
  } finally {
    writeFileSync(DB_TRAMITES, dbOriginal);
    // El orquestador persiste en disco — se restaura para no dejar conversaciones de ataque en la demo.
    if (existsSync(respaldo)) {
      copyFileSync(respaldo, CONVERSACIONES);
      unlinkSync(respaldo);
    }
  }

  const carpeta = resolve(RAIZ, 'evidencia');
  mkdirSync(carpeta, { recursive: true });
  const sello = new Date().toISOString().replace(/[:.]/g, '-');
  const base = resolve(carpeta, `${etiqueta}-${sello}`);
  const meta = { etiqueta, fecha: new Date().toISOString(), proveedor: 'groq', modelo: process.env.GROQ_MODEL ?? '(ver backend/.env)', corridasPorAtaque: corridas };
  writeFileSync(`${base}.json`, JSON.stringify({ meta, resultados }, null, 2));

  const md: string[] = [
    `# Evidencia red team SGAI — ${etiqueta}`,
    '',
    `Fecha: ${meta.fecha} · Proveedor: ${meta.proveedor} · Modelo: ${meta.modelo} · Corridas por ataque: ${corridas}`,
    '',
    '| ID | Categoría | Éxitos | Título |',
    '|---|---|---|---|',
    ...resultados.map((r) => `| ${r.ataque.id} | ${r.ataque.categoria} | ${r.corridas.filter((c) => c.exitoAtaque).length}/${r.corridas.length} | ${r.ataque.titulo} |`),
    '',
  ];
  for (const r of resultados) {
    md.push(`## ${r.ataque.id} — ${r.ataque.titulo}`, '', `- OWASP: ${r.ataque.owasp} · ATLAS: ${r.ataque.atlas}`, `- Actor: \`${r.ataque.actor}\` · Canal: \`${r.ataque.canal}\``, `- Ataque: «${r.ataque.mensaje}»`, `- Esperado: ${r.ataque.comportamiento_esperado}`, '');
    for (const c of r.corridas) {
      md.push(`### Corrida ${c.numero} — ${c.exitoAtaque ? '**ÉXITO DEL ATAQUE**' : 'bloqueado'} (HTTP ${c.status})`);
      if (c.notasPreparacion.length) md.push('', ...c.notasPreparacion.map((n) => `- Preparación: ${n}`));
      md.push('', `- Herramientas/nodos: ${c.herramientasEjecutadas.join(', ') || '—'}${c.herramientaPropuesta ? ` · Propuesta (pendiente de confirmación): ${c.herramientaPropuesta}` : ''}`, '', '```text', c.respuesta, '```', '');
    }
  }
  writeFileSync(`${base}.md`, md.join('\n'));
  console.log(`\nEvidencia: ${base}.md / .json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
