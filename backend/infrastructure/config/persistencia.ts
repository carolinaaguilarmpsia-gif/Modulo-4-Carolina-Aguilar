import { resolve } from 'node:path';
import type { IUsuarioRepository } from '../../domain/administracion/ports/out/IUsuarioRepository.js';
import type { IPerfilDocenteRepository } from '../../domain/gestion-docente/ports/out/IPerfilDocenteRepository.js';
import type { IRolInstitucionalRepository } from '../../domain/gestion-docente/ports/out/IRolInstitucionalRepository.js';
import type { ITramiteRepository } from '../../domain/tramites-dpa/ports/out/ITramiteRepository.js';
import type { IConversacionRepository } from '../../domain/orquestador-atencion/ports/out/IConversacionRepository.js';
import { InMemoryPerfilDocenteRepository } from '../persistence/InMemoryPerfilDocenteRepository.js';
import { InMemoryRolInstitucionalRepository } from '../persistence/InMemoryRolInstitucionalRepository.js';
import { InMemoryUsuarioRepository } from '../persistence/InMemoryUsuarioRepository.js';
import { JsonConversacionRepository } from '../persistence/JsonConversacionRepository.js';
import { JsonTramiteRepository } from '../persistence/JsonTramiteRepository.js';
import { PgConversacionRepository } from '../persistence/PgConversacionRepository.js';
import { PgPerfilDocenteRepository } from '../persistence/PgPerfilDocenteRepository.js';
import { PgRolInstitucionalRepository } from '../persistence/PgRolInstitucionalRepository.js';
import { PgTramiteRepository } from '../persistence/PgTramiteRepository.js';
import { PgUsuarioRepository } from '../persistence/PgUsuarioRepository.js';
import { crearPool } from '../persistence/postgres/pool.js';

export interface Persistencia {
  usuarios: IUsuarioRepository;
  perfiles: IPerfilDocenteRepository;
  rolesInstitucionales: IRolInstitucionalRepository;
  tramites: ITramiteRepository;
  conversaciones: IConversacionRepository;
  motor: 'postgres' | 'memoria-y-archivos';
}

/**
 * Elige dónde viven usuarios, perfiles, roles institucionales, trámites y conversaciones. Con
 * DATABASE_URL usa PostgreSQL. Sin ella, en producción falla (igual que JWT_SECRET); fuera de
 * producción usa memoria y los archivos de backend/data, para correr las pruebas y la demo sin base.
 */
export async function crearPersistencia(dirBackend: string, env: NodeJS.ProcessEnv = process.env): Promise<Persistencia> {
  const url = env.DATABASE_URL;
  if (url) {
    const pool = crearPool(url);
    return {
      usuarios: new PgUsuarioRepository(pool),
      perfiles: new PgPerfilDocenteRepository(pool),
      rolesInstitucionales: new PgRolInstitucionalRepository(pool),
      tramites: await PgTramiteRepository.cargar(pool),
      conversaciones: new PgConversacionRepository(pool),
      motor: 'postgres',
    };
  }
  if (env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL es obligatorio en producción. Defínelo en el entorno (ver backend/.env.example).');
  }
  console.warn('[SGAI] DATABASE_URL no configurado — usando memoria y los archivos de backend/data solo para desarrollo local.');
  return {
    usuarios: new InMemoryUsuarioRepository(),
    perfiles: new InMemoryPerfilDocenteRepository(),
    rolesInstitucionales: new InMemoryRolInstitucionalRepository(),
    tramites: new JsonTramiteRepository(resolve(dirBackend, 'data/db.json')),
    conversaciones: new JsonConversacionRepository(resolve(dirBackend, 'data/conversaciones.json')),
    motor: 'memoria-y-archivos',
  };
}
