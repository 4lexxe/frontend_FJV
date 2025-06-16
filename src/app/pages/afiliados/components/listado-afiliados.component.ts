import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Afiliado } from '../../../interfaces/afiliado.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listado-afiliados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-afiliados.component.html',
})
export class ListadoAfiliadosComponent {
  @Input() afiliados: Afiliado[] = [];
  @Output() eliminar = new EventEmitter<number>();
  @Output() editar = new EventEmitter<Afiliado>();

  afiliadoParaEditar: Afiliado | null = null;

  onEliminar(numeroAfiliacion: number) {
    if (confirm('¿Seguro querés eliminar este afiliado?')) {
      this.eliminar.emit(numeroAfiliacion);
    }
  }

  abrirModal(afiliado: Afiliado) {
    // Creamos una copia para editar sin afectar el original hasta guardar
    this.afiliadoParaEditar = { ...afiliado };
  }

  cerrarModal() {
    this.afiliadoParaEditar = null;
  }

  guardarEdicion() {
    if (this.afiliadoParaEditar) {
      this.editar.emit(this.afiliadoParaEditar); // se emite el afiliado actualizado al padre
      this.cerrarModal();
    }
  }
}
