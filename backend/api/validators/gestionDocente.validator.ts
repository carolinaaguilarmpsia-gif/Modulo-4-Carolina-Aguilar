import { z } from 'zod';
import { RolInstitucional } from '../../domain/gestion-docente/types/RolInstitucional.js';

/** @see FSD-UC-009 — null revoca el rol institucional */
export const AsignarRolSchema = z.object({
  rolInstitucional: z.nativeEnum(RolInstitucional).nullable(),
});

const anio = z.number().int().min(1900).max(2100);

const FormacionSchema = z.array(
  z.object({
    titulo: z.string().trim().min(2).max(200),
    institucion: z.string().trim().min(2).max(200),
    anio,
  })
);

const PublicacionesSchema = z.array(
  z.object({
    titulo: z.string().trim().min(2).max(300),
    medio: z.string().trim().max(200).optional(),
    anio,
  })
);

const ExperienciaSchema = z.array(
  z.object({
    institucion: z.string().trim().min(2).max(200),
    cargo: z.string().trim().min(2).max(200),
    desde: anio,
    hasta: anio.nullable(),
  })
);

/** @see FSD-UC-006 — cada sección se valida con su propio schema */
export const ActualizarPerfilSchema = z.discriminatedUnion('seccion', [
  z.object({ seccion: z.literal('formacion_academica'), data: FormacionSchema }),
  z.object({ seccion: z.literal('publicaciones'), data: PublicacionesSchema }),
  z.object({ seccion: z.literal('experiencia_docente'), data: ExperienciaSchema }),
]);
