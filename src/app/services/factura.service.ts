import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Cobro {
  id: number;
  idClub: number;
  nombreClub: string;
  monto: number;
  fecha: string;
  concepto: string;
  estado: string;
  fechaVencimiento: string;
  tipoComprobante: string;
}

export interface Factura {
  id: number;
  numeroFactura: string;
  cobro: Cobro;
  fechaEmision: string;
  total: number;
  itemsFactura: ItemFactura[];
}

export interface ItemFactura {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  // Datos de ejemplo
  private cobros: Cobro[] = [
    {
      id: 1,
      idClub: 1,
      nombreClub: 'Club Atlético',
      monto: 15000,
      fecha: '2023-06-15',
      concepto: 'Cuota mensual de afiliación',
      estado: 'Pendiente',
      fechaVencimiento: '2023-07-15',
      tipoComprobante: 'Factura B'
    },
    {
      id: 2,
      idClub: 2,
      nombreClub: 'Deportivo Jujuy',
      monto: 22000,
      fecha: '2023-06-14',
      concepto: 'Inscripción torneo provincial',
      estado: 'Pagado',
      fechaVencimiento: '2023-07-14',
      tipoComprobante: 'Factura A'
    }
  ];

  private facturas: Factura[] = [];

  constructor() { }

  getCobros(): Observable<Cobro[]> {
    return of(this.cobros).pipe(delay(500));
  }

  getCobroById(id: number): Observable<Cobro | undefined> {
    const cobro = this.cobros.find(c => c.id === id);
    return of(cobro).pipe(delay(300));
  }

  generarFactura(cobroId: number): Observable<Factura> {
    const cobro = this.cobros.find(c => c.id === cobroId);
    if (!cobro) {
      throw new Error('Cobro no encontrado');
    }

    const nuevaFactura: Factura = {
      id: this.facturas.length + 1,
      numeroFactura: `F${cobro.tipoComprobante.includes('A') ? 'A' : 'B'}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(6, '0')}`,
      cobro: { ...cobro },
      fechaEmision: new Date().toISOString().split('T')[0],
      total: cobro.monto,
      itemsFactura: [
        {
          descripcion: cobro.concepto,
          cantidad: 1,
          precioUnitario: cobro.monto,
          subtotal: cobro.monto
        }
      ]
    };

    this.facturas.push(nuevaFactura);
    return of(nuevaFactura).pipe(delay(1000));
  }

  getFacturas(): Observable<Factura[]> {
    return of(this.facturas).pipe(delay(500));
  }

  getFacturaById(id: number): Observable<Factura | undefined> {
    const factura = this.facturas.find(f => f.id === id);
    return of(factura).pipe(delay(300));
  }
}
