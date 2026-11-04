import {
  TramitesNoDisponibleError,
  type IAsistenteTramites,
  type MotivoNoDisponible,
  type OpcionesLlamada,
} from '../../domain/tramites-dpa/ports/in/IAsistenteTramites.js';
import type { AsistenteTramitesResult, EstadoAsistenteTramites } from '../../domain/tramites-dpa/types/AsistenteTramites.js';

export interface ConfigClienteHttp {
  /** Ej. http://tramites:3002 (o el puerto del proxy de Toxiproxy). */
  baseUrl: string;
  /** Plazo de cada intento. Sin plazo, un módulo colgado cuelga a quien lo llama. */
  timeoutMs: number;
  /** Reintentos adicionales tras el primer intento (solo red, timeout y 5xx; las lecturas son idempotentes). */
  reintentos: number;
  backoffBaseMs: number;
  /** Fallos seguidos que abren el circuito. */
  umbralCircuito: number;
  /** Cuánto queda abierto antes de dejar pasar un intento de prueba. */
  aperturaMs: number;
}

export const CONFIG_HTTP_POR_DEFECTO: Omit<ConfigClienteHttp, 'baseUrl'> = {
  timeoutMs: 1000,
  reintentos: 1,
  backoffBaseMs: 50,
  umbralCircuito: 5,
  aperturaMs: 5000,
};

export interface Dependencias {
  fetch?: typeof fetch;
  dormir?: (ms: number) => Promise<void>;
  aleatorio?: () => number;
  ahora?: () => number;
}

/**
 * Forma 2 (servicio extraído): el módulo corre en otro proceso y se le habla por HTTP.
 * Defensas de la frontera: plazo por intento, reintentos con jitter, y un circuito que falla rápido
 * cuando el módulo lleva varias fallas seguidas (así no se acumulan peticiones esperando un plazo).
 */
export class AsistenteTramitesHttp implements IAsistenteTramites {
  private fallosSeguidos = 0;
  private abiertoHasta = 0;
  private readonly cfg: ConfigClienteHttp;
  private readonly fetchFn: typeof fetch;
  private readonly dormir: (ms: number) => Promise<void>;
  private readonly aleatorio: () => number;
  private readonly ahora: () => number;

  constructor(cfg: Partial<ConfigClienteHttp> & Pick<ConfigClienteHttp, 'baseUrl'>, deps: Dependencias = {}) {
    this.cfg = { ...CONFIG_HTTP_POR_DEFECTO, ...cfg };
    this.fetchFn = deps.fetch ?? fetch;
    this.dormir = deps.dormir ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.aleatorio = deps.aleatorio ?? Math.random;
    this.ahora = deps.ahora ?? Date.now;
  }

  preguntar(pregunta: string, opciones?: OpcionesLlamada): Promise<AsistenteTramitesResult> {
    return this.llamar<AsistenteTramitesResult>('POST', '/api/v1/asistente-tramites/preguntar', { pregunta }, opciones);
  }

  estado(opciones?: OpcionesLlamada): Promise<EstadoAsistenteTramites> {
    return this.llamar<EstadoAsistenteTramites>('GET', '/api/v1/asistente-tramites/estado', undefined, opciones);
  }

  private async llamar<T>(metodo: 'GET' | 'POST', ruta: string, cuerpo: unknown, opciones?: OpcionesLlamada): Promise<T> {
    this.comprobarCircuito();
    let ultimo: TramitesNoDisponibleError | undefined;

    for (let intento = 0; intento <= this.cfg.reintentos; intento++) {
      opciones?.signal?.throwIfAborted();
      try {
        const resultado = await this.unIntento<T>(metodo, ruta, cuerpo, opciones?.signal);
        this.fallosSeguidos = 0;
        return resultado;
      } catch (e) {
        if (!(e instanceof TramitesNoDisponibleError)) throw e;
        if (e.motivo === 'rechazada') {
          // El módulo contestó; la petición era mala. No es una falla del módulo ni se reintenta.
          this.fallosSeguidos = 0;
          throw e;
        }
        ultimo = e;
        if (intento < this.cfg.reintentos) {
          // Jitter completo: espera aleatoria en [0, base * 2^intento] para no sincronizar reintentos.
          await this.dormir(this.aleatorio() * this.cfg.backoffBaseMs * 2 ** intento);
        }
      }
    }

    this.registrarFallo();
    throw ultimo!;
  }

  private async unIntento<T>(metodo: string, ruta: string, cuerpo: unknown, externa?: AbortSignal): Promise<T> {
    const plazo = AbortSignal.timeout(this.cfg.timeoutMs);
    const signal = externa ? AbortSignal.any([externa, plazo]) : plazo;
    let res: Response;
    try {
      res = await this.fetchFn(`${this.cfg.baseUrl}${ruta}`, {
        method: metodo,
        signal,
        ...(cuerpo !== undefined && { headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) }),
      });
      if (res.status >= 500) throw this.error('http-5xx', `HTTP ${res.status}`);
      if (!res.ok) throw this.error('rechazada', `HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (e) {
      if (e instanceof TramitesNoDisponibleError) throw e;
      // Si canceló quien llama, no es una falla del módulo: se propaga tal cual.
      if (externa?.aborted) throw externa.reason;
      if (plazo.aborted) throw this.error('timeout', `más de ${this.cfg.timeoutMs} ms`);
      throw this.error('red', e instanceof Error ? e.message : String(e));
    }
  }

  private error(motivo: MotivoNoDisponible, detalle?: string): TramitesNoDisponibleError {
    return new TramitesNoDisponibleError(motivo, detalle);
  }

  private comprobarCircuito(): void {
    if (this.fallosSeguidos < this.cfg.umbralCircuito) return;
    if (this.ahora() >= this.abiertoHasta) {
      // Semiabierto: deja pasar una prueba. Si falla, registrarFallo() vuelve a abrir el circuito.
      this.abiertoHasta = this.ahora() + this.cfg.aperturaMs;
      return;
    }
    throw this.error('circuito-abierto');
  }

  private registrarFallo(): void {
    this.fallosSeguidos++;
    if (this.fallosSeguidos >= this.cfg.umbralCircuito) this.abiertoHasta = this.ahora() + this.cfg.aperturaMs;
  }
}
