import type { BoletaPago } from '../../domain/boletas-pago/types/BoletaPago.js';
import {
  DOCENTE_ANDREA_QUISPE_ID,
  DOCENTE_CARLOS_PAZ_ID,
  DOCENTE_DEMO_ID,
  DOCENTE_JUAN_JALDIN_ID,
} from './seedIds.js';

/**
 * Boletas de ejemplo. Representan lo que nómina enviaría; no hay adaptador real de nómina todavía
 * (FSD §M-INTEGR), por eso la fecha de sincronización es fija.
 */
export function boletasPagoSemilla(): BoletaPago[] {
  const sincronizadaEn = new Date('2026-11-01T06:00:00Z');
  const descuentos = (aporte: number, impuesto: number) => [
    { concepto: 'Aporte AFP', monto: aporte },
    { concepto: 'Impuesto RC-IVA', monto: impuesto },
  ];
  return [
    { id: 'boleta-jaldin-2026-09', docenteId: DOCENTE_JUAN_JALDIN_ID, periodo: '2026-09', haber: 6200, descuentos: descuentos(620, 310), sincronizadaEn },
    { id: 'boleta-jaldin-2026-10', docenteId: DOCENTE_JUAN_JALDIN_ID, periodo: '2026-10', haber: 6200, descuentos: descuentos(620, 310), sincronizadaEn },
    { id: 'boleta-quispe-2026-10', docenteId: DOCENTE_ANDREA_QUISPE_ID, periodo: '2026-10', haber: 5400.5, descuentos: descuentos(540.05, 210.25), sincronizadaEn },
    { id: 'boleta-paz-2026-10', docenteId: DOCENTE_CARLOS_PAZ_ID, periodo: '2026-10', haber: 7100, descuentos: descuentos(710, 405), sincronizadaEn },
    { id: 'boleta-demo-2026-10', docenteId: DOCENTE_DEMO_ID, periodo: '2026-10', haber: 5000, descuentos: descuentos(500, 150), sincronizadaEn },
  ];
}
