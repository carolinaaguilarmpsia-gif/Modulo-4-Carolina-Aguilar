/** % de casos donde juez y persona dicen lo mismo. */
export function acuerdo(a: boolean[], b: boolean[]): number {
  if (a.length !== b.length || a.length === 0) throw new Error('las listas deben tener el mismo largo y no estar vacías');
  return a.filter((x, i) => x === b[i]).length / a.length;
}

/** Kappa de Cohen: acuerdo corregido por azar. 1 = perfecto · 0 = moneda · ≥ 0,6 aceptable. */
export function kappaCohen(a: boolean[], b: boolean[]): number {
  const observado = acuerdo(a, b);
  const pa = a.filter(Boolean).length / a.length;
  const pb = b.filter(Boolean).length / b.length;
  const esperado = pa * pb + (1 - pa) * (1 - pb);
  if (esperado === 1) return observado === 1 ? 1 : 0;
  return (observado - esperado) / (1 - esperado);
}
