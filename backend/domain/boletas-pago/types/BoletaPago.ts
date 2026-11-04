/** @see FSD-UC-005 (UC-L-03 Consultar Boleta de Pago) */
export interface DescuentoBoleta {
  concepto: string;
  /** Monto en bolivianos, con dos decimales como máximo */
  monto: number;
}

export interface BoletaPago {
  id: string;
  docenteId: string;
  /** Mes de la boleta, `AAAA-MM` */
  periodo: string;
  haber: number;
  descuentos: DescuentoBoleta[];
  /** Cuándo se copió la boleta desde nómina */
  sincronizadaEn: Date;
}

/** Lo que ve el docente en el listado. */
export interface BoletaPagoResumen {
  id: string;
  periodo: string;
  haber: number;
  totalDescuentos: number;
  neto: number;
}

/** Lo que ve el docente al abrir una boleta. */
export interface BoletaPagoDetalle extends BoletaPagoResumen {
  descuentos: DescuentoBoleta[];
  sincronizadaEn: Date;
}
