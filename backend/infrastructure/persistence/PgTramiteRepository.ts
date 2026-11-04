import type { ITramiteRepository } from '../../domain/tramites-dpa/ports/out/ITramiteRepository.js';
import type { DepartamentoTramites, Tramite, TramiteConDepartamento } from '../../domain/tramites-dpa/types/Tramite.js';
import type { PgPool } from './postgres/pool.js';

interface FilaTramite {
  departamento: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  normativa: string | null;
  requisitos: string[];
  requisitos_detallados: Record<string, unknown>[] | null;
  tiempo: string;
}

/**
 * Catálogo de trámites leído desde PostgreSQL. El puerto ITramiteRepository es síncrono y de solo
 * lectura, así que el catálogo se lee una sola vez al arrancar (`cargar`) y se sirve desde memoria,
 * igual que hacía JsonTramiteRepository con db.json. Los cambios en la tabla se ven al reiniciar.
 */
export class PgTramiteRepository implements ITramiteRepository {
  private readonly departamentos: DepartamentoTramites[];
  private readonly indice = new Map<string, TramiteConDepartamento>();

  private constructor(filas: FilaTramite[]) {
    const porDepartamento = new Map<string, Tramite[]>();
    for (const f of filas) {
      const tramite: Tramite = {
        codigo: f.codigo,
        nombre: f.nombre,
        ...(f.descripcion !== null && { descripcion: f.descripcion }),
        ...(f.normativa !== null && { normativa: f.normativa }),
        requisitos: f.requisitos,
        ...(f.requisitos_detallados !== null && { requisitos_detallados: f.requisitos_detallados }),
        tiempo: f.tiempo,
      };
      if (!porDepartamento.has(f.departamento)) porDepartamento.set(f.departamento, []);
      porDepartamento.get(f.departamento)!.push(tramite);
      this.indice.set(f.codigo, { ...tramite, departamento: f.departamento });
    }
    this.departamentos = Array.from(porDepartamento, ([departamento, tramites]) => ({ departamento, tramites }));
  }

  static async cargar(pool: PgPool): Promise<PgTramiteRepository> {
    const { rows } = await pool.query<FilaTramite>(
      `SELECT d.nombre AS departamento, t.codigo, t.nombre, t.descripcion, t.normativa, t.requisitos, t.requisitos_detallados, t.tiempo
         FROM tramites t JOIN tramites_departamentos d ON d.id = t.departamento_id
        ORDER BY d.orden, t.orden`
    );
    if (rows.length === 0) {
      throw new Error('La tabla tramites está vacía: ejecute `npm run db:setup --prefix backend` para migrar y sembrar el catálogo.');
    }
    return new PgTramiteRepository(rows);
  }

  listarDepartamentos(): DepartamentoTramites[] {
    return this.departamentos;
  }

  listarTodos(): TramiteConDepartamento[] {
    return Array.from(this.indice.values());
  }

  buscarPorCodigo(codigo: string): TramiteConDepartamento | undefined {
    return this.indice.get(codigo);
  }
}
