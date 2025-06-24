import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Afiliado } from '../../../../interfaces/afiliado.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalEdicionListaComponent } from '../modal-edicion-lista.component';
import { AvatarSelectorComponent } from '../../../../components/avatar-selector/avatar-selector.component';
import { AfiliadoService } from '../../../../services/afiliado.service';

@Component({
  selector: 'app-formulario-afiliado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarSelectorComponent],
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
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;

  avatarData: any = null;
  fotoUrl: string = '';
  fotoFile: File | null = null;

  uploadingPhoto = false;
  photoUploadError = '';

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private afiliadoService: AfiliadoService
  ) {
    this.form = this.fb.group({
      apellidoNombre: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      fechaNacimiento: ['', Validators.required],
      numeroAfiliacion: [{ value: '', disabled: true }, Validators.required],
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

    if (this.afiliadoParaEditar?.avatar) {
      this.avatarData = this.afiliadoParaEditar.avatar;
    }
    if (this.afiliadoParaEditar?.foto) {
      this.fotoUrl = this.afiliadoParaEditar.foto;
    }

    if (!this.avatarData) {
      this.generateDefaultAvatar();
    }

    if (this.afiliadoParaEditar?.idPersona && !this.fotoUrl) {
      this.loadFotoFromServer();
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

      this.avatarData = this.afiliadoParaEditar.avatar || this.generateDefaultAvatar();
      this.fotoUrl = this.afiliadoParaEditar.foto || '';

      if (this.afiliadoParaEditar.idPersona) {
        this.loadFotoFromServer();
      }

      // Marcar el formulario como pristine después de cargar los datos
      setTimeout(() => {
        this.form.markAsPristine();
        this.form.markAsUntouched();
      });
    } else if (changes['afiliadoParaEditar'] && !this.afiliadoParaEditar) {
      this.resetForm();
    }
  }

  onGuardar(): void {
    // Verificar si el formulario es válido
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Complete los campos obligatorios.');
      return;
    }

    // Para afiliados existentes, verificar si hay cambios
    if (this.afiliadoParaEditar && !this.hasPendingChanges()) {
      // Este código no debería ejecutarse si el botón está correctamente deshabilitado
      alert('No se han detectado cambios para guardar.');
      return;
    }

    const afiliado: Afiliado = {
      ...this.form.getRawValue(),
      idPersona: this.form.contains('idPersona') ? this.form.get('idPersona')?.value : undefined,
      avatar: this.avatarData,
      foto: this.fotoUrl,
    };

    if (this.fotoFile) {
      this.uploadingPhoto = true;
      this.photoUploadError = '';
    }

    const operation = this.afiliadoParaEditar && afiliado.idPersona
      ? this.afiliadoService.actualizarAfiliadoConFoto(afiliado.idPersona, afiliado, this.fotoFile || undefined)
      : this.afiliadoService.crearAfiliadoConFoto(afiliado, this.fotoFile || undefined);

    operation.subscribe({
      next: (afiliadoGuardado) => {
        this.uploadingPhoto = false;
        this.photoUploadError = '';
        console.log('Afiliado guardado exitosamente:', afiliadoGuardado);
        this.guardarAfiliado.emit(afiliadoGuardado);
        this.resetForm();
      },
      error: (error) => {
        this.uploadingPhoto = false;
        this.photoUploadError = error.error?.msg || 'Error al guardar el afiliado';
        console.error('Error al guardar afiliado:', error);
        alert(`Error: ${this.photoUploadError}`);
      }
    });
  }

  onCancelar(): void {
    // Limpiar el formulario
    this.resetForm();

    // Emitir evento de cancelación al componente padre
    this.cancelar.emit();
  }

  resetForm() {
    this.form.reset({
      apellidoNombre: '',
      dni: '',
      fechaNacimiento: '',
      numeroAfiliacion: '',
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

    this.avatarData = this.generateDefaultAvatar();
    this.fotoUrl = '';
    this.fotoFile = null;
    this.photoUploadError = '';
    this.uploadingPhoto = false;

    // Asegurar que el formulario quede como pristine después del reset
    setTimeout(() => {
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  abrirModalEdicionCategoria(tipoLista: 'categoria1' | 'categoria2' | 'categoria3') {
    const modalRef = this.modalService.open(ModalEdicionListaComponent);
    modalRef.componentInstance.titulo = tipoLista === 'categoria1' ? 'Tipo (Jugador, Entrenador...)' :
                                       (tipoLista === 'categoria2' ? 'Categoría (Sub16, Mayores...)' : 'Nivel de Categoría');

    if (tipoLista === 'categoria1') {
      modalRef.componentInstance.lista = [...this.categoria1];
    } else if (tipoLista === 'categoria2') {
      modalRef.componentInstance.lista = [...this.categoria2];
    } else if (tipoLista === 'categoria3') {
      modalRef.componentInstance.lista = [...this.categoria3];
    }

    modalRef.result.then((nuevaLista: string[]) => {
      if (tipoLista === 'categoria1') {
        this.categoria1 = nuevaLista;
      } else if (tipoLista === 'categoria2') {
        this.categoria2 = nuevaLista;
      } else if (tipoLista === 'categoria3') {
        this.categoria3 = nuevaLista;
      }
    }).catch(() => {
    });
  }

  onEditarClubesClick(): void {
    this.editarClubes.emit();
  }

  onAvatarChange(avatar: any): void {
    this.avatarData = avatar;

    // Marcar el formulario como modificado cuando cambia el avatar
    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  onFotoSelected(file: File): void {
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es 4MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, GIF, WebP.');
      return;
    }

    this.fotoFile = file;
    this.photoUploadError = '';

    // Marcar el formulario como modificado para habilitar el botón de guardar
    this.form.markAsDirty();
    this.form.markAsTouched();

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onFotoRemoved(): void {
    if (this.afiliadoParaEditar?.idPersona && this.afiliadoParaEditar.foto) {
      this.uploadingPhoto = true;
      this.afiliadoService.eliminarFotoPerfil(this.afiliadoParaEditar.idPersona).subscribe({
        next: () => {
          this.uploadingPhoto = false;
          this.fotoUrl = '';
          this.fotoFile = null;
          this.photoUploadError = '';

          // Marcar el formulario como modificado
          this.form.markAsDirty();
          this.form.markAsTouched();

          console.log('Foto eliminada del servidor');
        },
        error: (error) => {
          this.uploadingPhoto = false;
          this.photoUploadError = 'Error al eliminar la foto del servidor';
          console.error('Error al eliminar foto:', error);
        }
      });
    } else {
      this.fotoUrl = '';
      this.fotoFile = null;
      this.photoUploadError = '';

      // Marcar el formulario como modificado
      this.form.markAsDirty();
      this.form.markAsTouched();
    }
  }

  onRegenerateAvatar(): void {
    console.log('Avatar regenerado');
  }

  // Método para verificar si hay cambios pendientes
  hasPendingChanges(): boolean {
    const hasFormChanges = this.form.dirty;
    const hasPhotoChanges = this.fotoFile !== null;
    const hasAvatarChanges = this.avatarData &&
      JSON.stringify(this.avatarData) !== JSON.stringify(this.afiliadoParaEditar?.avatar);

    return hasFormChanges || hasPhotoChanges || hasAvatarChanges;
  }

  // Método para determinar si el botón de envío debe estar deshabilitado
  isSubmitDisabled(): boolean {
    // Si está subiendo foto, deshabilitar
    if (this.uploadingPhoto) {
      return true;
    }

    // Si el formulario es inválido, deshabilitar
    if (this.form.invalid) {
      return true;
    }

    // Si estamos editando un afiliado existente y no hay cambios, deshabilitar
    if (this.afiliadoParaEditar && !this.hasPendingChanges()) {
      return true;
    }

    // En todos los demás casos, habilitar el botón
    return false;
  }

  private loadFotoFromServer(): void {
    if (this.afiliadoParaEditar?.idPersona) {
      this.afiliadoService.obtenerFotoPerfil(this.afiliadoParaEditar.idPersona).subscribe({
        next: (fotoUrl) => {
          if (fotoUrl) {
            this.fotoUrl = fotoUrl;
          }
        },
        error: (error) => {
          console.log('No hay foto de perfil o error cargándola:', error);
        }
      });
    }
  }

  private generateDefaultAvatar(): any {
    // Siempre devolver el mismo avatar por defecto
    return {
      icon: 'fas fa-user',
      color: '#6c757d',
      size: '4rem',
      type: 'fontawesome'
    };
  }

  private getRandomOption(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }
}
