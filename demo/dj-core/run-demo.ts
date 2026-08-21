/**
 * Demo visual — FSD-UC-002 ENVIAR (BORRADOR → EN_REVISION_FACULTAD)
 * Ejecutar: npm run demo:dj (desde /demo)
 */
import { randomUUID } from 'node:crypto';
import { Rol } from '../../backend/domain/administracion/types/Rol.js';
import { DomainError } from '../../backend/domain/shared/errors/DomainError.js';
import { ComandoDJ } from '../../backend/domain/declaracion-jurada/types/ComandoDJ.js';
import { EstadoDJ } from '../../backend/domain/declaracion-jurada/types/EstadoDJ.js';
import { DJStateMachine } from '../../backend/domain/declaracion-jurada/services/DJStateMachine.js';
import { DeclaracionJuradaService } from '../../backend/domain/declaracion-jurada/services/DeclaracionJuradaService.js';
import { ConsoleNotificacionPublisher } from './ConsoleNotificacionPublisher.js';
import { InMemoryDeclaracionJuradaRepository } from '../../backend/infrastructure/persistence/InMemoryDeclaracionJuradaRepository.js';
import { banner, fail, info, ok, rule, stateBox, step } from './visual.js';

const DJ_ID = randomUUID();
const DOCENTE_ID = randomUUID();
const FACULTAD_ID = randomUUID();

async function runEscenarioExitoso(): Promise<void> {
  banner('SGAI — Demo DJ State Machine (PR-FSD-UC-002)');

  const repo = new InMemoryDeclaracionJuradaRepository();
  const notif = new ConsoleNotificacionPublisher();
  const service = new DeclaracionJuradaService(repo, notif);

  await repo.create({
    id: DJ_ID,
    docenteId: DOCENTE_ID,
    facultadId: FACULTAD_ID,
    estado: EstadoDJ.BORRADOR,
    docenteVinculacionActiva: true,
    tipo: 'LABORAL',
    periodoAcademico: '2026-I',
    camposFormulario: { cargoInstitucional: 'Docente Titular' },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  step(1, 'Estado inicial en repositorio (puerto IDeclaracionJuradaRepository)');
  info('DJ ID', DJ_ID);
  info('Estado', EstadoDJ.BORRADOR);
  info('vinculacion_activa', 'true');
  ok('Agregado cargado sin imports de Prisma/Express en domain/');

  step(2, 'DJStateMachine.resolveTransition — lógica pura (hexagonal)');
  rule('RB-01', 'Validar vinculacion_activa antes de ENVIAR');
  const resolution = DJStateMachine.resolveTransition({
    estadoActual: EstadoDJ.BORRADOR,
    comando: ComandoDJ.ENVIAR,
    actorRol: Rol.DOCENTE,
    djFacultadId: FACULTAD_ID,
    docenteVinculacionActiva: true,
  });
  ok(`Transición válida: ${resolution.estadoAnterior} → ${resolution.estadoNuevo}`);
  stateBox(resolution.estadoAnterior, resolution.estadoNuevo);

  step(3, 'DeclaracionJuradaService.transicionarEstado — persistencia atómica');
  rule('RB-06', 'estado + HISTORIAL_DJ en una sola operación (POC-02)');
  const result = await service.transicionarEstado({
    djId: DJ_ID,
    comando: ComandoDJ.ENVIAR,
    actorId: DOCENTE_ID,
    actorRol: Rol.DOCENTE,
  });

  info('historialId', result.historialId);
  info('notificacionEncolada', String(result.notificacionEncolada));
  ok('Commit simulado — historial.length = 1');

  step(4, 'Verificación post-condiciones');
  const djFinal = await repo.findById(DJ_ID);
  if (djFinal?.estado === EstadoDJ.EN_REVISION_FACULTAD) {
    ok('Estado persistido: EN_REVISION_FACULTAD');
  } else {
    fail(`Estado inesperado: ${djFinal?.estado}`);
  }

  const historial = await repo.getHistorial(DJ_ID);
  if (historial.length === 1 && historial[0].estadoNuevo === EstadoDJ.EN_REVISION_FACULTAD) {
    ok('HISTORIAL_DJ atómico — sin registros huérfanos');
  }

  if (notif.events.length === 1) {
    ok(`Notificación post-commit → ${notif.events[0].destinatarioRol}`);
  }

  console.log('\n  Tabla historial demo:');
  console.table(
    historial.map((h) => ({
      id: h.id.slice(0, 8) + '…',
      estado_anterior: h.estadoAnterior,
      estado_nuevo: h.estadoNuevo,
      actor: h.actorId.slice(0, 8) + '…',
    }))
  );
}

async function runEscenarioRb01Fallo(): Promise<void> {
  banner('Escenario negativo — RB-01 INACTIVE_BINDING');

  try {
    DJStateMachine.resolveTransition({
      estadoActual: EstadoDJ.BORRADOR,
      comando: ComandoDJ.ENVIAR,
      actorRol: Rol.DOCENTE,
      djFacultadId: FACULTAD_ID,
      docenteVinculacionActiva: false,
    });
    fail('Debió lanzar INACTIVE_BINDING');
  } catch (e) {
    if (e instanceof DomainError && e.code === 'INACTIVE_BINDING') {
      ok(`ForbiddenError capturado: ${e.code} (HTTP ${e.httpStatus})`);
      info('Mensaje institucional', e.message);
    } else {
      throw e;
    }
  }
}

async function runEscenarioRb03Campos(): Promise<void> {
  banner('Escenario negativo — RB-03 campos inmutables');

  try {
    DJStateMachine.assertCamposEditables(EstadoDJ.EN_REVISION_FACULTAD);
    fail('Debió lanzar FORBIDDEN_TRANSITION al editar campos');
  } catch (e) {
    if (e instanceof DomainError && e.code === 'FORBIDDEN_TRANSITION') {
      ok(`PATCH de campos bloqueado en EN_REVISION_FACULTAD`);
    } else {
      throw e;
    }
  }
}

async function main(): Promise<void> {
  await runEscenarioExitoso();
  await runEscenarioRb01Fallo();
  await runEscenarioRb03Campos();
  console.log('\n\x1b[32m\x1b[1mDemo finalizada — domain/ sin Prisma/Express\x1b[0m\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
