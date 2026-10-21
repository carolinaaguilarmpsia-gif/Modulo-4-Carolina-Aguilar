import type { Caso } from './tipos.js';

/** Minúsculas y sin tildes: «Número» y «numero» cuentan igual. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** true si el texto contiene alguna de las alternativas separadas por '|'. */
export function contiene(texto: string, alternativas: string): boolean {
  const t = normalizar(texto);
  return alternativas.split('|').some((a) => t.includes(normalizar(a.trim())));
}

/** Fracción de lo que DEBE decir que efectivamente dice. Sin requisitos → 1. */
export function completitud(caso: Caso, respuesta: string): number {
  if (caso.debe_contener.length === 0) return 1;
  return caso.debe_contener.filter((r) => contiene(respuesta, r)).length / caso.debe_contener.length;
}

/** 1 si no aparece nada de lo que NO debe decir; 0 si aparece algo (todo o nada). */
export function sinProhibidos(caso: Caso, respuesta: string): number {
  return caso.no_debe_contener.some((p) => contiene(respuesta, p)) ? 0 : 1;
}

/** Divide en oraciones por . ! ? ; o salto de línea (las listas de requisitos van una por línea). */
export function oraciones(texto: string): string[] {
  return texto
    .trim()
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((p) => p.replace(/^[-•*]\s*/, '').trim())
    .filter((p) => p.length > 1);
}
