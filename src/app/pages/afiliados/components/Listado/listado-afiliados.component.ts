import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { Afiliado } from '../../../../interfaces/afiliado.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listado-afiliados',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './listado-afiliados.component.html',
  styleUrls: ['./listado-afiliados.component.css']
})
export class ListadoAfiliadosComponent implements OnInit, OnChanges {
  @Input() afiliados: Afiliado[] = [];
  @Input() categoria1: string[] = [];
  @Input() categoria2: string[] = []; 
  @Input() categoria3: string[] = [];
  @Input() clubes: string[] = []; 

  @Output() eliminar = new EventEmitter<number>();
  @Output() editar = new EventEmitter<Afiliado>(); 

  afiliadoAEliminar: Afiliado | null = null;

  tiposAfiliacion = ['FJV', 'FEVA'];
  pases = ['Proveniente', 'Destino', 'Habilitación']; 

  constructor() {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // La lógica de edición se ha movido a la página de formulario.
  }

  onEditar(afiliado: Afiliado) {
    this.editar.emit(afiliado);
  }

  // Prepara el modal de confirmación de eliminación
  onEliminar(afiliado: Afiliado) {
    this.afiliadoAEliminar = afiliado;
  }

  // Confirma la eliminación y emite el ID al componente padre
  confirmarEliminacion() {
    if (this.afiliadoAEliminar && this.afiliadoAEliminar.idPersona !== undefined) {
      this.eliminar.emit(this.afiliadoAEliminar.idPersona);
      this.afiliadoAEliminar = null; // Limpia el afiliado a eliminar
    }
  }

  // Cancela la eliminación
  cancelarEliminacion() {
    this.afiliadoAEliminar = null;
  }
}