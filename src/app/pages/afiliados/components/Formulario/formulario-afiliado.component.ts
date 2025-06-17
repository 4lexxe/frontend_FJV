import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Afiliado } from '../../../../interfaces/afiliado.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalEdicionListaComponent } from '../modal-edicion-lista.component';
@Component({
  selector: 'app-formulario-afiliado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-afiliado.component.html',
  styleUrls: ['./formulario-afiliado.component.css'],
})
export class FormularioAfiliadoComponent {
  @Input() categoria1: string[] = [];
  @Input() categoria2: string[] = [];
  @Input() categoria3: string[] = [];
  @Input() clubes: string[] = [];

  @Output() guardarAfiliado = new EventEmitter<Afiliado>();
  @Output() editarCategorias = new EventEmitter<'categoria1' | 'categoria2' | 'categoria3'>();
  @Output() editarClubes = new EventEmitter<void>();

  form: FormGroup;

  private ultimoNumeroAfiliacion = 1000;

  constructor(private fb: FormBuilder, private modalService: NgbModal) {
    this.form = this.fb.group({
      apellidoNombre: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      fechaNacimiento: ['', Validators.required],
      numeroAfiliacion: [{ value: this.generarNumeroAfiliacion(), disabled: true }, Validators.required],
      tipoAfiliacion: ['FJV', Validators.required],
      categoria1: ['', Validators.required],
      categoria2: ['', Validators.required],
      categoria3: ['', Validators.required],
      fechaAlta: ['', Validators.required],
      club: ['', Validators.required],
      pase: [''], // Opcional, sin Validators.required
      clubDestino: [''],
      fechaPase: [''],
    });
  }

  generarNumeroAfiliacion(): number {
    this.ultimoNumeroAfiliacion++;
    return this.ultimoNumeroAfiliacion;
  }

  onGuardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Complete los campos obligatorios.');
      return;
    }

    // Obtener el valor habilitado para numeroAfiliacion
    const numeroAfiliacion = this.form.get('numeroAfiliacion')?.value;

    const afiliado: Afiliado = {
      ...this.form.getRawValue(),
      numeroAfiliacion,
    };

    this.guardarAfiliado.emit(afiliado);

    this.form.reset({
      tipoAfiliacion: 'FJV',
      pase: '',
      numeroAfiliacion: this.generarNumeroAfiliacion(),
    });
  }

  onEditarCategorias(tipo: 'categoria1' | 'categoria2' | 'categoria3'): void {
    this.editarCategorias.emit(tipo);
  }

  onEditarClubes(): void {
    this.editarClubes.emit();
  }

  abrirModal(tipo: 'categoria1' | 'categoria2' | 'categoria3' | 'club') {
  const modalRef = this.modalService.open(ModalEdicionListaComponent);
  modalRef.componentInstance.titulo = tipo === 'club' ? 'Clubes' : tipo.toUpperCase();
  if (tipo === 'club') {
    modalRef.componentInstance.lista = [...this.clubes];
  } else {
    modalRef.componentInstance.lista = [...(this[tipo as 'categoria1' | 'categoria2' | 'categoria3'])];
  }

  modalRef.result.then((nuevaLista: string[]) => {
    if (tipo === 'club') {
      this.clubes = nuevaLista;
    } else {
      this[tipo as 'categoria1' | 'categoria2' | 'categoria3'] = nuevaLista;
    }
  }).catch(() => {});
}
}
