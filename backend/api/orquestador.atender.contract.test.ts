import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import express from 'express';
import request from 'supertest';
import { DeclaracionJuradaService } from '../domain/declaracion-jurada/services/DeclaracionJuradaService.js';
import { AsistenteTramitesService } from '../domain/tramites-dpa/services/AsistenteTramitesService.js';
import { OrquestadorAtencionService } from '../domain/orquestador-atencion/services/OrquestadorAtencionService.js';
import { ClasificarIntencionService } from '../domain/orquestador-atencion/services/ClasificarIntencionService.js';
import type { ILlmClient } from '../domain/orquestador-atencion/ports/out/ILlmClient.js';
import { Rol } from '../domain/administracion/types/Rol.js';
import { InMemoryUsuarioRepository } from '../infrastructure/persistence/InMemoryUsuarioRepository.js';
import { InMemoryDeclaracionJuradaRepository } from '../infrastructure/persistence/InMemoryDeclaracionJuradaRepository.js';
import { JsonConversacionRepository } from '../infrastructure/persistence/JsonConversacionRepository.js';
import { JsonTramiteRepository } from '../infrastructure/persistence/JsonTramiteRepository.js';
import { ConsoleNotificacionPublisher } from '../infrastructure/notifications/ConsoleNotificacionPublisher.js';
import { ConsoleEscalamientoPublisher } from '../infrastructure/notifications/ConsoleEscalamientoPublisher.js';
import { JwtSigner } from '../infrastructure/auth/JwtSigner.js';
import { OrquestadorController } from './controllers/orquestador.controller.js';
import { createOrquestadorRouter } from './routes/orquestador.routes.js';
import { globalErrorHandler } from './middleware/auth.middleware.js';

// Import assertions de JSON son frágiles bajo ts-jest/ESM — se leen los schemas del disco,
// igual de reales, sin depender de flags de módulo.
const __dirname = dirname(fileURLToPath(import.meta.url));
function leerSchema(nombre: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(__dirname, 'contracts', nombre), 'utf-8'));
}
const schema200 = leerSchema('orquestador-atender.200.schema.json');
const schemaErrorDominio = leerSchema('orquestador-atender.error-dominio.schema.json');
const schemaErrorValidacion = leerSchema('orquestador-atender.error-validacion.schema.json');

/**
 * Contrato — Actividad 3, paso 6. Endpoint principal del producto: POST /orquestador/atender
 * (el chat de atención, la pieza más visible del sistema — @see README "Nivel 5").
 *
 * Se valida la FORMA de la respuesta contra un JSON Schema (campos, tipos, catálogos cerrados
 * de `intencion`/`estadoFlujo`, y el código HTTP) — nunca el CONTENIDO del texto de `respuesta`,
 * que lo redacta el modelo o la lógica de negocio y ya se prueba en las suites de unit/integración.
 *
 * Wiring REAL de punta a punta (Express real, JwtSigner real con verificación HS256 real,
 * InMemoryUsuarioRepository/InMemoryDeclaracionJuradaRepository reales, JsonConversacionRepository
 * apuntando a un archivo REAL en disco, JsonTramiteRepository leyendo un db.json REAL) — la única
 * pieza sustituida es el LLM del clasificador (frontera de red/modelo): esta suite corre en verde
 * sin GROQ_API_KEY ni Ollama levantados.
 */
describe('Contrato — POST /api/v1/orquestador/atender', () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate200 = ajv.compile(schema200);
  const validateErrorDominio = ajv.compile(schemaErrorDominio);
  const validateErrorValidacion = ajv.compile(schemaErrorValidacion);

  const JWT_SECRET = 'contract-test-secret-no-usar-en-produccion';
  let dirTemporal: string;
  let app: express.Express;
  let jwtSigner: JwtSigner;
  let usuarios: InMemoryUsuarioRepository;

  beforeEach(() => {
    dirTemporal = mkdtempSync(join(tmpdir(), 'sgai-contract-'));
    const rutaDbJson = join(dirTemporal, 'db.json');
    writeFileSync(rutaDbJson, JSON.stringify([{ departamento: 'Personal Académico', tramites: [] }]), 'utf-8');
    const rutaConversaciones = join(dirTemporal, 'conversaciones.json');

    jwtSigner = new JwtSigner(JWT_SECRET);
    usuarios = new InMemoryUsuarioRepository();

    const djService = new DeclaracionJuradaService(new InMemoryDeclaracionJuradaRepository(), new ConsoleNotificacionPublisher());
    const asistenteTramites = new AsistenteTramitesService(new JsonTramiteRepository(rutaDbJson), null, false);

    // Única pieza NO real — el LLM del clasificador. Nunca redacta la respuesta final,
    // solo clasifica; acá lo hacemos fallar a propósito para forzar el camino determinístico
    // (degrada a OTRO), exactamente lo que exige la Actividad: "sin modelo ni red encendidos".
    const llmFake: ILlmClient = {
      preguntar: async () => {
        throw new Error('contrato: LLM deshabilitado a propósito, no debe haber red encendida');
      },
    };

    const orquestadorService = new OrquestadorAtencionService(
      new JsonConversacionRepository(rutaConversaciones),
      new ClasificarIntencionService(llmFake),
      usuarios,
      djService,
      asistenteTramites,
      new ConsoleEscalamientoPublisher()
    );

    app = express();
    app.use(express.json());
    app.use('/api/v1/orquestador', createOrquestadorRouter(new OrquestadorController(orquestadorService), jwtSigner, usuarios));
    app.use(globalErrorHandler);
  });

  afterEach(() => {
    rmSync(dirTemporal, { recursive: true, force: true });
  });

  function tokenPara(rol: Rol, overrides: { userId?: string; facultadId?: string } = {}): string {
    return jwtSigner.sign({
      userId: overrides.userId ?? 'docente-1',
      email: 'docente@universidad.edu.bo',
      rol,
      facultadId: overrides.facultadId ?? 'facultad-1',
    });
  }

  it('200: la forma de la respuesta cumple el schema — campos, tipos y catálogos cerrados (no el texto)', async () => {
    const res = await request(app)
      .post('/api/v1/orquestador/atender')
      .set('Authorization', `Bearer ${tokenPara(Rol.DOCENTE)}`)
      .send({ mensaje: 'hola, ¿cómo estás?' });

    expect(res.status).toBe(200);
    const valido = validate200(res.body);
    expect(validate200.errors).toBeNull();
    expect(valido).toBe(true);

    // Estos SÍ son parte del contrato (catálogo cerrado) — sin tocar el contenido de `respuesta`.
    expect(res.body.intencion).toBe('OTRO'); // el LLM fake siempre falla → degrada a OTRO
    expect(res.body.estadoFlujo).toBe('ABIERTA');
    expect(typeof res.body.respuesta).toBe('string');
  });

  it('401: sin Authorization header devuelve el envelope de error de dominio, código TOKEN_INVALID', async () => {
    const res = await request(app).post('/api/v1/orquestador/atender').send({ mensaje: 'hola' });

    expect(res.status).toBe(401);
    expect(validateErrorDominio(res.body)).toBe(true);
    expect(res.body.error).toBe('TOKEN_INVALID');
  });

  it('403: un rol fuera de la lista permitida (ADMIN_SISTEMA) devuelve INSUFFICIENT_ROLE', async () => {
    const res = await request(app)
      .post('/api/v1/orquestador/atender')
      .set('Authorization', `Bearer ${tokenPara(Rol.ADMIN_SISTEMA)}`)
      .send({ mensaje: 'hola' });

    expect(res.status).toBe(403);
    expect(validateErrorDominio(res.body)).toBe(true);
    expect(res.body.error).toBe('INSUFFICIENT_ROLE');
  });

  it('422: un mensaje demasiado corto devuelve VALIDATION_ERROR con el detalle por campo', async () => {
    const res = await request(app)
      .post('/api/v1/orquestador/atender')
      .set('Authorization', `Bearer ${tokenPara(Rol.DOCENTE)}`)
      .send({ mensaje: 'h' }); // AtenderOrquestadorSchema exige min(2)

    expect(res.status).toBe(422);
    expect(validateErrorValidacion(res.body)).toBe(true);
    expect(res.body.details).toHaveProperty('mensaje');
  });
});
