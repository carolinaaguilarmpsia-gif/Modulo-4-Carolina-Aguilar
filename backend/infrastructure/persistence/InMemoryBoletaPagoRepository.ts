import type { IBoletaPagoRepository } from '../../domain/boletas-pago/ports/out/IBoletaPagoRepository.js';
import type { BoletaPago } from '../../domain/boletas-pago/types/BoletaPago.js';

/** Desarrollo y pruebas sin base de datos. */
export class InMemoryBoletaPagoRepository implements IBoletaPagoRepository {
  constructor(private readonly boletas: BoletaPago[] = []) {}

  async listarPorDocente(docenteId: string): Promise<BoletaPago[]> {
    return this.boletas.filter((b) => b.docenteId === docenteId).sort((a, b) => b.periodo.localeCompare(a.periodo));
  }

  async obtenerPorId(id: string): Promise<BoletaPago | null> {
    return this.boletas.find((b) => b.id === id) ?? null;
  }
}
