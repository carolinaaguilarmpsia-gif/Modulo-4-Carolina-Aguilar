import { Rol } from '../../administracion/types/Rol.js';
import { InMemoryBoletaPagoRepository } from '../../../infrastructure/persistence/InMemoryBoletaPagoRepository.js';
import type { BoletaPago } from '../types/BoletaPago.js';
import { ConsultarBoletasService } from './ConsultarBoletasService.js';

const sincronizadaEn = new Date('2026-11-01T06:00:00Z');
const boleta = (id: string, docenteId: string, periodo: string, haber: number, descuentos: number[]): BoletaPago => ({
  id,
  docenteId,
  periodo,
  haber,
  descuentos: descuentos.map((monto, i) => ({ concepto: `Descuento ${i + 1}`, monto })),
  sincronizadaEn,
});

const ana = { userId: 'docente-ana', rol: Rol.DOCENTE, facultadId: 'f1' };
const beto = { userId: 'docente-beto', rol: Rol.DOCENTE, facultadId: 'f1' };

describe('ConsultarBoletasService (FSD-UC-005)', () => {
  const service = new ConsultarBoletasService(
    new InMemoryBoletaPagoRepository([
      boleta('b-ana-09', ana.userId, '2026-09', 5000, [500, 100]),
      boleta('b-ana-10', ana.userId, '2026-10', 5000.5, [500.05, 100.1]),
      boleta('b-beto-10', beto.userId, '2026-10', 7000, [700]),
    ])
  );

  describe('listar', () => {
    it('devuelve solo las boletas del docente, la más reciente primero', async () => {
      const lista = await service.listar(ana);
      expect(lista.map((b) => b.id)).toEqual(['b-ana-10', 'b-ana-09']);
    });

    it('calcula el total de descuentos y el neto sin errores de decimales', async () => {
      const [reciente] = await service.listar(ana);
      expect(reciente).toMatchObject({ haber: 5000.5, totalDescuentos: 600.15, neto: 4400.35 });
    });

    it('con periodo devuelve solo la boleta de ese mes', async () => {
      expect((await service.listar(ana, '2026-09')).map((b) => b.id)).toEqual(['b-ana-09']);
      expect(await service.listar(ana, '2020-01')).toEqual([]);
    });

    it('un docente sin boletas recibe una lista vacía', async () => {
      expect(await service.listar({ userId: 'docente-nuevo', rol: Rol.DOCENTE, facultadId: 'f1' })).toEqual([]);
    });

    it.each([Rol.ADMIN_FACULTAD, Rol.TECNICO_DPA, Rol.ADMIN_SISTEMA])('el rol %s no puede listar boletas (403)', async (rol) => {
      await expect(service.listar({ userId: 'x', rol, facultadId: 'f1' })).rejects.toMatchObject({ code: 'INSUFFICIENT_ROLE', httpStatus: 403 });
    });
  });

  describe('obtener', () => {
    it('devuelve el detalle con haber, descuentos y neto', async () => {
      const detalle = await service.obtener('b-ana-09', ana);
      expect(detalle).toMatchObject({ id: 'b-ana-09', periodo: '2026-09', haber: 5000, totalDescuentos: 600, neto: 4400 });
      expect(detalle.descuentos).toHaveLength(2);
      expect(detalle.sincronizadaEn).toEqual(sincronizadaEn);
    });

    it('RB-04: un docente no puede ver la boleta de otro (403 UNAUTHORIZED_DATA_ACCESS)', async () => {
      await expect(service.obtener('b-beto-10', ana)).rejects.toMatchObject({ code: 'UNAUTHORIZED_DATA_ACCESS', httpStatus: 403 });
    });

    it('una boleta que no existe responde 404 BOLETA_NOT_FOUND', async () => {
      await expect(service.obtener('no-existe', ana)).rejects.toMatchObject({ code: 'BOLETA_NOT_FOUND', httpStatus: 404 });
    });

    it('un rol que no es docente recibe 403 aunque la boleta exista', async () => {
      await expect(service.obtener('b-ana-09', { userId: 'admin', rol: Rol.ADMIN_SISTEMA, facultadId: 'f1' })).rejects.toMatchObject({
        code: 'INSUFFICIENT_ROLE',
      });
    });
  });
});
