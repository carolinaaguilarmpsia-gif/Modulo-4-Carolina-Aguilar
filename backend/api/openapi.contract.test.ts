import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from './app.js';
import { construirDocumentoOpenApi } from './openapi/document.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

type Operacion = {
  servers?: { url: string }[];
  security?: unknown[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
  'x-fsd-uc'?: string;
};
type Spec = {
  openapi: string;
  servers: { url: string }[];
  paths: Record<string, Record<string, unknown>>;
  components: Record<string, Record<string, unknown>>;
};

const archivo = JSON.parse(readFileSync(join(__dirname, '../../openapi.json'), 'utf-8')) as Spec;
const spec = archivo;
const METODOS = ['get', 'post', 'put', 'patch', 'delete'];

/** `servers` de la operación (si lo trae) o los globales, unido a la ruta: así `/health` queda fuera de `/api/v1`. */
function rutaCompleta(ruta: string, op: Operacion): string {
  const base = (op.servers?.[0]?.url ?? spec.servers[0].url).replace(/\/$/, '');
  return `${base}${ruta}`.replace(/\{(\w+)\}/g, ':$1');
}

function operacionesDelContrato(): Map<string, Operacion> {
  const mapa = new Map<string, Operacion>();
  for (const [ruta, item] of Object.entries(spec.paths)) {
    for (const metodo of METODOS) {
      const op = item[metodo] as Operacion | undefined;
      if (op) mapa.set(`${metodo.toUpperCase()} ${rutaCompleta(ruta, op)}`, op);
    }
  }
  return mapa;
}

type Capa = { route?: { path: string; methods: Record<string, boolean> }; name?: string; regexp?: RegExp; handle?: { stack?: Capa[] } };

/** Recorre el stack de Express 4 y devuelve `METODO /ruta` por cada endpoint realmente montado. */
function endpointsMontados(capas: Capa[], prefijo = ''): string[] {
  const resultado: string[] = [];
  for (const capa of capas) {
    if (capa.route) {
      const ruta = `${prefijo}${capa.route.path === '/' ? '' : capa.route.path}` || '/';
      for (const metodo of Object.keys(capa.route.methods)) resultado.push(`${metodo.toUpperCase()} ${ruta}`);
    } else if (capa.name === 'router' && capa.handle?.stack && capa.regexp) {
      const montaje = capa.regexp.source
        .replace(/^\^/, '')
        .replace(/\\\/\?\(\?=\\\/\|\$\)$/, '')
        .replace(/\\\//g, '/');
      resultado.push(...endpointsMontados(capa.handle.stack, `${prefijo}${montaje}`));
    }
  }
  return resultado;
}

describe('Contrato OpenAPI — openapi.json (generado desde el código)', () => {
  const declarados = operacionesDelContrato();
  const montados = endpointsMontados((app as unknown as { _router: { stack: Capa[] } })._router.stack);

  it('openapi.json versionado coincide con lo que genera el código (sin drift)', () => {
    expect(archivo).toEqual(JSON.parse(JSON.stringify(construirDocumentoOpenApi())));
  });

  it('es un documento OpenAPI 3 con su servidor y sus rutas', () => {
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.servers[0].url).toBe('/api/v1');
    expect(declarados.size).toBeGreaterThan(0);
  });

  it('todo endpoint montado en la app está declarado en el contrato', () => {
    const sinDeclarar = montados.filter((e) => !declarados.has(e));
    expect(sinDeclarar).toEqual([]);
  });

  it('todo endpoint del contrato existe en la app (el contrato no promete rutas que no hay)', () => {
    const inexistentes = [...declarados.keys()].filter((e) => !montados.includes(e));
    expect(inexistentes).toEqual([]);
  });

  it('toda operación declara una respuesta 2xx y las protegidas declaran 401', () => {
    for (const [clave, op] of declarados) {
      const codigos = Object.keys(op.responses ?? {});
      expect({ clave, tiene2xx: codigos.some((c) => c.startsWith('2')) }).toEqual({ clave, tiene2xx: true });

      const esPublica = Array.isArray(op.security) && op.security.length === 0;
      const usaDemoAuth = JSON.stringify(op.security ?? []).includes('demoAuth');
      if (!esPublica && !usaDemoAuth) {
        expect({ clave, declara401: codigos.includes('401') }).toEqual({ clave, declara401: true });
      }
    }
  });

  it('toda operación con cuerpo de entrada declara el error 422 de validación', () => {
    for (const [clave, op] of declarados) {
      if (op.requestBody) {
        expect({ clave, declara422: Object.keys(op.responses ?? {}).includes('422') }).toEqual({ clave, declara422: true });
      }
    }
  });

  it('todo $ref apunta a algo que existe en el documento', () => {
    const rotos: string[] = [];
    const recorrer = (nodo: unknown): void => {
      if (Array.isArray(nodo)) return nodo.forEach(recorrer);
      if (nodo && typeof nodo === 'object') {
        for (const [k, v] of Object.entries(nodo)) {
          if (k === '$ref' && typeof v === 'string') {
            const destino = v.replace(/^#\//, '').split('/').reduce<unknown>(
              (actual, parte) => (actual as Record<string, unknown> | undefined)?.[parte],
              spec
            );
            if (destino === undefined) rotos.push(v);
          } else {
            recorrer(v);
          }
        }
      }
    };
    recorrer(spec);
    expect(rotos).toEqual([]);
  });

  describe('trazabilidad con el FSD — UC-009, UC-006 y UC-008', () => {
    const esperados: [string, string][] = [
      ['PATCH /api/v1/admin/docentes/:id/rol-institucional', 'FSD-UC-009'],
      ['GET /api/v1/perfil-docente', 'FSD-UC-006'],
      ['PATCH /api/v1/perfil-docente', 'FSD-UC-006'],
      ['PATCH /api/v1/perfil-docente/:docenteId', 'FSD-UC-006'],
      ['GET /api/v1/calendario-academico', 'FSD-UC-008'],
      ['PUT /api/v1/calendario-academico', 'FSD-UC-008'],
    ];

    it.each(esperados)('%s está declarado con su caso de uso %s y los errores 401, 403 y 422', (endpoint, uc) => {
      const op = declarados.get(endpoint);
      expect(op).toBeDefined();
      expect(op?.['x-fsd-uc']).toBe(uc);
      expect(Object.keys(op?.responses ?? {})).toEqual(expect.arrayContaining(['401', '403', '422']));
    });
  });
});
