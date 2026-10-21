import type { ModeloJuez } from './juez.js';

/** Contador de costo de una corrida (entregable #5): llamadas y tokens reales que reporta Ollama. */
export const costo = { llamadas: 0, tokensEntrada: 0, tokensSalida: 0 };

/**
 * Modelo-juez local (Ollama). temperature 0 + format json para reducir variación (Zheng et al., 2023).
 * Modelo configurable: EVAL_JUDGE_MODEL (por defecto el mismo llama3.2:3b del proyecto).
 */
export class OllamaJuez implements ModeloJuez {
  constructor(
    private readonly host = process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434',
    readonly modelo = process.env.EVAL_JUDGE_MODEL ?? process.env.OLLAMA_MODEL ?? 'llama3.2:3b'
  ) {}

  async completar(sistema: string, usuario: string): Promise<string> {
    const res = await this.pedir(sistema, usuario);
    if (!res.ok) throw new Error(`OLLAMA_JUEZ_FALLO: ${res.status}`);
    const cuerpo = (await res.json()) as { message: { content: string }; prompt_eval_count?: number; eval_count?: number };
    costo.llamadas += 1;
    costo.tokensEntrada += cuerpo.prompt_eval_count ?? 0;
    costo.tokensSalida += cuerpo.eval_count ?? 0;
    return cuerpo.message.content;
  }

  /** Ollama local a veces corta la conexión al recargar el modelo: se reintenta y se reporta la causa real. */
  private async pedir(sistema: string, usuario: string): Promise<Response> {
    let ultimo: unknown;
    for (let intento = 1; intento <= 3; intento++) {
      try {
        return await this.fetchChat(sistema, usuario);
      } catch (e) {
        ultimo = e;
        console.error(`  (intento ${intento}/3 falló: ${(e as { cause?: { code?: string } }).cause?.code ?? (e as Error).message})`);
        await new Promise((r) => setTimeout(r, 3000 * intento));
      }
    }
    throw new Error(`OLLAMA_JUEZ_SIN_CONEXION: ${(ultimo as Error).message}`);
  }

  private fetchChat(sistema: string, usuario: string): Promise<Response> {
    return fetch(`${this.host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.modelo,
        stream: false,
        format: 'json',
        options: { temperature: 0, num_predict: 700 }, // tope: un juez 3B puede entrar en bucle generando JSON
        messages: [
          { role: 'system', content: sistema },
          { role: 'user', content: usuario },
        ],
      }),
    });
  }
}
