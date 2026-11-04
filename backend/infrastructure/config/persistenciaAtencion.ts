import { resolve } from 'node:path';
import type { ITramiteRepository } from '../../domain/tramites-dpa/ports/out/ITramiteRepository.js';
import type { IConversacionRepository } from '../../domain/orquestador-atencion/ports/out/IConversacionRepository.js';
import { JsonConversacionRepository } from '../persistence/JsonConversacionRepository.js';
import { JsonTramiteRepository } from '../persistence/JsonTramiteRepository.js';
import { PgConversacionRepository } from '../persistence/PgConversacionRepository.js';
import { PgTramiteRepository } from '../persistence/PgTramiteRepository.js';
import { crearPool } from '../persistence/postgres/pool.js';

export interface PersistenciaAtencion {
  tramites: ITramiteRepository;
  conversaciones: IConversacionRepository;
  motor: 'postgres' | 'archivos-json';
}

/**
 * Elige dónde viven los trámites y las conversaciones. Con DATABASE_URL usa PostgreSQL. Sin ella,
 * en producción falla (igual que JWT_SECRET); fuera de producción cae a los archivos de backend/data
 * para poder correr las pruebas y el modo demo sin levantar una base.
 */
export async function crearPersistenciaAtencion(dirBackend: string, env: NodeJS.ProcessEnv = process.env): Promise<PersistenciaAtencion> {
  const url = env.DATABASE_URL;
  if (url) {
    const pool = crearPool(url);
    return { tramites: await PgTramiteRepository.cargar(pool), conversaciones: new PgConversacionRepository(pool), motor: 'postgres' };
  }
  if (env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL es obligatorio en producción. Defínelo en el entorno (ver backend/.env.example).');
  }
  console.warn('[SGAI] DATABASE_URL no configurado — usando los archivos de backend/data solo para desarrollo local.');
  return {
    tramites: new JsonTramiteRepository(resolve(dirBackend, 'data/db.json')),
    conversaciones: new JsonConversacionRepository(resolve(dirBackend, 'data/conversaciones.json')),
    motor: 'archivos-json',
  };
}
