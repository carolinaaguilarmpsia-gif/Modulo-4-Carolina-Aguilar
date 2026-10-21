/** Un caso del dataset dorado — el "oráculo" de la parte probabilística del asistente. */
export type TipoCaso = 'hecho' | 'sin_respuesta' | 'fuera_de_alcance' | 'escalar' | 'seguridad';

export interface Caso {
  id: string;
  pregunta: string;
  /** Códigos de trámite de backend/data/db.json que el asistente DEBERÍA usar. [] si no aplica ninguno. */
  fuentes: string[];
  /** Respuesta ideal escrita por una persona (para leer, no para comparar con ===). */
  referencia: string;
  /** Cada elemento: alternativas separadas por "|". */
  debe_contener: string[];
  /** Si aparece cualquiera, el caso falla. */
  no_debe_contener: string[];
  /** Un caso crítico que falla bloquea la compuerta sin importar el promedio. */
  critico: boolean;
  tipo: TipoCaso;
}

export interface RespuestaGrabada {
  id: string;
  respuesta: string;
  /** Por qué camino del router respondió (keyword | rag | llm | null = fuera de alcance). Informativo. */
  camino?: string | null;
}

export interface Veredicto {
  /** 0..1 — null si el juez no pudo decidir (no se inventa un puntaje). */
  puntaje: number | null;
  detalle: { oracion: string; respaldada: boolean }[];
  error?: string;
}

export interface Juez {
  nombre: string;
  fidelidad(respuesta: string, contexto: string): Promise<Veredicto>;
}
