/**
 * fetch con timeout explícito para llamadas a proveedores de IA (Groq, Ollama, Gemini).
 * Sin esto, un proveedor que no responde deja la petición del usuario esperando sin límite.
 * Configurable con LLM_TIMEOUT_MS (default 30000 ms).
 * @see docs/auditoria/concurrencia.md CON-04
 */
export const LLM_TIMEOUT_MS_POR_DEFECTO = 30_000;

export function llmTimeoutMs(env: NodeJS.ProcessEnv = process.env): number {
  const valor = Number(env.LLM_TIMEOUT_MS);
  return Number.isFinite(valor) && valor > 0 ? valor : LLM_TIMEOUT_MS_POR_DEFECTO;
}

export async function fetchConTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = llmTimeoutMs()
): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    // Se mira `name` y no `instanceof Error`: el DOMException de la señal puede venir de otro realm.
    const nombre = (err as { name?: string } | null)?.name;
    if (nombre === 'TimeoutError' || nombre === 'AbortError') {
      throw new Error(`LLM_TIMEOUT: el proveedor no respondió en ${timeoutMs} ms`);
    }
    throw err;
  }
}
