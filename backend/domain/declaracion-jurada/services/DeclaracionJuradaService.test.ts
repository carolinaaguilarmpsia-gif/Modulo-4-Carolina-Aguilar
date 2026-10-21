import { randomUUID } from 'node:crypto';
import { Rol } from '../../administracion/types/Rol.js';
import { ForbiddenError, NotFoundError } from '../../shared/errors/DomainError.js';
import type { DeclaracionJurada } from '../entities/DeclaracionJurada.js';
import type { HistorialDJRecord, IDeclaracionJuradaRepository, ListarDJResult } from '../ports/out/IDeclaracionJuradaRepository.js';
import type { INotificacionPublisher } from '../ports/out/INotificacionPublisher.js';
import type { ActorContext } from '../types/CrearDJ.js';
import { ComandoDJ } from '../types/ComandoDJ.js';
import { EstadoDJ } from '../types/EstadoDJ.js';
import { DeclaracionJuradaService } from './DeclaracionJuradaService.js';

/** Doble en la frontera de "disco" — mismo patrón que el resto del repo (in-memory, sin fs real). */
class FakeDJRepository implements IDeclaracionJuradaRepository {
  private readonly store = new Map<string, DeclaracionJurada>();
  public transicionesGuardadas: { djId: string; estadoNuevo: EstadoDJ }[] = [];

  sembrar(dj: DeclaracionJurada): void {
    this.store.set(dj.id, dj);
  }

  async create(dj: DeclaracionJurada): Promise<DeclaracionJurada> {
    this.store.set(dj.id, dj);
    return dj;
  }
  async findById(djId: string): Promise<DeclaracionJurada | null> {
    return this.store.get(djId) ?? null;
  }
  async list(): Promise<ListarDJResult> {
    const items = [...this.store.values()];
    return { items, total: items.length };
  }
  async updateCampos(djId: string, camposFormulario: Record<string, unknown>): Promise<DeclaracionJurada> {
    const dj = this.store.get(djId)!;
    dj.camposFormulario = camposFormulario;
    return dj;
  }
  async transicionarAtomica(params: {
    djId: string;
    estadoNuevo: EstadoDJ;
    actorId: string;
    estadoAnterior: EstadoDJ;
    observaciones?: string;
  }): Promise<HistorialDJRecord> {
    const dj = this.store.get(params.djId)!;
    dj.estado = params.estadoNuevo;
    this.transicionesGuardadas.push({ djId: params.djId, estadoNuevo: params.estadoNuevo });
    return {
      id: randomUUID(),
      djId: params.djId,
      actorId: params.actorId,
      estadoAnterior: params.estadoAnterior,
      estadoNuevo: params.estadoNuevo,
      observaciones: params.observaciones,
      timestamp: new Date(),
    };
  }
  async getHistorial(djId: string): Promise<HistorialDJRecord[]> {
    return [
      {
        id: 'hist-1',
        djId,
        actorId: 'actor-1',
        estadoAnterior: EstadoDJ.BORRADOR,
        estadoNuevo: EstadoDJ.EN_REVISION_FACULTAD,
        timestamp: new Date(),
      },
    ];
  }
}

/** Doble en la frontera de "red" — simula la cola de notificaciones (Bull en producción). */
class FakeNotificacionPublisher implements INotificacionPublisher {
  public eventos: { djId: string; estadoNuevo: EstadoDJ; destinatarioRol: string }[] = [];
  constructor(private readonly falla = false) {}
  async publicarDjStateChanged(event: { djId: string; estadoNuevo: EstadoDJ; destinatarioRol: string }): Promise<void> {
    if (this.falla) throw new Error('cola de notificaciones caída');
    this.eventos.push(event);
  }
}

function djDePrueba(overrides: Partial<DeclaracionJurada> = {}): DeclaracionJurada {
  const ahora = new Date();
  return {
    id: 'dj-1',
    docenteId: 'docente-1',
    facultadId: 'facultad-1',
    estado: EstadoDJ.BORRADOR,
    docenteVinculacionActiva: true,
    tipo: 'LABORAL',
    periodoAcademico: '2026-I',
    camposFormulario: {},
    createdAt: ahora,
    updatedAt: ahora,
    ...overrides,
  };
}

const DOCENTE_DUENIO: ActorContext = { userId: 'docente-1', rol: Rol.DOCENTE, facultadId: 'facultad-1' };
const DOCENTE_AJENO: ActorContext = { userId: 'docente-2', rol: Rol.DOCENTE, facultadId: 'facultad-1' };
const ADMIN_MISMA_FACULTAD: ActorContext = { userId: 'admin-1', rol: Rol.ADMIN_FACULTAD, facultadId: 'facultad-1' };
const ADMIN_OTRA_FACULTAD: ActorContext = { userId: 'admin-2', rol: Rol.ADMIN_FACULTAD, facultadId: 'facultad-2' };

describe('DeclaracionJuradaService', () => {
  describe('crear', () => {
    it('MUST rechazar sin vinculación activa antes de tocar el repositorio (RB-01)', async () => {
      const repo = new FakeDJRepository();
      const service = new DeclaracionJuradaService(repo, new FakeNotificacionPublisher());

      await expect(
        service.crear({
          docenteId: 'docente-1',
          facultadId: 'facultad-1',
          docenteVinculacionActiva: false,
          tipo: 'LABORAL',
          periodoAcademico: '2026-I',
          camposFormulario: {},
        })
      ).rejects.toMatchObject({ code: 'INACTIVE_BINDING' });
    });
  });

  describe('obtenerDetalle', () => {
    it('MUST tirar NotFoundError si la DJ no existe', async () => {
      const service = new DeclaracionJuradaService(new FakeDJRepository(), new FakeNotificacionPublisher());
      await expect(service.obtenerDetalle('no-existe', DOCENTE_DUENIO)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('un docente dueño ve su propia DJ junto con el historial real del repositorio', async () => {
      const repo = new FakeDJRepository();
      repo.sembrar(djDePrueba());
      const service = new DeclaracionJuradaService(repo, new FakeNotificacionPublisher());

      const { dj, historial } = await service.obtenerDetalle('dj-1', DOCENTE_DUENIO);

      expect(dj.id).toBe('dj-1');
      expect(historial).toHaveLength(1);
      expect(historial[0].estadoNuevo).toBe(EstadoDJ.EN_REVISION_FACULTAD);
    });

    it('un docente que NO es dueño de la DJ recibe ForbiddenError, nunca ve datos ajenos', async () => {
      const repo = new FakeDJRepository();
      repo.sembrar(djDePrueba());
      const service = new DeclaracionJuradaService(repo, new FakeNotificacionPublisher());

      await expect(service.obtenerDetalle('dj-1', DOCENTE_AJENO)).rejects.toMatchObject({ code: 'FORBIDDEN_TRANSITION' });
    });

    it('un admin de OTRA facultad recibe ForbiddenError — RBAC por facultad, no solo por rol', async () => {
      const repo = new FakeDJRepository();
      repo.sembrar(djDePrueba());
      const service = new DeclaracionJuradaService(repo, new FakeNotificacionPublisher());

      await expect(service.obtenerDetalle('dj-1', ADMIN_OTRA_FACULTAD)).rejects.toBeInstanceOf(ForbiddenError);
    });
  });

  describe('actualizarCampos', () => {
    it('un docente dueño puede editar campos mientras la DJ está en BORRADOR', async () => {
      const repo = new FakeDJRepository();
      repo.sembrar(djDePrueba({ estado: EstadoDJ.BORRADOR }));
      const service = new DeclaracionJuradaService(repo, new FakeNotificacionPublisher());

      const actualizada = await service.actualizarCampos('dj-1', { cargoInstitucional: 'Docente Titular' }, DOCENTE_DUENIO);

      expect(actualizada.camposFormulario).toEqual({ cargoInstitucional: 'Docente Titular' });
    });

    it('un docente que no es dueño no puede editar — se rechaza ANTES de consultar la máquina de estados', async () => {
      const repo = new FakeDJRepository();
      repo.sembrar(djDePrueba({ estado: EstadoDJ.BORRADOR }));
      const service = new DeclaracionJuradaService(repo, new FakeNotificacionPublisher());

      await expect(service.actualizarCampos('dj-1', { x: 1 }, DOCENTE_AJENO)).rejects.toMatchObject({
        code: 'FORBIDDEN_TRANSITION',
      });
    });

    it('reenvía a DJStateMachine y rechaza editar campos en EN_REVISION_FACULTAD (RB-03)', async () => {
      const repo = new FakeDJRepository();
      repo.sembrar(djDePrueba({ estado: EstadoDJ.EN_REVISION_FACULTAD }));
      const service = new DeclaracionJuradaService(repo, new FakeNotificacionPublisher());

      await expect(service.actualizarCampos('dj-1', { x: 1 }, DOCENTE_DUENIO)).rejects.toMatchObject({
        code: 'FORBIDDEN_TRANSITION',
      });
    });
  });

  describe('transicionarEstado', () => {
    it('camino feliz: persiste la transición (disco) y encola la notificación (red)', async () => {
      const repo = new FakeDJRepository();
      repo.sembrar(djDePrueba({ estado: EstadoDJ.BORRADOR }));
      const notificador = new FakeNotificacionPublisher();
      const service = new DeclaracionJuradaService(repo, notificador);

      const resultado = await service.transicionarEstado({
        djId: 'dj-1',
        comando: ComandoDJ.ENVIAR,
        actorId: 'docente-1',
        actorRol: Rol.DOCENTE,
      });

      expect(resultado.estadoNuevo).toBe(EstadoDJ.EN_REVISION_FACULTAD);
      expect(resultado.notificacionEncolada).toBe(true);
      expect(repo.transicionesGuardadas).toEqual([{ djId: 'dj-1', estadoNuevo: EstadoDJ.EN_REVISION_FACULTAD }]);
      expect(notificador.eventos).toEqual([
        { djId: 'dj-1', estadoNuevo: EstadoDJ.EN_REVISION_FACULTAD, destinatarioRol: 'ADMIN_FACULTAD' },
      ]);
    });

    it('si la cola de notificaciones falla, la transición YA se persistió — no se pierde ni revienta el flujo', async () => {
      const repo = new FakeDJRepository();
      repo.sembrar(djDePrueba({ estado: EstadoDJ.BORRADOR }));
      const service = new DeclaracionJuradaService(repo, new FakeNotificacionPublisher(true));

      const resultado = await service.transicionarEstado({
        djId: 'dj-1',
        comando: ComandoDJ.ENVIAR,
        actorId: 'docente-1',
        actorRol: Rol.DOCENTE,
      });

      expect(resultado.notificacionEncolada).toBe(false);
      // La transición ya quedó guardada en el repo pese a que la notificación falló.
      expect(repo.transicionesGuardadas).toHaveLength(1);
    });

    it.each([
      [EstadoDJ.EN_REVISION_FACULTAD, 'ADMIN_FACULTAD'],
      [EstadoDJ.EN_REVISION_DPA, 'TECNICO_DPA'],
      [EstadoDJ.DEVUELTA, 'DOCENTE'],
    ])('inferirDestinatario: %s notifica a %s', async (estadoInicial, destinatarioEsperado) => {
      const repo = new FakeDJRepository();
      // Sembramos la DJ ya en un estado desde el que exista una transición válida hacia el estado
      // bajo prueba, y disparamos el comando correspondiente — probamos el destinatario a través
      // del comportamiento público, no llamando al método privado directamente.
      const comandoPorEstado: Record<string, { desde: EstadoDJ; comando: ComandoDJ; actor: ActorContext }> = {
        [EstadoDJ.EN_REVISION_FACULTAD]: { desde: EstadoDJ.BORRADOR, comando: ComandoDJ.ENVIAR, actor: DOCENTE_DUENIO },
        [EstadoDJ.EN_REVISION_DPA]: {
          desde: EstadoDJ.EN_REVISION_FACULTAD,
          comando: ComandoDJ.ESCALAR_DPA,
          actor: ADMIN_MISMA_FACULTAD,
        },
        [EstadoDJ.DEVUELTA]: { desde: EstadoDJ.EN_REVISION_FACULTAD, comando: ComandoDJ.DEVOLVER, actor: ADMIN_MISMA_FACULTAD },
      };
      const { desde, comando, actor } = comandoPorEstado[estadoInicial];
      repo.sembrar(djDePrueba({ estado: desde, facultadId: actor.facultadId ?? 'facultad-1' }));
      const notificador = new FakeNotificacionPublisher();
      const service = new DeclaracionJuradaService(repo, notificador);

      await service.transicionarEstado({
        djId: 'dj-1',
        comando,
        actorId: actor.userId,
        actorRol: actor.rol,
        actorFacultadId: actor.facultadId,
        observaciones: comando === ComandoDJ.DEVOLVER ? 'Faltan datos por completar en el formulario' : undefined,
      });

      expect(notificador.eventos[0]?.destinatarioRol).toBe(destinatarioEsperado);
    });
  });
});
