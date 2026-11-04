import { Rol } from '../../administracion/types/Rol.js';
import { ForbiddenError, NotFoundError } from '../../shared/errors/DomainError.js';
import type { ActorContext } from '../../shared/types/ActorContext.js';
import type { IBoletaPagoRepository } from '../ports/out/IBoletaPagoRepository.js';
import type { BoletaPago, BoletaPagoDetalle, BoletaPagoResumen } from '../types/BoletaPago.js';

const redondear = (n: number): number => Math.round(n * 100) / 100;

function aResumen(b: BoletaPago): BoletaPagoResumen {
  const totalDescuentos = redondear(b.descuentos.reduce((suma, d) => suma + d.monto, 0));
  return { id: b.id, periodo: b.periodo, haber: b.haber, totalDescuentos, neto: redondear(b.haber - totalDescuentos) };
}

/**
 * Consulta de boletas de pago por el docente titular.
 * @see FSD-UC-005 · RB-04 (el docente_id del JWT debe coincidir con el de la boleta)
 */
export class ConsultarBoletasService {
  constructor(private readonly boletas: IBoletaPagoRepository) {}

  /** Las boletas del propio docente, la más reciente primero. Con `periodo` (AAAA-MM) solo la de ese mes. */
  async listar(actor: ActorContext, periodo?: string): Promise<BoletaPagoResumen[]> {
    this.exigirDocente(actor);
    const propias = await this.boletas.listarPorDocente(actor.userId);
    return propias.filter((b) => !periodo || b.periodo === periodo).map(aResumen);
  }

  /** Detalle de una boleta: haber, descuentos y neto. Solo el docente titular puede verla. */
  async obtener(id: string, actor: ActorContext): Promise<BoletaPagoDetalle> {
    this.exigirDocente(actor);
    const boleta = await this.boletas.obtenerPorId(id);
    if (!boleta) throw new NotFoundError('BOLETA_NOT_FOUND', { id });
    if (boleta.docenteId !== actor.userId) {
      throw new ForbiddenError('UNAUTHORIZED_DATA_ACCESS', { recurso: 'boleta-pago' });
    }
    return { ...aResumen(boleta), descuentos: boleta.descuentos, sincronizadaEn: boleta.sincronizadaEn };
  }

  private exigirDocente(actor: ActorContext): void {
    if (actor.rol !== Rol.DOCENTE) throw new ForbiddenError('INSUFFICIENT_ROLE', { rol: actor.rol });
  }
}
