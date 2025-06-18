import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buscador-afiliados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscador-afiliado.component.html',
  styleUrls: ['./buscador-afiliado.component.css'],
})
export class BuscadorAfiliadosComponent {
  dni: string = ''; // Cambiado a string para búsqueda parcial
  nombreApellido: string = '';

  @Output() buscarAfiliado = new EventEmitter<{ dni?: string; nombreApellido?: string }>();
  @Output() limpiarFiltro = new EventEmitter<void>();

  onBuscar() {
    const dniFilter = this.dni && this.dni.trim() !== '' ? this.dni.trim() : undefined;
    const nombreApellidoFilter = this.nombreApellido && this.nombreApellido.trim().length > 0 ? this.nombreApellido.trim() : undefined;
    
    this.buscarAfiliado.emit({
      dni: dniFilter,
      nombreApellido: nombreApellidoFilter,
    });
  }

  onLimpiar() {
    this.dni = '';
    this.nombreApellido = '';
    this.limpiarFiltro.emit();
    this.buscarAfiliado.emit({});
  }
}