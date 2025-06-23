import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
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
export class FormularioAfiliadoComponent implements OnChanges, OnInit {
  @Input() afiliadoParaEditar: Afiliado | null = null;
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
      tipo: ['', Validators.required],
      categoria: ['', Validators.required],
      categoriaNivel: ['', Validators.required],
      fechaAlta: ['', Validators.required],
      club: ['', Validators.required],
      pase: [''],
      clubDestino: [''],
      fechaPase: [''],
    });
  }

  ngOnInit(): void {
    if (!this.form.get('fechaAlta')?.value) {
      this.form.get('fechaAlta')?.setValue(new Date().toISOString().substring(0, 10));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['afiliadoParaEditar'] && this.afiliadoParaEditar) {
      this.form.patchValue({
        apellidoNombre: this.afiliadoParaEditar.apellidoNombre,
        dni: this.afiliadoParaEditar.dni,
        fechaNacimiento: this.afiliadoParaEditar.fechaNacimiento,
        numeroAfiliacion: this.afiliadoParaEditar.numeroAfiliacion,
        tipoAfiliacion: this.afiliadoParaEditar.tipoAfiliacion,
        tipo: this.afiliadoParaEditar.tipo,
        categoria: this.afiliadoParaEditar.categoria,
        categoriaNivel: this.afiliadoParaEditar.categoriaNivel,
        fechaAlta: this.afiliadoParaEditar.fechaAlta,
        club: this.afiliadoParaEditar.club,
        pase: this.afiliadoParaEditar.pase,
        clubDestino: this.afiliadoParaEditar.clubDestino,
        fechaPase: this.afiliadoParaEditar.fechaPase,
      });
      if (!this.form.contains('idPersona')) {
        this.form.addControl('idPersona', this.fb.control(this.afiliadoParaEditar.idPersona));
      } else {
        this.form.get('idPersona')?.setValue(this.afiliadoParaEditar.idPersona);
      }
    } else if (changes['afiliadoParaEditar'] && !this.afiliadoParaEditar) {
      this.resetForm();
    }
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

    const afiliado: Afiliado = {
      ...this.form.getRawValue(),
      idPersona: this.form.contains('idPersona') ? this.form.get('idPersona')?.value : undefined,
    };

    this.guardarAfiliado.emit(afiliado);
    this.resetForm();
  }

  resetForm() {
    this.form.reset({
      apellidoNombre: '',
      dni: '',
      fechaNacimiento: '', 
      numeroAfiliacion: this.generarNumeroAfiliacion(),
      tipoAfiliacion: 'FJV',
      tipo: '',
      categoria: '',
      categoriaNivel: '',
      fechaAlta: new Date().toISOString().substring(0, 10),
      club: '',
      pase: '',
      clubDestino: '',
      fechaPase: '',
    });
    if (this.form.contains('idPersona')) {
      this.form.removeControl('idPersona');
    }
  }

  // Modificado: Este método ahora solo maneja la edición de categorías
  abrirModalEdicionCategoria(tipoLista: 'categoria1' | 'categoria2' | 'categoria3') {
    const modalRef = this.modalService.open(ModalEdicionListaComponent);
    modalRef.componentInstance.titulo = tipoLista === 'categoria1' ? 'Tipo (Jugador, Entrenador...)' : 
                                       (tipoLista === 'categoria2' ? 'Categoría (Sub16, Mayores...)' : 'Nivel de Categoría');
    
    // Pasa la lista correcta al modal
    if (tipoLista === 'categoria1') {
      modalRef.componentInstance.lista = [...this.categoria1];
    } else if (tipoLista === 'categoria2') {
      modalRef.componentInstance.lista = [...this.categoria2];
    } else if (tipoLista === 'categoria3') {
      modalRef.componentInstance.lista = [...this.categoria3];
    }

    // Maneja el resultado del modal
    modalRef.result.then((nuevaLista: string[]) => {
      // Actualiza la lista localmente con los cambios del modal
      if (tipoLista === 'categoria1') {
        this.categoria1 = nuevaLista;
      } else if (tipoLista === 'categoria2') {
        this.categoria2 = nuevaLista;
      } else if (tipoLista === 'categoria3') {
        this.categoria3 = nuevaLista;
      }
    }).catch(() => {
      // Manejar el rechazo del modal (ej. cerrar sin guardar)
    });
  }

  // Nuevo método para emitir el evento de editar clubes al padre
  onEditarClubesClick(): void {
    this.editarClubes.emit();
  }
}