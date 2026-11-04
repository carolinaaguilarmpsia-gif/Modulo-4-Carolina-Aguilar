import type { DepartamentoTramites, TramiteConDepartamento } from '../../types/Tramite.js';

/**
 * Puerto de salida — acceso de solo lectura al catálogo de trámites de la DPA.
 * La fuente de verdad es la tabla `tramites` de PostgreSQL (o db.json sin base); el dominio no sabe cómo se carga.
 */
export interface ITramiteRepository {
  listarDepartamentos(): DepartamentoTramites[];
  listarTodos(): TramiteConDepartamento[];
  buscarPorCodigo(codigo: string): TramiteConDepartamento | undefined;
}
