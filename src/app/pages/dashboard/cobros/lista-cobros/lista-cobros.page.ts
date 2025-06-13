import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService, Cobro } from '../../../../services/factura.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-cobros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-cobros.page.html',
  styleUrls: ['./lista-cobros.page.css']
})
export class ListaCobrosPage implements OnInit {
  cobros: Cobro[] = [];
  isLoading = true;
  errorMessage = '';

  badgeClasses: {[key: string]: string} = {
    'Pendiente': 'bg-warning',
    'Pagado': 'bg-success',
    'Vencido': 'bg-danger',
    'Anulado': 'bg-secondary'
  };

  constructor(private facturaService: FacturaService) {}

  ngOnInit(): void {
    this.cargarCobros();
  }

  cargarCobros(): void {
    this.isLoading = true;
    this.facturaService.getCobros().subscribe({
      next: (cobros) => {
        this.isLoading = false;
        this.cobros = cobros;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar los cobros: ' + error.message;
      }
    });
  }
}
