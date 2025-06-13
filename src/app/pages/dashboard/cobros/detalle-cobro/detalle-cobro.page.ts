import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FacturaService, Cobro } from '../../../../services/factura.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-detalle-cobro',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-cobro.page.html',
  styleUrls: ['./detalle-cobro.page.css']
})
export class DetalleCobroPage implements OnInit {
  cobro: Cobro | null = null;
  isLoading = true;
  errorMessage = '';
  generandoFactura = false;
  facturaGenerada = false;
  facturaId: number | null = null;

  badgeClasses: {[key: string]: string} = {
    'Pendiente': 'bg-warning',
    'Pagado': 'bg-success',
    'Vencido': 'bg-danger',
    'Anulado': 'bg-secondary'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facturaService: FacturaService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (isNaN(id)) {
          return of(undefined);
        }
        return this.facturaService.getCobroById(id);
      })
    ).subscribe({
      next: (cobro) => {
        this.isLoading = false;
        if (!cobro) {
          this.errorMessage = 'No se encontró el cobro solicitado';
          return;
        }
        this.cobro = cobro;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar el cobro: ' + error.message;
      }
    });
  }

  generarFactura(): void {
    if (!this.cobro) return;

    this.generandoFactura = true;
    this.facturaService.generarFactura(this.cobro.id).subscribe({
      next: (factura) => {
        this.generandoFactura = false;
        this.facturaGenerada = true;
        this.facturaId = factura.id;
      },
      error: (error) => {
        this.generandoFactura = false;
        this.errorMessage = 'Error al generar la factura: ' + error.message;
      }
    });
  }

  verFactura(): void {
    if (this.facturaId) {
      this.router.navigate(['/dashboard/cobros/factura', this.facturaId]);
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/cobros']);
  }
}
