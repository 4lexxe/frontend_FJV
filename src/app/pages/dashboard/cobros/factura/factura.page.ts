import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FacturaService, Factura } from '../../../../services/factura.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-factura-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './factura.page.html',
  styleUrls: ['./factura.page.css']
})
export class FacturaPage implements OnInit {
  factura: Factura | null = null;
  isLoading = true;
  errorMessage = '';

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
        return this.facturaService.getFacturaById(id);
      })
    ).subscribe({
      next: (factura) => {
        this.isLoading = false;
        if (!factura) {
          this.errorMessage = 'No se encontró la factura solicitada';
          return;
        }
        this.factura = factura;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar la factura: ' + error.message;
      }
    });
  }

  imprimirFactura(): void {
    window.print();
  }

  descargarFactura(): void {
    // En una implementación real, aquí se generaría un PDF
    alert('Implementación pendiente: Descargar factura como PDF');
  }

  volver(): void {
    this.router.navigate(['/dashboard/cobros/detalle', this.factura?.cobro.id || '']);
  }
}
