import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  type RouteConfig,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { Rol } from '../../domain/administracion/types/Rol.js';
import { TIPOS_EVENTO_CALENDARIO } from '../../domain/gestion-academica/types/Calendario.js';
import { EstadoDJ } from '../../domain/declaracion-jurada/types/EstadoDJ.js';
import { RolInstitucional } from '../../domain/gestion-docente/types/RolInstitucional.js';
import { AgenteDjSchemas } from './agenteSchemas.js';
import { LoginSchema } from '../validators/auth.validator.js';
import { CreateDjSchema, ListDjQuerySchema, TransicionDjSchema, UpdateDjCamposSchema } from '../validators/dj.validator.js';
import { ValidarDJSchema } from '../validators/asistente.validator.js';
import { AsistenteTramitesSchema } from '../validators/asistenteTramites.validator.js';
import { AtenderOrquestadorSchema } from '../validators/orquestador.validator.js';
import { ConfirmarAgenteDjSchema, PreguntarAgenteDjSchema } from '../validators/agenteDj.validator.js';
import { ConsultarCalendarioQuerySchema, PublicarCalendarioSchema } from '../validators/calendario.validator.js';
import { ActualizarPerfilSchema, AsignarRolSchema } from '../validators/gestionDocente.validator.js';

extendZodWithOpenApi(z);

/**
 * Contrato OpenAPI del backend GENERADO desde el código: los cuerpos de entrada son los mismos
 * esquemas Zod que valida la API (`api/validators/*`), y los enums salen de los tipos del dominio.
 * No se edita `openapi.json` a mano: `npm run openapi:export` lo regenera y el CI falla si difiere.
 * @see docs/product/FSD.md — cada operación declara su caso de uso en `x-fsd-uc`
 */
const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });
registry.registerComponent('securitySchemes', 'demoAuth', { type: 'apiKey', in: 'header', name: 'X-SGAI-Demo-User' });

// ── Esquemas compartidos ─────────────────────────────────────────────────────────────────────
const ErrorSchema = registry.register(
  'Error',
  z.object({
    error: z.string().describe('Código estable, p. ej. CROSS_FACULTY_FORBIDDEN.'),
    message: z.string().optional(),
    details: z.record(z.unknown()).optional().describe('Errores por campo (solo 422).'),
    correlationId: z.string(),
  })
);
const RolSchema = registry.register('Rol', z.nativeEnum(Rol));
const EstadoDJSchema = registry.register('EstadoDJ', z.nativeEnum(EstadoDJ));
const RolInstitucionalSchema = registry.register('RolInstitucional', z.nativeEnum(RolInstitucional));
const PeriodoSchema = z.string().regex(/^\d{4}-(I|II)$/).openapi({ example: '2026-I' });
const correlationId = z.string();
const libre = z.record(z.unknown());

const DJResumen = registry.register(
  'DJResumen',
  z.object({
    id: z.string(),
    tipo: z.string(),
    periodoAcademico: PeriodoSchema,
    estado: EstadoDJSchema,
    updatedAt: z.string().datetime(),
  })
);
const DJDetalle = registry.register(
  'DJDetalle',
  z.object({
    id: z.string(),
    docenteId: z.string(),
    facultadId: z.string(),
    tipo: z.string(),
    periodoAcademico: PeriodoSchema,
    estado: EstadoDJSchema,
    camposFormulario: libre,
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    historial: z
      .array(
        z.object({
          id: z.string(),
          estadoAnterior: EstadoDJSchema,
          estadoNuevo: EstadoDJSchema,
          actorId: z.string(),
          observaciones: z.string().nullable().optional(),
          timestamp: z.string().datetime(),
        })
      )
      .optional(),
    correlationId,
  })
);
const PerfilDocente = registry.register(
  'PerfilDocente',
  z.object({
    docenteId: z.string(),
    formacion_academica: z.array(libre),
    publicaciones: z.array(libre),
    experiencia_docente: z.array(libre),
    updatedAt: z.string().datetime().nullable().describe('null mientras el perfil no se haya editado.'),
  })
);
const EventoCalendario = registry.register(
  'EventoCalendario',
  z.object({
    tipo: z.enum(TIPOS_EVENTO_CALENDARIO as [string, ...string[]]),
    nombre: z.string(),
    fechaInicio: z.string().date(),
    fechaFin: z.string().date().describe('No puede ser anterior a fechaInicio.'),
  })
);
const EventoCalendarioConsulta = registry.register(
  'EventoCalendarioConsulta',
  EventoCalendario.extend({ ambito: z.enum(['INSTITUCIONAL', 'FACULTAD']) })
);

// ── Helpers ──────────────────────────────────────────────────────────────────────────────────
type CodigoError = 400 | 401 | 403 | 404 | 422 | 429;
const DESCRIPCION_ERROR: Record<CodigoError, string> = {
  400: 'El cuerpo de la petición no es un JSON válido.',
  401: 'Falta el token, es inválido o expiró.',
  403: 'El rol o los datos no permiten la operación.',
  404: 'El recurso no existe.',
  422: 'Los datos enviados no cumplen la validación.',
  429: 'Cuenta bloqueada o demasiados intentos.',
};

interface Operacion {
  operationId: string;
  method: RouteConfig['method'];
  path: string;
  tag: string;
  summary: string;
  description?: string;
  /** Caso de uso del FSD que implementa la operación */
  uc?: string;
  seguridad?: 'bearer' | 'demo' | 'publica';
  params?: z.AnyZodObject;
  query?: z.AnyZodObject;
  body?: z.ZodTypeAny;
  ok: { status: 200 | 201; descripcion: string; schema: z.ZodTypeAny };
  errores?: CodigoError[];
  fueraDelPrefijo?: boolean;
}

function declarar(o: Operacion): void {
  const seguridad = o.seguridad ?? 'bearer';
  const errores = new Set<CodigoError>(o.errores ?? []);
  if (seguridad === 'bearer') errores.add(401);
  if (o.body) {
    errores.add(400);
    errores.add(422);
  }

  const responses: RouteConfig['responses'] = {
    [o.ok.status]: { description: o.ok.descripcion, content: { 'application/json': { schema: o.ok.schema } } },
  };
  for (const codigo of [...errores].sort()) {
    responses[codigo] = { description: DESCRIPCION_ERROR[codigo], content: { 'application/json': { schema: ErrorSchema } } };
  }

  registry.registerPath({
    operationId: o.operationId,
    method: o.method,
    path: o.path,
    tags: [o.tag],
    summary: o.summary,
    description: o.description ?? o.summary,
    ...(o.uc ? { 'x-fsd-uc': o.uc } : {}),
    ...(o.fueraDelPrefijo ? { servers: [{ url: '/' }] } : {}),
    security: seguridad === 'publica' ? [] : seguridad === 'demo' ? [{ demoAuth: [] }] : [{ bearerAuth: [] }],
    request: {
      ...(o.params ? { params: o.params } : {}),
      ...(o.query ? { query: o.query } : {}),
      ...(o.body ? { body: { required: true, content: { 'application/json': { schema: o.body } } } } : {}),
    },
    responses,
  } as RouteConfig);
}

const idParam = z.object({ id: z.string() });

// ── Sistema y autenticación ──────────────────────────────────────────────────────────────────
declarar({
  operationId: 'health',
  method: 'get',
  path: '/health',
  tag: 'Sistema',
  summary: 'Estado del servicio',
  seguridad: 'publica',
  fueraDelPrefijo: true,
  ok: { status: 200, descripcion: 'El servicio responde.', schema: z.object({ status: z.string(), module: z.string() }) },
});

declarar({
  operationId: 'login',
  method: 'post',
  path: '/auth/login',
  tag: 'Autenticación',
  summary: 'Iniciar sesión',
  description: 'Valida credenciales (LDAP con respaldo local). 5 intentos fallidos bloquean la cuenta 15 minutos (RB-07).',
  uc: 'FSD-UC-001',
  seguridad: 'publica',
  body: LoginSchema,
  ok: {
    status: 200,
    descripcion: 'Sesión iniciada.',
    schema: z.object({ token: z.string(), rol: RolSchema, nombreCompleto: z.string(), facultadId: z.string(), correlationId }),
  },
  errores: [401, 403, 429],
});

// ── Declaraciones juradas (FSD-UC-002) ───────────────────────────────────────────────────────
declarar({
  operationId: 'listarDeclaracionesJuradas',
  method: 'get',
  path: '/declaraciones-juradas',
  tag: 'Declaraciones juradas',
  summary: 'Listar las declaraciones juradas visibles para el actor',
  uc: 'FSD-UC-002',
  query: ListDjQuerySchema,
  ok: {
    status: 200,
    descripcion: 'Lista paginada.',
    schema: z.object({ items: z.array(DJResumen), total: z.number().int(), correlationId }),
  },
  errores: [403, 422],
});
declarar({
  operationId: 'crearDeclaracionJurada',
  method: 'post',
  path: '/declaraciones-juradas',
  tag: 'Declaraciones juradas',
  summary: 'Crear una declaración jurada en BORRADOR',
  description: 'Solo docentes con vinculación activa (RB-01).',
  uc: 'FSD-UC-002',
  body: CreateDjSchema.extend({ camposFormulario: z.record(z.unknown()).openapi({ minProperties: 1 }) }),
  ok: {
    status: 201,
    descripcion: 'Declaración jurada creada.',
    schema: z.object({ id: z.string(), estado: EstadoDJSchema, correlationId }),
  },
  errores: [403],
});
declarar({
  operationId: 'estadisticasDeclaracionesJuradas',
  method: 'get',
  path: '/declaraciones-juradas/estadisticas',
  tag: 'Declaraciones juradas',
  summary: 'Conteo de declaraciones juradas por estado',
  description:
    'DOCENTE ve solo las suyas; ADMIN_FACULTAD solo su facultad (RB-05); TECNICO_DPA y ADMIN_SISTEMA ven todas y pueden filtrar por facultad.',
  uc: 'FSD-UC-002',
  query: z.object({ facultadId: z.string().optional() }),
  ok: {
    status: 200,
    descripcion: 'Conteo por estado, con 0 donde no hay declaraciones.',
    schema: z.object({ porEstado: z.record(z.number().int()), total: z.number().int(), correlationId }),
  },
  errores: [403],
});
declarar({
  operationId: 'obtenerDeclaracionJurada',
  method: 'get',
  path: '/declaraciones-juradas/{id}',
  tag: 'Declaraciones juradas',
  summary: 'Detalle de una declaración jurada con su historial',
  uc: 'FSD-UC-002',
  params: idParam,
  ok: { status: 200, descripcion: 'Detalle e historial de estados.', schema: DJDetalle },
  errores: [403, 404],
});
declarar({
  operationId: 'editarDeclaracionJurada',
  method: 'patch',
  path: '/declaraciones-juradas/{id}',
  tag: 'Declaraciones juradas',
  summary: 'Editar los campos de una declaración jurada (solo BORRADOR o DEVUELTA)',
  description: 'Una declaración aprobada o en revisión no es editable (RB-03).',
  uc: 'FSD-UC-002',
  params: idParam,
  body: UpdateDjCamposSchema,
  ok: { status: 200, descripcion: 'Declaración actualizada.', schema: DJDetalle },
  errores: [403, 404],
});
declarar({
  operationId: 'transicionarDeclaracionJurada',
  method: 'patch',
  path: '/declaraciones-juradas/{id}/estado',
  tag: 'Declaraciones juradas',
  summary: 'Transicionar el estado de una declaración jurada',
  description: 'Máquina de estados de la declaración. El cambio de estado y su historial se guardan en una sola transacción (RB-06).',
  uc: 'FSD-UC-002',
  params: idParam,
  body: TransicionDjSchema,
  ok: {
    status: 200,
    descripcion: 'Transición aplicada.',
    schema: z.object({
      id: z.string(),
      estadoAnterior: EstadoDJSchema,
      estadoNuevo: EstadoDJSchema,
      historialId: z.string(),
      notificacionEncolada: z.boolean().optional(),
      correlationId,
    }),
  },
  errores: [403, 404],
});

// ── Gestión docente (FSD-UC-009 y FSD-UC-006) ────────────────────────────────────────────────
declarar({
  operationId: 'asignarRolInstitucional',
  method: 'patch',
  path: '/admin/docentes/{id}/rol-institucional',
  tag: 'Gestión docente',
  summary: 'Asignar o revocar el rol institucional de un docente',
  description:
    'ADMIN_FACULTAD solo gestiona docentes de su facultad (RB-05, 403 CROSS_FACULTY_FORBIDDEN); ADMIN_SISTEMA gestiona a cualquiera. El cambio y su registro de auditoría (actor y fecha) se guardan de forma atómica (RB-06). null revoca el rol.',
  uc: 'FSD-UC-009',
  params: idParam,
  body: AsignarRolSchema,
  ok: {
    status: 200,
    descripcion: 'Rol actualizado.',
    schema: z.object({
      docenteId: z.string(),
      rolAnterior: RolInstitucionalSchema.nullable(),
      rolNuevo: RolInstitucionalSchema.nullable(),
      correlationId,
    }),
  },
  errores: [403, 404],
});
declarar({
  operationId: 'obtenerPerfilDocente',
  method: 'get',
  path: '/perfil-docente',
  tag: 'Gestión docente',
  summary: 'Consultar el perfil y CV docente',
  description:
    'DOCENTE consulta el suyo; ADMIN_SISTEMA consulta el de un docente indicado con docenteId (solo lectura). Un docente que pide el de otro recibe 403 UNAUTHORIZED_DATA_ACCESS. Si el perfil aún no existe, devuelve uno con secciones vacías.',
  uc: 'FSD-UC-006',
  query: z.object({ docenteId: z.string().optional().describe('Obligatorio para ADMIN_SISTEMA.') }),
  ok: { status: 200, descripcion: 'Perfil del docente.', schema: z.object({ perfil: PerfilDocente, correlationId }) },
  errores: [403, 422],
});
const perfilActualizado = z.object({ perfil: PerfilDocente, updatedAt: z.string().datetime().nullable(), correlationId });
declarar({
  operationId: 'actualizarPerfilDocente',
  method: 'patch',
  path: '/perfil-docente',
  tag: 'Gestión docente',
  summary: 'Editar una sección del propio perfil (UPSERT)',
  description: 'Solo el docente titular edita su perfil (RB-04). El contenido del CV nunca se registra en logs (Ley 164).',
  uc: 'FSD-UC-006',
  body: ActualizarPerfilSchema,
  ok: { status: 200, descripcion: 'Perfil actualizado.', schema: perfilActualizado },
  errores: [403],
});
declarar({
  operationId: 'actualizarPerfilDeDocente',
  method: 'patch',
  path: '/perfil-docente/{docenteId}',
  tag: 'Gestión docente',
  summary: 'Editar una sección del perfil indicando el docente',
  description: 'Igual que PATCH /perfil-docente; si docenteId no es el del usuario autenticado responde 403 FORBIDDEN_PROFILE_EDIT.',
  uc: 'FSD-UC-006',
  params: z.object({ docenteId: z.string() }),
  body: ActualizarPerfilSchema,
  ok: { status: 200, descripcion: 'Perfil actualizado.', schema: perfilActualizado },
  errores: [403],
});

// ── Calendario académico (FSD-UC-008) ────────────────────────────────────────────────────────
declarar({
  operationId: 'consultarCalendarioAcademico',
  method: 'get',
  path: '/calendario-academico',
  tag: 'Calendario académico',
  summary: 'Consultar el calendario académico de un período',
  description:
    'DOCENTE y ADMIN_FACULTAD ven el calendario de su facultad fusionado con el institucional, ordenado por fechaInicio. ADMIN_SISTEMA puede elegir la facultad con facultadId; sin ella ve solo el institucional.',
  uc: 'FSD-UC-008',
  query: ConsultarCalendarioQuerySchema,
  ok: {
    status: 200,
    descripcion: 'Eventos del período.',
    schema: z.object({ periodo: PeriodoSchema, eventos: z.array(EventoCalendarioConsulta), correlationId }),
  },
  errores: [403, 422],
});
declarar({
  operationId: 'publicarCalendarioAcademico',
  method: 'put',
  path: '/calendario-academico',
  tag: 'Calendario académico',
  summary: 'Publicar el calendario académico (reemplaza el existente)',
  description:
    'ADMIN_FACULTAD publica en su facultad; en otra recibe 403 CROSS_FACULTY_FORBIDDEN (RB-05). ADMIN_SISTEMA publica el calendario institucional (sin facultadId) o el de una facultad.',
  uc: 'FSD-UC-008',
  body: PublicarCalendarioSchema,
  ok: {
    status: 200,
    descripcion: 'Calendario publicado.',
    schema: z.object({
      calendario: z.object({
        periodo: PeriodoSchema,
        facultadId: z.string().nullable().describe('null = calendario institucional.'),
        eventos: z.array(EventoCalendario),
        updatedAt: z.string().datetime(),
      }),
      correlationId,
    }),
  },
  errores: [403],
});

// ── Asistentes de IA ─────────────────────────────────────────────────────────────────────────
declarar({
  operationId: 'validarDeclaracionConModelo',
  method: 'post',
  path: '/asistente/validar-dj',
  tag: 'Asistentes de IA',
  summary: 'Consulta del Admin. Facultad al modelo sobre una declaración jurada puntual',
  description: 'Autenticación de demostración por el encabezado X-SGAI-Demo-User; solo el perfil admin_facultad.',
  seguridad: 'demo',
  body: ValidarDJSchema,
  ok: {
    status: 200,
    descripcion: 'Declaración encontrada y respuesta del modelo.',
    schema: z.object({ dj: libre, respuestaModelo: z.string(), correlationId }),
  },
  errores: [403, 404],
});
declarar({
  operationId: 'estadoAsistenteTramites',
  method: 'get',
  path: '/asistente-tramites/estado',
  tag: 'Asistentes de IA',
  summary: 'Estado del asistente de trámites de la DPA',
  seguridad: 'publica',
  ok: {
    status: 200,
    descripcion: 'Configuración del asistente.',
    schema: z.object({
      iaHabilitada: z.boolean(),
      fuenteDatos: z.string(),
      totalTramites: z.number().int(),
      departamentos: z.array(z.string()),
      correlationId,
    }),
  },
});
declarar({
  operationId: 'preguntarAsistenteTramites',
  method: 'post',
  path: '/asistente-tramites/preguntar',
  tag: 'Asistentes de IA',
  summary: 'Preguntar por un trámite de la DPA (chat público del login)',
  description: 'Cascada palabra clave, RAG, LLM-router y alternativa, siempre citando la fuente.',
  seguridad: 'publica',
  body: AsistenteTramitesSchema,
  ok: {
    status: 200,
    descripcion: 'Respuesta con su camino y su fuente.',
    schema: z
      .object({
        respuesta: z.string(),
        camino: z.string().nullable().optional(),
        herramienta: z.string().nullable().optional(),
        fuente: libre.nullable().optional(),
        correlationId,
      })
      .passthrough(),
  },
});
declarar({
  operationId: 'preguntarAgenteDj',
  method: 'post',
  path: '/agente-dj/preguntar',
  tag: 'Asistentes de IA',
  summary: 'Preguntar al agente MCP sobre declaraciones juradas',
  description:
    'Roles ADMIN_FACULTAD y TECNICO_DPA. Si el agente propone una escritura, la respuesta trae confirmacionPendiente y sessionId: nada se ejecuta hasta POST /agente-dj/confirmar.',
  body: PreguntarAgenteDjSchema,
  ok: { status: 200, descripcion: 'Resultado del turno del agente.', schema: AgenteDjSchemas.resultado },
  errores: [403],
});
declarar({
  operationId: 'confirmarAccionAgenteDj',
  method: 'post',
  path: '/agente-dj/confirmar',
  tag: 'Asistentes de IA',
  summary: 'Confirmar o cancelar la acción propuesta por el agente',
  body: ConfirmarAgenteDjSchema,
  ok: { status: 200, descripcion: 'Resultado de la confirmación.', schema: AgenteDjSchemas.resultado },
  errores: [403, 404],
});
declarar({
  operationId: 'atenderOrquestador',
  method: 'post',
  path: '/orquestador/atender',
  tag: 'Asistentes de IA',
  summary: 'Chat de atención con orquestación por rol y estado',
  description: 'Roles DOCENTE, ADMIN_FACULTAD y TECNICO_DPA. Una conversación escalada no vuelve a pasar por IA.',
  body: AtenderOrquestadorSchema,
  ok: {
    status: 200,
    descripcion: 'Respuesta del turno.',
    schema: z.object({
      conversacionId: z.string(),
      respuesta: z.string(),
      intencion: z.enum(['CONSULTA_ESTADO_DJ', 'DUDA_NORMATIVA', 'REPORTAR_PROBLEMA', 'OTRO']),
      nodo: z.string(),
      estadoFlujo: z.enum(['ABIERTA', 'ESCALADA']),
      correlationId,
    }),
  },
  errores: [403],
});

/** Documento OpenAPI 3.0 completo, listo para serializar a `openapi.json`. */
export function construirDocumentoOpenApi() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'SGAI API — Sistema de Gestión Académica Integral',
      version: '8.2.0',
      description:
        'Contrato generado desde el código del backend (Express + Zod). Prefijo /api/v1 (salvo /health). Autenticación: Bearer JWT de POST /auth/login. Toda respuesta incluye correlationId. Cada operación indica el caso de uso del FSD que implementa en x-fsd-uc.',
      contact: { name: 'Equipo DPA — Carolina Aguilar' },
      license: { name: 'Uso académico — UMSS' },
    },
    servers: [{ url: '/api/v1' }],
    tags: [
      { name: 'Sistema', description: 'Salud del servicio.' },
      { name: 'Autenticación', description: 'Login y control de acceso por roles.' },
      { name: 'Declaraciones juradas', description: 'Ciclo de la declaración jurada.' },
      { name: 'Gestión docente', description: 'Roles institucionales y perfil del docente.' },
      { name: 'Calendario académico', description: 'Publicación y consulta del calendario.' },
      { name: 'Asistentes de IA', description: 'Asistente de trámites, agente MCP y orquestador.' },
    ],
    security: [{ bearerAuth: [] }],
  });
}
