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
  @Output() eliminar = new EventEmitter<number>(); // enviamos el número de afiliación para identificar
  @Output() editar = new EventEmitter<Afiliado>();

  onEliminar(numeroAfiliacion: number) {
    if (confirm('¿Seguro querés eliminar este afiliado?')) {
      this.eliminar.emit(numeroAfiliacion);
    }
  }

  onEditar(afiliado: Afiliado) {
    this.editar.emit(afiliado);
  }
}
