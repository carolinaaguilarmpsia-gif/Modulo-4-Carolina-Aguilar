import { describe, expect, it } from '@jest/globals';
import { Rol } from '../../administracion/types/Rol.js';
import type { ActorContext } from '../../shared/types/ActorContext.js';
import type { ICalendarioRepository } from '../ports/out/ICalendarioRepository.js';
import type { CalendarioAcademico, EventoCalendario } from '../types/Calendario.js';
import { GestionarCalendarioService } from './GestionarCalendarioService.js';

class FakeCalendarios implements ICalendarioRepository {
  private readonly store = new Map<string, CalendarioAcademico>();
  async obtener(periodo: string, facultadId: string | null): Promise<CalendarioAcademico | null> {
    return this.store.get(`${periodo}|${facultadId}`) ?? null;
  }
  async guardar(c: CalendarioAcademico): Promise<void> {
    this.store.set(`${c.periodo}|${c.facultadId}`, c);
  }
}

const ahora = new Date('2026-10-25T12:00:00Z');
const adminF1: ActorContext = { userId: 'a1', rol: Rol.ADMIN_FACULTAD, facultadId: 'F1' };
const adminSistema: ActorContext = { userId: 'sys', rol: Rol.ADMIN_SISTEMA, facultadId: 'F1' };
const docenteF1: ActorContext = { userId: 'd1', rol: Rol.DOCENTE, facultadId: 'F1' };
const docenteF2: ActorContext = { userId: 'd2', rol: Rol.DOCENTE, facultadId: 'F2' };

const examenes: EventoCalendario = { tipo: 'EXAMENES', nombre: 'Primer parcial', fechaInicio: '2026-04-20', fechaFin: '2026-04-24' };
const inicio: EventoCalendario = { tipo: 'INICIO_SEMESTRE', nombre: 'Inicio de clases', fechaInicio: '2026-03-02', fechaFin: '2026-03-02' };

function armar() {
  return new GestionarCalendarioService(new FakeCalendarios(), () => ahora);
}

describe('GestionarCalendarioService (FSD-UC-008)', () => {
  it('un Admin. Facultad publica el calendario de su facultad y los docentes lo ven ordenado por fecha de inicio', async () => {
    const service = armar();

    await service.publicar({ periodo: '2026-I', eventos: [examenes, inicio] }, adminF1);
    const eventos = await service.consultar('2026-I', docenteF1);

    expect(eventos.map((e) => e.nombre)).toEqual(['Inicio de clases', 'Primer parcial']);
    expect(eventos.every((e) => e.ambito === 'FACULTAD')).toBe(true);
  });

  it('RB-05: publicar en otra facultad lanza CROSS_FACULTY_FORBIDDEN', async () => {
    const service = armar();

    await expect(
      service.publicar({ periodo: '2026-I', facultadId: 'F2', eventos: [examenes] }, adminF1)
    ).rejects.toMatchObject({ code: 'CROSS_FACULTY_FORBIDDEN', httpStatus: 403 });
  });

  it('fechas incoherentes lanzan INVALID_DATE_RANGE (422)', async () => {
    const service = armar();
    const invalido: EventoCalendario = { ...examenes, fechaInicio: '2026-04-24', fechaFin: '2026-04-20' };

    await expect(service.publicar({ periodo: '2026-I', eventos: [invalido] }, adminF1)).rejects.toMatchObject({
      code: 'INVALID_DATE_RANGE',
      httpStatus: 422,
    });
  });

  it('los docentes ven su facultad fusionada con el calendario institucional, marcando el ámbito', async () => {
    const service = armar();
    await service.publicar({ periodo: '2026-I', eventos: [examenes] }, adminF1);
    await service.publicar({ periodo: '2026-I', eventos: [inicio] }, adminSistema);

    const eventos = await service.consultar('2026-I', docenteF1);

    expect(eventos).toEqual([
      { ...inicio, ambito: 'INSTITUCIONAL' },
      { ...examenes, ambito: 'FACULTAD' },
    ]);
  });

  it('un docente de otra facultad no ve los eventos de la facultad ajena, solo los institucionales', async () => {
    const service = armar();
    await service.publicar({ periodo: '2026-I', eventos: [examenes] }, adminF1);
    await service.publicar({ periodo: '2026-I', eventos: [inicio] }, adminSistema);

    const eventos = await service.consultar('2026-I', docenteF2);

    expect(eventos.map((e) => e.nombre)).toEqual(['Inicio de clases']);
  });

  it('publicar de nuevo reemplaza el calendario (UPSERT), no lo duplica', async () => {
    const service = armar();
    await service.publicar({ periodo: '2026-I', eventos: [examenes, inicio] }, adminF1);
    await service.publicar({ periodo: '2026-I', eventos: [inicio] }, adminF1);

    expect(await service.consultar('2026-I', docenteF1)).toHaveLength(1);
  });

  it('un DOCENTE no puede publicar', async () => {
    const service = armar();

    await expect(service.publicar({ periodo: '2026-I', eventos: [examenes] }, docenteF1)).rejects.toMatchObject({
      code: 'INSUFFICIENT_ROLE',
      httpStatus: 403,
    });
  });
});
