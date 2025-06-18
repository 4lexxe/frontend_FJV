import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Afiliado } from '../../../../interfaces/afiliado.interface';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-listado-afiliados',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './listado-afiliados.component.html',
  styleUrls: ['./listado-afiliados.component.css']
})
export class ListadoAfiliadosComponent implements OnInit {
  @Input() afiliados: Afiliado[] = [];
  @Input() categoria1: string[] = [];
  @Input() categoria2: string[] = [];
  @Input() categoria3: string[] = [];
  @Input() clubes: string[] = [];

  @Output() eliminar = new EventEmitter<number>();
  @Output() editar = new EventEmitter<Afiliado>();

  afiliadoParaEditar: Afiliado | null = null;
  afiliadoAEliminar: Afiliado | null = null;
  formEdicion!: FormGroup;

  tiposAfiliacion = ['FJV', 'FEVA'];

  pases: string[] = ['Proveniente', 'Destino', 'Habilitación'];


  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.crearFormularioVacio();
  }

  crearFormularioVacio() {
    this.formEdicion = this.fb.group({
      apellidoNombre: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(7)]],
      tipoAfiliacion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      categoria1: ['', Validators.required],
      categoria2: ['', Validators.required],
      categoria3: ['', Validators.required],
      club: ['', Validators.required],
      pase: [''],
      numeroAfiliacion: [''],
      fechaAlta: [''],
      clubDestino: [''],
      fechaPase: ['']
    });
  }

  abrirModal(afiliado: Afiliado) {
    this.afiliadoParaEditar = { ...afiliado };

    this.formEdicion.setValue({
      apellidoNombre: afiliado.apellidoNombre || '',
      dni: afiliado.dni || '',
      tipoAfiliacion: afiliado.tipoAfiliacion || '',
      fechaNacimiento: afiliado.fechaNacimiento || '',
      categoria1: afiliado.categoria1 || '',
      categoria2: afiliado.categoria2 || '',
      categoria3: afiliado.categoria3 || '',
      club: afiliado.club || '',
      pase: afiliado.pase || '',
      numeroAfiliacion: afiliado.numeroAfiliacion || '',
      fechaAlta: afiliado.fechaAlta || '',
      clubDestino: afiliado.clubDestino || '',
      fechaPase: afiliado.fechaPase || ''
    });
  }

  cerrarModal() {
    this.afiliadoParaEditar = null;
    this.formEdicion.reset();
  }

  guardarEdicion() {
    if (this.formEdicion.valid) {
      const actualizado: Afiliado = this.formEdicion.value;
      // Actualiza el afiliado en el array local
      const idx = this.afiliados.findIndex(a => a.numeroAfiliacion === actualizado.numeroAfiliacion);
      if (idx !== -1) {
        this.afiliados[idx] = { ...actualizado };
      }
      this.editar.emit(actualizado);
      this.cerrarModal();
    } else {
      this.formEdicion.markAllAsTouched();
    }
  }

  onEliminar(numeroAfiliacion: number) {
    this.afiliadoAEliminar = this.afiliados.find(a => a.numeroAfiliacion === numeroAfiliacion) || null;
  }

  confirmarEliminacion() {
    if (this.afiliadoAEliminar) {
      this.eliminar.emit(this.afiliadoAEliminar.numeroAfiliacion);
      this.afiliadoAEliminar = null;
    }
  }

  cancelarEliminacion() {
    this.afiliadoAEliminar = null;
  }
}
