import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importar DatePipe para el formato de fechas
import { Afiliado } from '../../../../interfaces/afiliado.interface';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// NgbModal no es estrictamente necesario aquí a menos que tengas modales internos propios
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; 

@Component({
  selector: 'app-listado-afiliados',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe], // Añadir DatePipe a imports
  templateUrl: './listado-afiliados.component.html',
  styleUrls: ['./listado-afiliados.component.css']
})
export class ListadoAfiliadosComponent implements OnInit, OnChanges {
  @Input() afiliados: Afiliado[] = [];
  @Input() categoria1: string[] = []; // Lista para 'tipo'
  @Input() categoria2: string[] = []; // Lista para 'categoria'
  @Input() categoria3: string[] = []; // Lista para 'categoriaNivel'
  @Input() clubes: string[] = []; // Nombres de clubes

  @Output() eliminar = new EventEmitter<number>(); // Emite el idPersona a eliminar
  @Output() editar = new EventEmitter<Afiliado>(); // Emite el objeto Afiliado actualizado

  afiliadoParaEditar: Afiliado | null = null; // Afiliado actualmente en el modal de edición
  afiliadoAEliminar: Afiliado | null = null; // Afiliado actualmente en el modal de confirmación de eliminación
  formEdicion!: FormGroup; // Formulario reactivo para la edición

  tiposAfiliacion = ['FJV', 'FEVA'];
  pases = ['Proveniente', 'Destino', 'Habilitación']; // Tipos de pase disponibles

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.crearFormularioEdicion();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si la lista de afiliados cambia y un afiliado estaba siendo editado, recargar su form
    // Esto asegura que si el afiliado se actualiza desde otra parte, el modal de edición se refresque
    if (changes['afiliados'] && this.afiliadoParaEditar) {
      const updatedAfiliado = this.afiliados.find(a => a.idPersona === this.afiliadoParaEditar!.idPersona);
      if (updatedAfiliado) {
        this.abrirModal(updatedAfiliado); // Recargar los datos del formulario de edición
      } else {
        this.cerrarModal(); // Si el afiliado que se estaba editando fue eliminado
      }
    }
  }

  // Define la estructura del formulario de edición
  crearFormularioEdicion() {
    this.formEdicion = this.fb.group({
      idPersona: [null], // Campo oculto para almacenar el ID de la persona
      apellidoNombre: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]], // DNI con 7 u 8 dígitos numéricos
      tipoAfiliacion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      tipo: ['', Validators.required], // Mapeado de categoria1
      categoria: ['', Validators.required], // Mapeado de categoria2
      categoriaNivel: ['', Validators.required], // Mapeado de categoria3
      club: ['', Validators.required],
      pase: [''], // Opcional
      numeroAfiliacion: [{value: '', disabled: true}], // Solo visualización, no editable
      fechaAlta: [{value: '', disabled: true}], // Solo visualización, no editable
      clubDestino: [''],
      fechaPase: ['']
    });
  }

  // Abre el modal de edición y carga los datos del afiliado en el formulario
  abrirModal(afiliado: Afiliado) {
    this.afiliadoParaEditar = { ...afiliado }; // Crea una copia para evitar mutaciones directas

    this.formEdicion.patchValue({
      idPersona: afiliado.idPersona,
      apellidoNombre: afiliado.apellidoNombre || '',
      dni: afiliado.dni || '',
      tipoAfiliacion: afiliado.tipoAfiliacion || '',
      fechaNacimiento: afiliado.fechaNacimiento || '',
      tipo: afiliado.tipo || '',
      categoria: afiliado.categoria || '',
      categoriaNivel: afiliado.categoriaNivel || '',
      club: afiliado.club || '',
      pase: afiliado.pase || '',
      numeroAfiliacion: afiliado.numeroAfiliacion || '',
      fechaAlta: afiliado.fechaAlta || '',
      clubDestino: afiliado.clubDestino || '',
      fechaPase: afiliado.fechaPase || ''
    });
  }

  // Cierra el modal de edición y resetea el formulario
  cerrarModal() {
    this.afiliadoParaEditar = null;
    this.formEdicion.reset();
  }

  // Guarda los cambios realizados en el formulario de edición
  guardarEdicion() {
    if (this.formEdicion.valid) {
      // Combina los datos originales (para campos no editables) con los datos del formulario
      const actualizado: Afiliado = {
        ...this.afiliadoParaEditar!, // Mantiene propiedades no en el form (ej. createdAt)
        ...this.formEdicion.getRawValue(), // Obtiene todos los valores del formulario, incluyendo los deshabilitados
        idPersona: this.afiliadoParaEditar!.idPersona // Asegura que el ID original se mantenga
      };
      
      this.editar.emit(actualizado); // Emite el afiliado actualizado al padre
      this.cerrarModal(); // Cierra el modal
    } else {
      this.formEdicion.markAllAsTouched(); // Marca todos los campos como tocados para mostrar validaciones
      alert('Por favor, complete todos los campos obligatorios para la edición.');
    }
  }

  // Prepara el modal de confirmación de eliminación
  onEliminar(idPersona: number) {
    this.afiliadoAEliminar = this.afiliados.find(a => a.idPersona === idPersona) || null;
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