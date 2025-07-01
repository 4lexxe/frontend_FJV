import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CobroService, Cobro } from '../../../../services/cobro.service';

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

  volver(): void {
    if (this.cobro?.idClub) {
      this.router.navigate(['/dashboard/clubes/detalle', this.cobro.idClub]);
    } else {
      this.router.navigate(['/dashboard/cobros']);
    }
  }
}
