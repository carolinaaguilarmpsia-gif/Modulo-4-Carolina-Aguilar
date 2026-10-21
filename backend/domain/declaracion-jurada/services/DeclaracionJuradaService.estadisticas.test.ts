import { Rol } from '../../administracion/types/Rol.js';
import { InMemoryDeclaracionJuradaRepository } from '../../../infrastructure/persistence/InMemoryDeclaracionJuradaRepository.js';
import type { DeclaracionJurada } from '../entities/DeclaracionJurada.js';
import type { INotificacionPublisher } from '../ports/out/INotificacionPublisher.js';
import type { ActorContext } from '../types/CrearDJ.js';
import { EstadoDJ } from '../types/EstadoDJ.js';
import { DeclaracionJuradaService } from './DeclaracionJuradaService.js';

const notificador: INotificacionPublisher = { publicarDjStateChanged: async () => undefined };

function dj(id: string, docenteId: string, facultadId: string, estado: EstadoDJ): DeclaracionJurada {
  const ahora = new Date();
  return {
    id,
    docenteId,
    facultadId,
    estado,
    docenteVinculacionActiva: true,
    tipo: 'LABORAL',
    periodoAcademico: '2026-I',
    camposFormulario: {},
    createdAt: ahora,
    updatedAt: ahora,
  };
}

const SEMILLA = [
  dj('1', 'doc-1', 'fac-1', EstadoDJ.BORRADOR),
  dj('2', 'doc-1', 'fac-1', EstadoDJ.BORRADOR),
  dj('3', 'doc-2', 'fac-1', EstadoDJ.APROBADA),
  dj('4', 'doc-3', 'fac-2', EstadoDJ.EN_REVISION_DPA),
];

const crearService = () => new DeclaracionJuradaService(new InMemoryDeclaracionJuradaRepository(SEMILLA), notificador);

/** @see FSD-UC-002 · RB-05 */
describe('DeclaracionJuradaService.estadisticas', () => {
  it('devuelve los 6 estados del enum con 0 donde no hay DJ', async () => {
    const actor: ActorContext = { userId: 'tec-1', rol: Rol.TECNICO_DPA };
    const r = await crearService().estadisticas(actor);

    expect(Object.keys(r.porEstado).sort()).toEqual(Object.values(EstadoDJ).sort());
    expect(r.porEstado[EstadoDJ.BORRADOR]).toBe(2);
    expect(r.porEstado[EstadoDJ.DEVUELTA]).toBe(0);
    expect(r.total).toBe(4);
  });

  it('un DOCENTE solo cuenta sus propias DJ', async () => {
    const r = await crearService().estadisticas({ userId: 'doc-1', rol: Rol.DOCENTE, facultadId: 'fac-1' });
    expect(r.total).toBe(2);
    expect(r.porEstado[EstadoDJ.APROBADA]).toBe(0);
  });

  it('un ADMIN_FACULTAD solo cuenta su facultad (RB-05)', async () => {
    const r = await crearService().estadisticas({ userId: 'adm-1', rol: Rol.ADMIN_FACULTAD, facultadId: 'fac-1' });
    expect(r.total).toBe(3);
    expect(r.porEstado[EstadoDJ.EN_REVISION_DPA]).toBe(0);
  });

  it('un ADMIN_FACULTAD que pide una facultad ajena recibe ForbiddenError', async () => {
    await expect(
      crearService().estadisticas({ userId: 'adm-1', rol: Rol.ADMIN_FACULTAD, facultadId: 'fac-1' }, 'fac-2')
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_ROLE', httpStatus: 403 });
  });

  it('TECNICO_DPA puede filtrar por facultadId', async () => {
    const r = await crearService().estadisticas({ userId: 'tec-1', rol: Rol.TECNICO_DPA }, 'fac-2');
    expect(r.total).toBe(1);
    expect(r.porEstado[EstadoDJ.EN_REVISION_DPA]).toBe(1);
  });
});
