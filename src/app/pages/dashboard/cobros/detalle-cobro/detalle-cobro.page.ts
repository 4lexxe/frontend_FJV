import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CobroService, Cobro } from '../../../../services/cobro.service';
import { PagoCobroComponent } from '../../../../components/mercado-pago/pago-cobro/pago-cobro.component';

@Component({
  selector: 'app-detalle-cobro',
  standalone: true,
  imports: [CommonModule, RouterModule, PagoCobroComponent],
  templateUrl: './detalle-cobro.page.html',
  styleUrls: ['./detalle-cobro.page.css']
})
export class DetalleCobroPage implements OnInit {
  cobro: Cobro | null = null;
  isLoading = true;
  errorMessage = '';
  showPaymentModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cobroService: CobroService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.errorMessage = 'ID de cobro inválido';
      this.isLoading = false;
      return;
    }

    this.cobroService.getCobro(id).subscribe({
      next: (cobro) => {
        this.cobro = cobro;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = `Error al cargar el cobro: ${error.error?.error || error.message}`;
        this.isLoading = false;
      }
    });
  }

  marcarComoPagado(): void {
    if (!this.cobro || this.cobro.estado === 'Pagado') return;

    if (confirm('¿Está seguro que desea marcar este cobro como pagado?')) {
      this.cobroService.cambiarEstadoCobro(this.cobro.idCobro!, 'Pagado').subscribe({
        next: (response) => {
          if (response.status === "1") {
            alert(response.msg || 'Cobro marcado como pagado');
            // Recargar los datos del cobro
            this.ngOnInit();
          } else {
            alert(response.msg || 'No se pudo actualizar el cobro');
          }
        },
        error: (error) => {
          alert(`Error: ${error.error?.error || 'No se pudo actualizar el cobro'}`);
        }
      });
    }
  }

  openPaymentModal(): void {
    if (this.cobro && this.cobro.estado !== 'Pagado') {
      this.showPaymentModal = true;
    }
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  onPaymentInitiated(): void {
    // El pago se ha iniciado, podrías mostrar un mensaje o recargar datos
    alert('Se ha abierto la ventana de pago de Mercado Pago. Completa el pago y luego verifica el estado aquí.');
  }

  canPay(): boolean {
    return this.cobro?.estado === 'Pendiente' || this.cobro?.estado === 'Vencido';
  }

  getEstadoClass(): string {
    if (!this.cobro) return '';

    switch (this.cobro.estado) {
      case 'Pagado':
        return 'estado-pagado';
      case 'Pendiente':
        return 'estado-pendiente';
      case 'Vencido':
        return 'estado-vencido';
      case 'Anulado':
        return 'estado-anulado';
      default:
        return '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  volver(): void {
    if (this.cobro?.idClub) {
      this.router.navigate(['/dashboard/clubes/detalle', this.cobro.idClub]);
    } else {
      this.router.navigate(['/dashboard/cobros']);
    }
  }
}
