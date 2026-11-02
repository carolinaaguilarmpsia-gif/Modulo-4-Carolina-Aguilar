import type { ITramiteRepository } from '../ports/out/ITramiteRepository.js';
import type { ILlmClient } from '../ports/out/ILlmClient.js';
import type { FuenteTramite, TramiteKeywordEntry } from '../types/Tramite.js';
import type { AsistenteTramitesResult, CaminoRespuesta, NombreHerramienta } from '../types/AsistenteTramites.js';
import { construirCatalogo, encontrarPorKeyword } from './TramiteKeywordCatalog.js';
import { TramiteToolsService } from './TramiteToolsService.js';
import { DecidirHerramientaLlmService } from './DecidirHerramientaLlmService.js';
import { UMBRAL_CORROBORACION_LLM, type RetrieverSemanticoTramitesService } from './RetrieverSemanticoTramitesService.js';

const RE_TIEMPO = /\b(tiempo|plazo|cu[aá]ndo|con cu[aá]nt[ao]|anticipaci[oó]n|d[ií]as antes)\b/i;
const RE_NORMATIVA = /\b(normativa|resoluci[oó]n|reglamento|marco legal|respalda)\b/i;

/**
 * Guard del paso RAG — medido empíricamente: "¿Cuánto gana un docente a dedicación exclusiva?"
 * (una pregunta de MONTO, no de procedimiento) recupera por similitud coseno el trámite
 * "Nombramiento Docentes a Dedicación Exclusiva" con score 0.76 — más alto que el match
 * correcto de una pregunta real ("constancia laboral" → 0.62). La similitud pura por embeddings
 * confunde TEMA (comparten "dedicación exclusiva") con INTENCIÓN (una es un trámite, la otra no),
 * y ni subir el umbral ni exigir margen sobre el segundo puesto lo resuelve — el falso positivo
 * queda más arriba en ambos casos. DecidirHerramientaLlmService ya resuelve esto para el LLM-router
 * (se lo pide explícito en el prompt); acá se aplica el mismo criterio antes de confiar en RAG.
 */
const RE_FUERA_DE_ALCANCE_TEMATICO =
  /\b(cu[aá]nto gana|sueldo|salario|remuneraci[oó]n|honorarios|ingreso mensual|opini[oó]n|opinas|te parece|mejor que)\b/i;

/**
 * v3 (evals offline M7) — categorías que NUNCA son un trámite y que el 3B del LLM-router sí
 * llegaba a enrutar a un trámite cualquiera: manipulación del prompt, secretos/credenciales y
 * consejo financiero (red teaming del Día 8 + dataset dorado). Ver evals/README.md.
 */
const RE_FUERA_DE_ALCANCE_SEGURIDAD =
  /\b(ignora|olvida|omite)\b.*\b(instrucciones|reglas)\b|\bprompt\b|\b(claves?|contrase[ñn]as?|api[ -]?keys?|tokens?|secretos?)\b|\b(invertir|inversi[oó]n|inversiones|ahorros)\b/i;

/**
 * v3 — datos que db.json no registra para NINGÚN trámite (solo guarda requisitos, tiempo y
 * normativa). Preguntar por costo con un trámite ya identificado es «sin respuesta»: hay que
 * decirlo, no listar requisitos como si respondieran.
 */
const RE_DATO_NO_REGISTRADO = /\b(cu[aá]nto (cuesta|cobran|vale|se paga)|costo|precio|arancel|tarifa)\b/i;

/**
 * v3 — órdenes que el asistente nunca cumple (solo informa, jamás aprueba: RB de escalamiento).
 * Se limita a formas imperativas («aprueba ahora/ya/mi…») para no confundirlas con preguntas
 * como «¿quién aprueba la creación de grupos?».
 */
const RE_ORDEN_NO_SOPORTADA = /\b(aprueba|autoriza|firma)(me)?\s+(ahora|ya|mi|mis)\b|\bap(rué|rue)bame\b/i;

function esFueraDeAlcance(pregunta: string): boolean {
  return RE_FUERA_DE_ALCANCE_TEMATICO.test(pregunta) || RE_FUERA_DE_ALCANCE_SEGURIDAD.test(pregunta);
}

function detectarHerramienta(pregunta: string): NombreHerramienta {
  if (RE_TIEMPO.test(pregunta)) return 'CONSULTAR_TIEMPO';
  if (RE_NORMATIVA.test(pregunta)) return 'CONSULTAR_NORMATIVA';
  return 'CONSULTAR_REQUISITOS';
}

interface HerramientaEjecutada {
  texto: string;
  fuente: FuenteTramite;
  herramienta: NombreHerramienta;
}

/**
 * Router de 4 pasos: keyword directo → RAG semántico (embeddings) → LLM elige herramienta →
 * fallback "no sé" + LISTAR_TRAMITES. db.json es la única fuente de datos; este servicio nunca
 * deja que el LLM redacte texto libre, solo elige (por similitud o por tool-call) QUÉ trámite
 * consultar — la respuesta siempre se arma en código desde datos reales (ver
 * RetrieverSemanticoTramitesService y DecidirHerramientaLlmService).
 */
export class AsistenteTramitesService {
  private readonly catalogo: TramiteKeywordEntry[];
  private readonly tools: TramiteToolsService;
  private readonly decisor: DecidirHerramientaLlmService | null;

  constructor(
    private readonly tramites: ITramiteRepository,
    llm: ILlmClient | null,
    private readonly iaHabilitada: boolean,
    private readonly retrieverSemantico: RetrieverSemanticoTramitesService | null = null
  ) {
    this.catalogo = construirCatalogo(tramites.listarTodos());
    this.tools = new TramiteToolsService(tramites);
    this.decisor = llm ? new DecidirHerramientaLlmService(llm) : null;
  }

  async preguntar(pregunta: string): Promise<AsistenteTramitesResult> {
    // v3: el guard va ANTES de RAG y de LLM-router. Antes solo cubría RAG y el LLM (3B) seguía
    // enrutando montos y manipulaciones a un trámite cualquiera (evals EV-013, EV-018).
    if (RE_ORDEN_NO_SOPORTADA.test(pregunta)) return this.respuestaOrdenNoSoportada();
    if (esFueraDeAlcance(pregunta)) return this.respuestaFueraDeAlcance();

    const keywordMatch = encontrarPorKeyword(pregunta, this.catalogo);
    if (keywordMatch) {
      const sinDato = this.respuestaSinDato(pregunta, keywordMatch.codigo, 'keyword');
      if (sinDato) return sinDato;
      const ejecutado = this.ejecutar(detectarHerramienta(pregunta), keywordMatch.codigo);
      if (ejecutado) return this.respuestaConTramite(ejecutado, 'keyword');
    }

    if (this.iaHabilitada && this.retrieverSemantico) {
      // Nunca deja caer el chat entero por un Ollama caído — degrada al siguiente paso del router.
      const match = await this.retrieverSemantico.buscar(pregunta).catch(() => null);
      if (match) {
        const sinDato = this.respuestaSinDato(pregunta, match.codigo, 'rag', match.similitud);
        if (sinDato) return sinDato;
        const ejecutado = this.ejecutar(detectarHerramienta(pregunta), match.codigo);
        if (ejecutado) return this.respuestaConTramite(ejecutado, 'rag', match.similitud);
      }
    }

    if (this.iaHabilitada && this.decisor) {
      const decision = await this.decisor.decidir(pregunta, this.tramites.listarTodos());
      // v3: el LLM (3B) propone, la similitud semántica corrobora. Sin evidencia semántica mínima
      // no se confía en su elección (enrutaba «¿cómo saco mi pasaporte?» a un trámite cualquiera).
      const corroborada =
        decision.tool !== 'NONE' && decision.codigo && this.retrieverSemantico
          ? (await this.retrieverSemantico.similitudCon(pregunta, decision.codigo).catch(() => 1)) >= UMBRAL_CORROBORACION_LLM
          : true;
      if (decision.tool !== 'NONE' && decision.codigo && corroborada) {
        const sinDato = this.respuestaSinDato(pregunta, decision.codigo, 'llm');
        if (sinDato) return sinDato;
        const ejecutado = this.ejecutar(decision.tool, decision.codigo);
        if (ejecutado) return this.respuestaConTramite(ejecutado, 'llm');
      }
    }

    return this.respuestaFueraDeAlcance();
  }

  /** «Sin respuesta»: el trámite existe pero el dato pedido (costo) no está en db.json. */
  private respuestaSinDato(
    pregunta: string,
    codigo: string,
    camino: CaminoRespuesta,
    similitud?: number
  ): AsistenteTramitesResult | undefined {
    if (!RE_DATO_NO_REGISTRADO.test(pregunta)) return undefined;
    const t = this.tramites.buscarPorCodigo(codigo);
    if (!t) return undefined;
    return {
      respuesta: `No tengo información sobre el costo del trámite **${t.nombre}** en db.json. Puedo explicarte sus requisitos, su plazo o su normativa.`,
      camino,
      herramienta: null,
      fuente: { codigo: t.codigo, nombre: t.nombre, departamento: t.departamento },
      ...(similitud !== undefined ? { similitud } : {}),
      iaHabilitada: this.iaHabilitada,
      fuenteDatos: 'db.json',
    };
  }

  private ejecutar(tool: NombreHerramienta, codigo: string): HerramientaEjecutada | undefined {
    switch (tool) {
      case 'CONSULTAR_REQUISITOS': {
        const r = this.tools.CONSULTAR_REQUISITOS(codigo);
        if (!r) return undefined;
        const lista = r.requisitos.map((req) => `- ${req}`).join('\n');
        return {
          texto: `Para el trámite **${r.fuente.nombre}** (${r.fuente.codigo} · ${r.fuente.departamento}) necesita:\n${lista}`,
          fuente: r.fuente,
          herramienta: tool,
        };
      }
      case 'CONSULTAR_TIEMPO': {
        const r = this.tools.CONSULTAR_TIEMPO(codigo);
        if (!r) return undefined;
        return {
          texto: `El trámite **${r.fuente.nombre}** (${r.fuente.codigo} · ${r.fuente.departamento}) debe solicitarse con: ${r.tiempo}`,
          fuente: r.fuente,
          herramienta: tool,
        };
      }
      case 'CONSULTAR_NORMATIVA': {
        const r = this.tools.CONSULTAR_NORMATIVA(codigo);
        if (!r) return undefined;
        const texto = r.normativa
          ? `Normativa aplicable a **${r.fuente.nombre}** (${r.fuente.codigo}): ${r.normativa}`
          : `El trámite **${r.fuente.nombre}** (${r.fuente.codigo}) no tiene una normativa registrada en db.json.`;
        return { texto, fuente: r.fuente, herramienta: tool };
      }
      case 'LISTAR_TRAMITES':
        return undefined;
    }
  }

  private respuestaConTramite(ejecutado: HerramientaEjecutada, camino: CaminoRespuesta, similitud?: number): AsistenteTramitesResult {
    return {
      respuesta: ejecutado.texto,
      camino,
      herramienta: ejecutado.herramienta,
      fuente: ejecutado.fuente,
      ...(similitud !== undefined ? { similitud } : {}),
      iaHabilitada: this.iaHabilitada,
      fuenteDatos: 'db.json',
    };
  }

  private respuestaOrdenNoSoportada(): AsistenteTramitesResult {
    return {
      respuesta:
        'No puedo aprobar, autorizar ni registrar trámites: solo explico requisitos, plazos y normativa. Estos son los trámites que sí puedo explicarte:',
      camino: null,
      herramienta: null,
      fuente: null,
      tramitesDisponibles: this.tools.LISTAR_TRAMITES(),
      iaHabilitada: this.iaHabilitada,
      fuenteDatos: 'db.json',
    };
  }

  private respuestaFueraDeAlcance(): AsistenteTramitesResult {
    return {
      respuesta:
        'No puedo responder eso — no corresponde a ningún trámite registrado en db.json. Estos son los trámites que sí puedo explicarte:',
      camino: null,
      herramienta: null,
      fuente: null,
      tramitesDisponibles: this.tools.LISTAR_TRAMITES(),
      iaHabilitada: this.iaHabilitada,
      fuenteDatos: 'db.json',
    };
  }

  estado(): { iaHabilitada: boolean; fuenteDatos: 'db.json'; totalTramites: number; departamentos: string[] } {
    const departamentos = this.tramites.listarDepartamentos();
    return {
      iaHabilitada: this.iaHabilitada,
      fuenteDatos: 'db.json',
      totalTramites: this.tramites.listarTodos().length,
      departamentos: departamentos.map((d) => d.departamento),
    };
  }
}
