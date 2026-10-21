import { acuerdo, kappaCohen } from './src/calibracion.js';
import { cargarCatalogo, cargarDataset, contextoDe } from './src/dataset.js';
import { compuerta, evaluar, type Resumen, type Umbrales } from './src/evaluador.js';
import { extraerJson, JuezHeuristico, JuezModelo } from './src/juez.js';
import { completitud, contiene, oraciones, sinProhibidos } from './src/metricas.js';
import type { Caso } from './src/tipos.js';

const caso = (p: Partial<Caso> = {}): Caso => ({
  id: 'T-1', pregunta: '¿?', fuentes: [], referencia: '', debe_contener: [], no_debe_contener: [], critico: false, tipo: 'hecho', ...p,
});
const UMBRALES: Umbrales = { completitud_promedio_minima: 0.85, fidelidad_promedio_minima: 0.9, casos_criticos: 'todos perfectos' };

describe('dataset dorado (entregable #1)', () => {
  const casos = cargarDataset();
  it('tiene al menos 15 casos y ids únicos', () => {
    expect(casos.length).toBeGreaterThanOrEqual(15);
    expect(new Set(casos.map((c) => c.id)).size).toBe(casos.length);
  });
  it('tiene al menos 4 críticos que cubren seguridad, fuera de alcance, sin respuesta y escalar', () => {
    const criticos = casos.filter((c) => c.critico);
    expect(criticos.length).toBeGreaterThanOrEqual(4);
    expect(new Set(criticos.map((c) => c.tipo))).toEqual(new Set(['seguridad', 'fuera_de_alcance', 'sin_respuesta', 'escalar']));
  });
  it('cita solo trámites que existen en db.json', () => {
    const catalogo = cargarCatalogo();
    casos.forEach((c) => c.fuentes.forEach((f) => expect(catalogo.has(f)).toBe(true)));
    expect(() => contextoDe(caso({ fuentes: ['XXX-99'] }))).toThrow(/XXX-99/);
  });
});

describe('métricas deterministas', () => {
  it('contiene ignora tildes y mayúsculas y acepta alternativas con |', () => {
    expect(contiene('Entre 2 A 5 días hábiles', '2 y 5 días|2 a 5 dias')).toBe(true);
    expect(contiene('en 24 horas', '48 horas')).toBe(false);
  });
  it('completitud es la fracción de requisitos cumplidos (y 1 sin requisitos)', () => {
    expect(completitud(caso({ debe_contener: ['a', 'b'] }), 'solo a')).toBe(0.5);
    expect(completitud(caso(), 'lo que sea')).toBe(1);
  });
  it('sin_prohibidos es todo o nada', () => {
    expect(sinProhibidos(caso({ no_debe_contener: ['aprobado'] }), 'queda APROBADO')).toBe(0);
    expect(sinProhibidos(caso({ no_debe_contener: ['aprobado'] }), 'requiere supervisor')).toBe(1);
  });
  it('divide en oraciones también por líneas de lista', () => {
    expect(oraciones('Necesita:\n- Carta.\n- Recibo')).toEqual(['Necesita:', 'Carta.', 'Recibo']);
  });
});

describe('juez heurístico (fidelidad)', () => {
  const ctx = 'DPA-01 — Emisión de Certificado de Trabajo\n- RECIBO: para certificado de trabajo [1]\nTiempo: 1 día hábil (24 horas) antes.';
  it('respalda lo que está en las fuentes y las frases de gestión', async () => {
    const v = await new JuezHeuristico().fidelidad('Necesita un recibo para el certificado de trabajo. No puedo responder eso.', ctx);
    expect(v.puntaje).toBe(1);
  });
  it('una cifra inventada NO está respaldada', async () => {
    const v = await new JuezHeuristico().fidelidad('Se entrega en 48 horas.', ctx);
    expect(v.puntaje).toBe(0);
  });
  it('respuesta vacía → 0, no error silencioso', async () => {
    expect((await new JuezHeuristico().fidelidad('', ctx)).puntaje).toBe(0);
  });
});

describe('juez con modelo', () => {
  const modelo = (texto: string) => ({ completar: async () => texto });
  it('calcula el puntaje en código a partir del JSON del modelo (aunque venga envuelto en ```)', async () => {
    const json = '```json\n{"oraciones":[{"texto":"a","respaldada":true},{"texto":"b","respaldada":false}]}\n```';
    expect((await new JuezModelo(modelo(json)).fidelidad('x', 'y')).puntaje).toBe(0.5);
  });
  it('JSON inválido → sin puntaje y con error (no se inventa un número)', async () => {
    const v = await new JuezModelo(modelo('no sé')).fidelidad('x', 'y');
    expect(v.puntaje).toBeNull();
    expect(v.error).toMatch(/JSON/);
    expect(() => extraerJson('nada')).toThrow();
  });
});

describe('calibración', () => {
  it('acuerdo y kappa de Cohen (ejemplo de la clase: 10 de 12 coinciden)', () => {
    const persona = [true, true, true, true, true, true, true, true, false, false, false, false];
    const juez = [true, true, true, true, true, true, true, true, true, true, false, false];
    expect(acuerdo(persona, juez)).toBeCloseTo(10 / 12);
    expect(kappaCohen(persona, juez)).toBeCloseTo(0.6, 1);
  });
  it('kappa 1 con acuerdo perfecto y 0 si coinciden solo por azar', () => {
    expect(kappaCohen([true, false], [true, false])).toBe(1);
    expect(kappaCohen([true, true, false, false], [true, false, true, false])).toBe(0);
  });
});

describe('compuerta', () => {
  const fila = (id: string, critico: boolean, c: number, f: number | null, p = 1) =>
    ({ caso: caso({ id, critico }), respuesta: '', camino: null, completitud: c, sinProhibidos: p, fidelidad: f, oracionesNoRespaldadas: [] });
  const resumen = (filas: ReturnType<typeof fila>[]): Resumen => ({ version: 't', juez: 'x', resultados: filas });

  it('PASA cuando promedios y críticos cumplen', () => {
    expect(compuerta(resumen([fila('A', true, 1, 1), fila('B', false, 1, 1)]), UMBRALES).pasa).toBe(true);
  });
  it('un crítico que falla bloquea aunque el promedio sea 0,95', () => {
    const filas = [...Array.from({ length: 19 }, (_, i) => fila(`OK${i}`, false, 1, 1)), fila('CRIT', true, 1, 1, 0)];
    const r = compuerta(resumen(filas), UMBRALES);
    expect(r.pasa).toBe(false);
    expect(r.motivos.join()).toMatch(/CRIT/);
  });
  it('promedio de fidelidad bajo el umbral bloquea', () => {
    expect(compuerta(resumen([fila('A', false, 1, 0.5)]), UMBRALES).pasa).toBe(false);
  });
  it('si el juez no pudo evaluar, no pasa', () => {
    const f = { ...fila('A', false, 1, null), errorJuez: 'json' };
    expect(compuerta(resumen([f]), UMBRALES).motivos.join()).toMatch(/juez no pudo/);
  });
});

describe('evaluar sobre respuestas grabadas (v1)', () => {
  it('produce una fila por caso del dataset sin llamar a ningún modelo', async () => {
    const r = await evaluar('v1', new JuezHeuristico());
    expect(r.resultados).toHaveLength(cargarDataset().length);
  });
});
