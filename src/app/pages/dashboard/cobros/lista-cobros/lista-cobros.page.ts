import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FacturaService, Cobro } from '../../../../services/factura.service';

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
    'Pendiente': 'bg-warning text-dark',
    'Pagado': 'bg-success',
    'Vencido': 'bg-danger',
    'Anulado': 'bg-secondary'
  };

  constructor(private facturaService: FacturaService) { }

  ngOnInit(): void {
    this.cargarCobros();
  }

  cargarCobros(): void {
    this.isLoading = true;
    this.facturaService.getCobros().subscribe({
      next: (cobros) => {
        this.cobros = cobros;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los cobros: ' + error.message;
        this.isLoading = false;
      }
    });
  }
}
