import { normalizar, oraciones } from './metricas.js';
import type { Juez, Veredicto } from './tipos.js';

/** Palabras que no aportan contenido (se ignoran al comparar). */
const VACIAS = new Set(
  `a al algo ante como con cual cuando de del desde donde el ella en entre era es esa ese eso esta este esto
fue ha hay la las le les lo los mas me mi mis muy no nos o para pero por que se si sin sobre su sus te tu
tus un una uno unos unas y ya yo hola necesita`.split(/\s+/)
);

/** Frases de gestión: no afirman hechos del negocio (rechazar, derivar, saludar). */
const FRASES_GESTION = ['no puedo', 'puedo explicarte', 'no tengo informacion', 'no encuentro informacion', 'no tiene una normativa registrada', 'te derivo', 'lamento', 'hola', 'gracias'];

const palabras = (t: string): string[] => (normalizar(t).match(/[a-z0-9]+/g) ?? []).filter((p) => !VACIAS.has(p) && p.length > 2);
const numeros = (t: string): string[] => t.match(/\d+/g) ?? [];

/**
 * Sin modelo, determinista y gratis. Una frase de gestión sin cifras cuenta como respaldada.
 * Cualquier otra oración lo está si (1) TODOS sus números aparecen en el contexto y
 * (2) al menos la mitad de sus palabras de contenido aparecen en el contexto.
 * Se equivoca con paráfrasis: para eso existe la calibración.
 */
export class JuezHeuristico implements Juez {
  nombre = 'heuristico';
  private static readonly UMBRAL_PALABRAS = 0.5;

  async fidelidad(respuesta: string, contexto: string): Promise<Veredicto> {
    const ctx = normalizar(contexto);
    const ctxPalabras = new Set(palabras(contexto));
    const detalle = oraciones(respuesta).map((oracion) => {
      if (FRASES_GESTION.some((f) => normalizar(oracion).includes(f)) && numeros(oracion).length === 0) {
        return { oracion, respaldada: true };
      }
      const numerosOk = numeros(oracion).every((n) => ctx.includes(n));
      const pal = palabras(oracion);
      const proporcion = pal.length ? pal.filter((p) => ctxPalabras.has(p)).length / pal.length : 1;
      return { oracion, respaldada: numerosOk && proporcion >= JuezHeuristico.UMBRAL_PALABRAS };
    });
    if (detalle.length === 0) return { puntaje: 0, detalle, error: 'respuesta vacía' };
    return { puntaje: detalle.filter((d) => d.respaldada).length / detalle.length, detalle };
  }
}

export const RUBRICA_FIDELIDAD = `Eres un evaluador estricto. Recibes FUENTES (trámites de una universidad) y una RESPUESTA de un asistente.
Pasos:
1. Divide la RESPUESTA en oraciones (cada línea de una lista cuenta como una oración).
2. Para cada oración decide si está RESPALDADA por las FUENTES: todo lo que afirma (documentos, plazos,
   códigos de trámite, normativa) aparece en las FUENTES o se deduce directamente. Saludos, disculpas y
   frases como «no puedo responder eso» o «no tiene normativa registrada» cuentan como respaldadas.
3. Un documento, plazo, código o normativa que no está en las FUENTES hace que la oración NO esté respaldada.
Devuelve SOLO este JSON, sin texto adicional:
{"oraciones": [{"texto": "...", "respaldada": true}]}`;

/** Puerto mínimo del modelo-juez; el adaptador real (Ollama) está en proveedor.ts. */
export interface ModeloJuez {
  completar(sistema: string, usuario: string): Promise<string>;
}

/** LLM-as-judge: el modelo decide por oración; el puntaje lo calcula el código. */
export class JuezModelo implements Juez {
  nombre = 'modelo';
  constructor(private readonly modelo: ModeloJuez) {}

  async fidelidad(respuesta: string, contexto: string): Promise<Veredicto> {
    const texto = await this.modelo.completar(RUBRICA_FIDELIDAD, `FUENTES:\n${contexto}\n\nRESPUESTA:\n${respuesta}`);
    try {
      const datos = JSON.parse(extraerJson(texto)) as { oraciones: { texto: unknown; respaldada: unknown }[] };
      const detalle = datos.oraciones.map((o) => ({ oracion: String(o.texto), respaldada: o.respaldada === true }));
      if (detalle.length === 0) return { puntaje: null, detalle: [], error: 'el juez no devolvió oraciones' };
      return { puntaje: detalle.filter((d) => d.respaldada).length / detalle.length, detalle };
    } catch {
      // El juez también falla: se registra, NO se inventa un puntaje.
      return { puntaje: null, detalle: [], error: 'el juez no devolvió JSON válido' };
    }
  }
}

/** Los modelos pequeños a veces envuelven el JSON en ```json …```; se toma del primer { al último }. */
export function extraerJson(texto: string): string {
  const i = texto.indexOf('{');
  const f = texto.lastIndexOf('}');
  if (i === -1 || f === -1) throw new Error('sin JSON');
  return texto.slice(i, f + 1);
}
