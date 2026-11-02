import type { ITramiteRepository } from '../ports/out/ITramiteRepository.js';
import type { FuenteTramite } from '../types/Tramite.js';
import type { DepartamentoListado } from '../types/AsistenteTramites.js';

/**
 * Mitigación AI-SEC-007 (red team) — validación de salida: db.json es una fuente externa al
 * modelo, pero se trata igual como NO confiable acá. Ningún requisito, plazo o normativa que
 * pida una contraseña/clave o que dirija a un correo fuera del dominio institucional llega a
 * la respuesta, sin importar si el camino fue keyword, RAG o el LLM-router — el filtro está en
 * el único punto por el que pasan los tres (TramiteToolsService), no en cada uno por separado.
 * Qué NO resuelve: no verifica la procedencia de db.json (falta un hash/firma de origen) ni
 * detecta una paráfrasis del pedido de credenciales. @see redteam/hallazgos/AI-SEC-007.md
 */
const DOMINIO_INSTITUCIONAL = '@universidad.edu.bo';
const RE_CREDENCIAL = /contraseñ|password|clave de acceso|pin de seguridad/i;
const RE_EMAIL = /[\w.+-]+@[\w.-]+\.\w+/gi;

function esTextoSospechoso(texto: string): boolean {
  if (RE_CREDENCIAL.test(texto)) return true;
  const correos = texto.match(RE_EMAIL) ?? [];
  return correos.some((correo) => !correo.toLowerCase().endsWith(DOMINIO_INSTITUCIONAL));
}

function sanearTexto(texto: string, reemplazo: string): string {
  return esTextoSospechoso(texto) ? reemplazo : texto;
}

function sanearLista(items: string[]): string[] {
  const limpios = items.filter((item) => !esTextoSospechoso(item));
  return limpios.length > 0 ? limpios : ['No se pudo validar el contenido de este trámite — consultá directamente con el departamento.'];
}

export interface RequisitosResult {
  requisitos: string[];
  fuente: FuenteTramite;
}

export interface TiempoResult {
  tiempo: string;
  fuente: FuenteTramite;
}

export interface NormativaResult {
  /** null = el trámite existe pero db.json no tiene normativa registrada para él. */
  normativa: string | null;
  fuente: FuenteTramite;
}

/**
 * Las 4 herramientas del asistente. El LLM (o el match de keyword) solo elige CUÁL invocar
 * y con qué código — nunca redacta la respuesta: todo el texto sale de datos reales de db.json.
 */
export class TramiteToolsService {
  constructor(private readonly tramites: ITramiteRepository) {}

  private fuenteDe(codigo: string): FuenteTramite | undefined {
    const t = this.tramites.buscarPorCodigo(codigo);
    if (!t) return undefined;
    return { codigo: t.codigo, nombre: t.nombre, departamento: t.departamento };
  }

  CONSULTAR_REQUISITOS(codigoTramite: string): RequisitosResult | undefined {
    const t = this.tramites.buscarPorCodigo(codigoTramite);
    if (!t) return undefined;
    return { requisitos: sanearLista(t.requisitos), fuente: { codigo: t.codigo, nombre: t.nombre, departamento: t.departamento } };
  }

  CONSULTAR_TIEMPO(codigoTramite: string): TiempoResult | undefined {
    const t = this.tramites.buscarPorCodigo(codigoTramite);
    if (!t) return undefined;
    const tiempo = sanearTexto(t.tiempo, 'No se pudo validar el plazo de este trámite — consultá directamente con el departamento.');
    return { tiempo, fuente: { codigo: t.codigo, nombre: t.nombre, departamento: t.departamento } };
  }

  CONSULTAR_NORMATIVA(codigoTramite: string): NormativaResult | undefined {
    const t = this.tramites.buscarPorCodigo(codigoTramite);
    if (!t) return undefined;
    const normativa = t.normativa
      ? sanearTexto(t.normativa, 'No se pudo validar la normativa de este trámite — consultá directamente con el departamento.')
      : null;
    return {
      normativa,
      fuente: { codigo: t.codigo, nombre: t.nombre, departamento: t.departamento },
    };
  }

  LISTAR_TRAMITES(departamento?: string): DepartamentoListado[] {
    const dep = departamento?.trim().toLowerCase();
    return this.tramites
      .listarDepartamentos()
      .filter((d) => !dep || d.departamento.toLowerCase().includes(dep))
      .map((d) => ({
        departamento: d.departamento,
        tramites: d.tramites.map((t) => ({ codigo: t.codigo, nombre: t.nombre })),
      }));
  }
}
