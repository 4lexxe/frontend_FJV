import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Afiliado } from '../../../../interfaces/afiliado.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
      licencia: ['FJV', Validators.required],
      tipo: ['', Validators.required],
      categoria: ['', Validators.required],
      categoriaNivel: ['', Validators.required],

      // Campos de licencia - estadoLicencia como readonly
      fechaLicencia: [''],
      fechaLicenciaBaja: [''],
      estadoLicencia: [{ value: 'INACTIVO', disabled: true }], 

      club: ['', Validators.required],
      pase: [''],
      clubDestino: [''],
      fechaPase: [''],
    });

    // Listener para calcular fecha de vencimiento automáticamente
    this.form.get('fechaLicencia')?.valueChanges.subscribe(fechaLicencia => {
      const fechaVencimientoControl = this.form.get('fechaLicenciaBaja');

      // Solo calcular automáticamente si el campo de vencimiento está vacío
      if (fechaLicencia && !fechaVencimientoControl?.value) {
        const fecha = new Date(fechaLicencia);
        fecha.setFullYear(fecha.getFullYear() + 1);
        fechaVencimientoControl?.setValue(fecha.toISOString().substring(0, 10));
      }

      // Recalcular estado cuando cambia la fecha de licencia
      this.actualizarEstadoLicencia();
    });

    // Listener para actualizar estado cuando cambia la fecha de vencimiento
    this.form.get('fechaLicenciaBaja')?.valueChanges.subscribe(() => {
      this.actualizarEstadoLicencia();
    });
  }

  ngOnInit(): void {
    if (this.afiliadoParaEditar?.avatar) {
      this.avatarData = this.afiliadoParaEditar.avatar;
    }

    if (this.afiliadoParaEditar?.foto) {
      console.log('Cargando foto del afiliado (URL de ImgBB):', this.afiliadoParaEditar.foto);
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
        licencia: this.afiliadoParaEditar.licencia, 
        tipo: this.afiliadoParaEditar.tipo,
        categoria: this.afiliadoParaEditar.categoria,
        categoriaNivel: this.afiliadoParaEditar.categoriaNivel,

        // Campos de licencia
        fechaLicencia: this.afiliadoParaEditar.fechaLicencia,
        fechaLicenciaBaja: this.afiliadoParaEditar.fechaLicenciaBaja,
        estadoLicencia: this.afiliadoParaEditar.estadoLicencia || 'INACTIVO',

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

      if (this.afiliadoParaEditar.foto) {
        console.log('Foto del afiliado disponible (ImgBB):', this.afiliadoParaEditar.foto);
        this.fotoUrl = this.afiliadoParaEditar.foto;
      } else {
        this.fotoUrl = '';
        if (this.afiliadoParaEditar.idPersona) {
          this.loadFotoFromServer();
        }
      }

      setTimeout(() => {
        this.form.markAsPristine();
        this.form.markAsUntouched();
      });
    } else if (changes['afiliadoParaEditar'] && !this.afiliadoParaEditar) {
      this.resetForm();
    }
  }

  onGuardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Complete los campos obligatorios.');
      return;
    }

    if (this.afiliadoParaEditar && !this.hasPendingChanges()) {
      alert('No se han detectado cambios para guardar.');
      return;
    }

    // Obtener valores incluyendo los campos deshabilitados
    const formValues = this.form.getRawValue();
    console.log('Valores del formulario:', formValues);

    const afiliado: Afiliado = {
      ...formValues,
      idPersona: this.afiliadoParaEditar?.idPersona,
      avatar: this.avatarData,
      foto: this.fotoUrl,
    };

    console.log('Afiliado a guardar:', afiliado);

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

        if (afiliadoGuardado && (afiliadoGuardado.idPersona || afiliadoGuardado.dni)) {
          this.guardarAfiliado.emit(afiliadoGuardado);
          this.resetForm();
        } else {
          console.error('Respuesta del servidor incompleta:', afiliadoGuardado);
          this.photoUploadError = 'El afiliado se guardó pero la respuesta del servidor fue incompleta';
        }
      },
      error: (error) => {
        this.uploadingPhoto = false;
        console.error('Error al guardar afiliado:', error);

        if (error.error?.message) {
          this.photoUploadError = error.error.message;
        } else if (error.error?.msg) {
          this.photoUploadError = error.error.msg;
        } else if (error.status === 400) {
          this.photoUploadError = 'Datos inválidos. Verifique la información ingresada.';
        } else if (error.status === 500) {
          this.photoUploadError = 'Error del servidor. Intente nuevamente.';
        } else {
          this.photoUploadError = 'Error al guardar el afiliado';
        }

        alert(`Error: ${this.photoUploadError}`);
      }
    });
  }

  onCancelar(): void {
    this.resetForm();
    this.cancelar.emit();
  }

  resetForm() {
    this.form.reset({
      apellidoNombre: '',
      dni: '',
      fechaNacimiento: '',
      numeroAfiliacion: '',
      licencia: '', 
      tipo: '',
      categoria: '',
      categoriaNivel: '',

      // Valores por defecto para campos de licencia
      fechaLicencia: '',
      fechaLicenciaBaja: '',
      estadoLicencia: 'INACTIVO', 

      club: '',
      pase: '',
      clubDestino: '',
      fechaPase: '',
    });

    if (this.form.contains('idPersona')) {
      this.form.removeControl('idPersona');
    }

    // Asegurar que el estado quede deshabilitado después del reset
    this.form.get('estadoLicencia')?.disable();

    this.avatarData = this.generateDefaultAvatar();
    this.fotoUrl = '';
    this.fotoFile = null;
    this.photoUploadError = '';
    this.uploadingPhoto = false;

    setTimeout(() => {
      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  onEditarClubesClick(): void {
    this.editarClubes.emit();
  }

  onAvatarChange(avatar: any): void {
    this.avatarData = avatar;
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
      this.form.markAsDirty();
      this.form.markAsTouched();
    }
  }

  onRegenerateAvatar(): void {
    console.log('Avatar regenerado');
  }

  hasPendingChanges(): boolean {
    const hasFormChanges = this.form.dirty;
    const hasPhotoChanges = this.fotoFile !== null;
    const hasAvatarChanges = this.avatarData &&
      JSON.stringify(this.avatarData) !== JSON.stringify(this.afiliadoParaEditar?.avatar);

    return hasFormChanges || hasPhotoChanges || hasAvatarChanges;
  }

  isSubmitDisabled(): boolean {
    if (this.uploadingPhoto) {
      return true;
    }

    if (this.form.invalid) {
      return true;
    }

    if (this.afiliadoParaEditar && !this.hasPendingChanges()) {
      return true;
    }

    return false;
  }

  private loadFotoFromServer(): void {
    if (this.afiliadoParaEditar?.idPersona) {
      console.log('Intentando cargar foto desde servidor para persona:', this.afiliadoParaEditar.idPersona);

      this.afiliadoService.obtenerFotoPerfil(this.afiliadoParaEditar.idPersona).subscribe({
        next: (fotoUrl) => {
          if (fotoUrl && fotoUrl.trim() !== '') {
            console.log('Foto URL cargada desde servidor:', fotoUrl);
            this.fotoUrl = fotoUrl;
          } else {
            console.log('No hay foto disponible en el servidor');
          }
        },
        error: (error) => {
          console.log('Error al cargar foto desde servidor:', error);
        }
      });
    }
  }

  private generateDefaultAvatar(): any {
    return {
      icon: 'fas fa-user',
      color: '#6c757d',
      size: '4rem',
      type: 'fontawesome'
    };
  }

  private actualizarEstadoLicencia(): void {
    const fechaLicencia = this.form.get('fechaLicencia')?.value;
    const fechaVencimiento = this.form.get('fechaLicenciaBaja')?.value;
    const estadoControl = this.form.get('estadoLicencia');

    if (!estadoControl) return;

    // Si no hay fechas, estado INACTIVO
    if (!fechaLicencia && !fechaVencimiento) {
      estadoControl.setValue('INACTIVO');
      return;
    }

    // Si solo hay fecha de inicio pero no de vencimiento, ACTIVO
    if (fechaLicencia && !fechaVencimiento) {
      estadoControl.setValue('ACTIVO');
      return;
    }

    // Si hay fecha de vencimiento, verificar si está vencida
    if (fechaVencimiento) {
      const hoy = new Date();
      const vencimiento = new Date(fechaVencimiento);

      // Comparar solo las fechas (sin hora)
      hoy.setHours(0, 0, 0, 0);
      vencimiento.setHours(0, 0, 0, 0);

      if (vencimiento < hoy) {
        estadoControl.setValue('VENCIDO');
      } else {
        estadoControl.setValue('ACTIVO');
      }
    } else {
      estadoControl.setValue('INACTIVO');
    }
  }

  private getRandomOption(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }
}
