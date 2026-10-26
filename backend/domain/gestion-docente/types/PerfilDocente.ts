/** @see FSD-UC-006 — secciones editables del CV docente */
export type SeccionPerfil = 'formacion_academica' | 'publicaciones' | 'experiencia_docente';

export const SECCIONES_PERFIL: readonly SeccionPerfil[] = ['formacion_academica', 'publicaciones', 'experiencia_docente'];

export interface PerfilDocente {
  docenteId: string;
  formacion_academica: unknown[];
  publicaciones: unknown[];
  experiencia_docente: unknown[];
  /** null mientras el perfil no se haya editado nunca (se crea en el primer PATCH) */
  updatedAt: Date | null;
}
