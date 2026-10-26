/**
 * Jerarquía de errores de dominio SGAI.
 * @see docs/.cursor/rules/sgai-domain.mdc §7
 */

export const USER_MESSAGES_ES_BO = {
  INACTIVE_BINDING: 'El docente no tiene vinculación activa con la institución. No puede generar declaraciones juradas.',
  FORBIDDEN_TRANSITION: 'La declaración jurada no puede modificarse en su estado actual.',
  OBSERVATIONS_REQUIRED: 'Debe ingresar observaciones para devolver o rechazar el trámite.',
  DJ_NOT_FOUND: 'La declaración jurada solicitada no fue encontrada.',
  INVALID_STATE_TRANSITION: 'La acción solicitada no es válida para el estado actual del trámite.',
  PERSISTENCE_ERROR: 'No se pudo persistir el cambio de estado. Intente nuevamente.',
  // @see FSD-UC-001 · PR-IMPL-003 · RB-07
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  ACCOUNT_LOCKED: 'La cuenta está bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente en unos minutos.',
  INSUFFICIENT_ROLE: 'No tiene permisos para acceder a este recurso.',
  TOKEN_EXPIRED: 'La sesión expiró. Inicie sesión nuevamente.',
  TOKEN_INVALID: 'Token de autenticación inválido.',
  // @see ResponderConsultaDJService — búsqueda de docente/DJ real a partir de la consulta del admin
  DOCENTE_NOT_FOUND: 'No se encontró ningún docente con ese nombre.',
  DOCENTE_AMBIGUO: 'Hay más de un docente que coincide con ese nombre. Sea más específico.',
  // @see AgenteDJService — confirmación de acciones de escritura propuestas por el agente
  AGENTE_SESION_NOT_FOUND: 'La confirmación solicitada expiró o no existe. Vuelva a preguntarle al asistente.',
  AGENTE_SESION_AJENA: 'Esta confirmación pertenece a otra sesión.',
  // @see OrquestadorAtencionService — redteam/hallazgos/AI-SEC-001.md (AI-SEC-002)
  CONVERSACION_AJENA: 'Esta conversación pertenece a otro usuario. Inicie una conversación nueva.',
  // @see FSD-UC-009 · FSD-UC-006 · FSD-UC-008 — RB-04, RB-05
  CROSS_FACULTY_FORBIDDEN: 'No puede gestionar datos de otra facultad.',
  INVALID_ROL_INSTITUCIONAL: 'El rol institucional indicado no es válido.',
  FORBIDDEN_PROFILE_EDIT: 'Solo el docente titular puede editar su perfil.',
  UNAUTHORIZED_DATA_ACCESS: 'No tiene permiso para acceder a los datos de otro docente.',
  DOCENTE_ID_REQUIRED: 'Debe indicar el docente cuyo perfil desea consultar.',
  INVALID_DATE_RANGE: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
} as const;

export type DomainErrorCode = keyof typeof USER_MESSAGES_ES_BO;

export abstract class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    public readonly httpStatus: number,
    public readonly context?: Record<string, unknown>
  ) {
    super(USER_MESSAGES_ES_BO[code]);
    this.name = this.constructor.name;
  }
}

export class ForbiddenError extends DomainError {
  constructor(code: DomainErrorCode, ctx?: Record<string, unknown>) {
    super(code, 403, ctx);
  }
}

export class NotFoundError extends DomainError {
  constructor(code: DomainErrorCode, ctx?: Record<string, unknown>) {
    super(code, 404, ctx);
  }
}

export class ValidationError extends DomainError {
  constructor(code: DomainErrorCode, ctx?: Record<string, unknown>) {
    super(code, 422, ctx);
  }
}

/** @see FSD-UC-001 · PR-IMPL-003 — credenciales inválidas o token ausente/inválido/expirado */
export class UnauthorizedError extends DomainError {
  constructor(code: DomainErrorCode, ctx?: Record<string, unknown>) {
    super(code, 401, ctx);
  }
}
