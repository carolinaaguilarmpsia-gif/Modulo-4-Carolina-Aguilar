import { Rol } from '../../administracion/types/Rol.js';
import { ForbiddenError } from '../../shared/errors/DomainError.js';
import { InMemoryDeclaracionJuradaRepository } from '../../../infrastructure/persistence/InMemoryDeclaracionJuradaRepository.js';
import type { DeclaracionJurada } from '../entities/DeclaracionJurada.js';
import type { INotificacionPublisher } from '../ports/out/INotificacionPublisher.js';
import { EstadoDJ } from '../types/EstadoDJ.js';
import { DeclaracionJuradaService } from './DeclaracionJuradaService.js';

/**
 * Estadísticas de DJ por estado, con alcance por rol.
 * @see FSD-UC-002 · RB-05
 */
const FAC_A = 'facultad-a';
const FAC_B = 'facultad-b';

function dj(id: string, docenteId: string, facultadId: string, estado: EstadoDJ): DeclaracionJurada {
  const now = new Date();
  return {
    id,
    docenteId,
    facultadId,
    estado,
    docenteVinculacionActiva: true,
    tipo: 'ANUAL',
    periodoAcademico: '2026-1',
    camposFormulario: {},
    createdAt: now,
    updatedAt: now,
  };
}

describe('DeclaracionJuradaService.estadisticas', () => {
  const notificaciones: INotificacionPublisher = { publicarDjStateChanged: async () => undefined };
  let service: DeclaracionJuradaService;

  beforeEach(() => {
    // 2 facultades y 3 docentes: d1 y d2 en A, d3 en B.
    const repo = new InMemoryDeclaracionJuradaRepository([
      dj('1', 'd1', FAC_A, EstadoDJ.BORRADOR),
      dj('2', 'd1', FAC_A, EstadoDJ.APROBADA),
      dj('3', 'd2', FAC_A, EstadoDJ.APROBADA),
      dj('4', 'd3', FAC_B, EstadoDJ.EN_REVISION_DPA),
      dj('5', 'd3', FAC_B, EstadoDJ.RECHAZADA),
    ]);
    service = new DeclaracionJuradaService(repo, notificaciones);
  });

  it('FR2.1/FR2.2: incluye los 6 estados (0 por defecto) y total correcto', async () => {
    const r = await service.estadisticas({ userId: 'dpa', rol: Rol.TECNICO_DPA });

    expect(Object.keys(r.porEstado).sort()).toEqual(Object.values(EstadoDJ).sort());
    expect(r.porEstado[EstadoDJ.EN_REVISION_FACULTAD]).toBe(0);
    expect(r.porEstado[EstadoDJ.DEVUELTA]).toBe(0);
    expect(r.porEstado[EstadoDJ.APROBADA]).toBe(2);
    expect(r.total).toBe(5);
  });

  it('FR3.1: DOCENTE solo cuenta sus propias DJ', async () => {
    const r = await service.estadisticas({ userId: 'd1', rol: Rol.DOCENTE, facultadId: FAC_A });

    expect(r.total).toBe(2);
    expect(r.porEstado[EstadoDJ.BORRADOR]).toBe(1);
    expect(r.porEstado[EstadoDJ.APROBADA]).toBe(1);
  });

  it('FR4.3: DOCENTE ignora el parámetro facultadId', async () => {
    const r = await service.estadisticas({ userId: 'd1', rol: Rol.DOCENTE, facultadId: FAC_A }, FAC_B);

    expect(r.total).toBe(2);
  });

  it('FR3.2: ADMIN_FACULTAD solo cuenta su facultad', async () => {
    const r = await service.estadisticas({ userId: 'af', rol: Rol.ADMIN_FACULTAD, facultadId: FAC_B });

    expect(r.total).toBe(2);
    expect(r.porEstado[EstadoDJ.EN_REVISION_DPA]).toBe(1);
    expect(r.porEstado[EstadoDJ.RECHAZADA]).toBe(1);
  });

  it('FR4.1: ADMIN_FACULTAD que pide su propia facultad obtiene su conteo', async () => {
    const r = await service.estadisticas({ userId: 'af', rol: Rol.ADMIN_FACULTAD, facultadId: FAC_A }, FAC_A);

    expect(r.total).toBe(3);
  });

  it('FR3.3/FR4.1: TECNICO_DPA cuenta todo y filtra por facultadId', async () => {
    const todo = await service.estadisticas({ userId: 'dpa', rol: Rol.TECNICO_DPA });
    const soloB = await service.estadisticas({ userId: 'dpa', rol: Rol.TECNICO_DPA }, FAC_B);

    expect(todo.total).toBe(5);
    expect(soloB.total).toBe(2);
  });

  it('FR3.3: ADMIN_SISTEMA cuenta todo y filtra por facultadId', async () => {
    const todo = await service.estadisticas({ userId: 'sys', rol: Rol.ADMIN_SISTEMA });
    const soloA = await service.estadisticas({ userId: 'sys', rol: Rol.ADMIN_SISTEMA }, FAC_A);

    expect(todo.total).toBe(5);
    expect(soloA.total).toBe(3);
  });

  it('FR4.2: ADMIN_FACULTAD con facultad ajena recibe INSUFFICIENT_ROLE', async () => {
    const llamada = service.estadisticas({ userId: 'af', rol: Rol.ADMIN_FACULTAD, facultadId: FAC_A }, FAC_B);

    await expect(llamada).rejects.toBeInstanceOf(ForbiddenError);
    await expect(llamada).rejects.toMatchObject({ code: 'INSUFFICIENT_ROLE' });
  });

  it('FR5: ADMIN_FACULTAD sin facultad en sesión recibe INSUFFICIENT_ROLE (no se amplía el alcance)', async () => {
    const llamada = service.estadisticas({ userId: 'af', rol: Rol.ADMIN_FACULTAD });

    await expect(llamada).rejects.toBeInstanceOf(ForbiddenError);
    await expect(llamada).rejects.toMatchObject({ code: 'INSUFFICIENT_ROLE' });
  });
});
