import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe es útil si lo usas en el template
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, switchMap, map } from 'rxjs';
import { NgbModal, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Club } from '../../../interfaces/club.interface'; // Ruta ajustada
import { ClubService } from '../../../services/club.service'; // Ruta ajustada
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse para tipar errores

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    DatePipe // Incluir DatePipe si se usa en el template directamente
  ],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {
  clubes$!: Observable<Club[]>;
  private refreshClubs$ = new BehaviorSubject<boolean>(true);
  private searchTerm$ = new BehaviorSubject<string>(''); // Para la funcionalidad de búsqueda

  clubForm!: FormGroup;
  clubParaEditar: Club | null = null;
  clubParaEliminar: Club | null = null;

  estadoAfiliacionOpciones = ['Activo', 'Inactivo', 'Pendiente'];

  constructor(
    private fb: FormBuilder,
    private clubService: ClubService,
    private modalService: NgbModal // Se mantiene para el modal de confirmación de eliminación
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClubs();
  }

  initForm(): void {
    this.clubForm = this.fb.group({
      idClub: [null], // Se usa para identificar si es edición, pero no se envía al backend en creación
      nombre: ['', Validators.required],
      direccion: [''],
      telefono: [''],
      email: ['', Validators.email],
      cuit: ['', [Validators.pattern(/^\d{11}$/)]], // Valida 11 dígitos numéricos
      fechaAfiliacion: ['', Validators.required],
      estadoAfiliacion: ['Activo', Validators.required] // Valor por defecto
    });
  }

  loadClubs(): void {
    this.clubes$ = this.refreshClubs$.pipe(
      switchMap(() => this.clubService.obtenerClubes()),
      // Aplica el filtrado basado en el término de búsqueda
      switchMap(clubs => this.searchTerm$.pipe(
        map(term => {
          if (!term) {
            return clubs; // Si no hay término de búsqueda, retorna todos los clubes
          }
          const lowerTerm = term.toLowerCase();
          return clubs.filter(club =>
            club.nombre.toLowerCase().includes(lowerTerm) ||
            club.direccion?.toLowerCase().includes(lowerTerm) ||
            club.email?.toLowerCase().includes(lowerTerm) ||
            club.telefono?.toLowerCase().includes(lowerTerm) ||
            club.cuit?.toLowerCase().includes(lowerTerm)
          );
        })
      ))
    );
  }

  // Se llama cuando el valor del campo de búsqueda cambia
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm$.next(input.value);
  }

  onGuardarClub(): void {
    if (this.clubForm.invalid) {
      this.clubForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar validaciones
      alert('Por favor, complete todos los campos obligatorios y válidos.');
      return;
    }

    const clubData = this.clubForm.value;
    
    // Convierte el objeto NgbDateStruct a string 'YYYY-MM-DD' si es necesario
    if (clubData.fechaAfiliacion && typeof clubData.fechaAfiliacion === 'object') {
        const ngbDate = clubData.fechaAfiliacion as NgbDateStruct;
        clubData.fechaAfiliacion = `${ngbDate.year}-${String(ngbDate.month).padStart(2, '0')}-${String(ngbDate.day).padStart(2, '0')}`;
    }

    if (this.clubParaEditar) {
      // Modo edición
      this.clubService.actualizarClub(this.clubParaEditar.idClub, clubData).subscribe({
        next: () => {
          alert('Club actualizado con éxito');
          this.refreshClubs$.next(true); // Refresca la lista
          this.cancelarEdicion(); // Limpia el formulario y sale del modo edición
        },
        error: (err: HttpErrorResponse) => console.error('Error al actualizar club:', err)
      });
    } else {
      // Modo agregar
      this.clubService.agregarClub(clubData).subscribe({
        next: () => {
          alert('Club agregado con éxito');
          this.refreshClubs$.next(true); // Refresca la lista
          this.cancelarEdicion(); // Limpia el formulario
        },
        error: (err: HttpErrorResponse) => console.error('Error al agregar club:', err)
      });
    }
  }

  onEditClub(club: Club): void {
    this.clubParaEditar = club; // Establece el club que se está editando
    
    // Convierte la fecha de string a NgbDateStruct para el datepicker
    const fecha = club.fechaAfiliacion ? new Date(club.fechaAfiliacion) : null;
    const ngbDate: NgbDateStruct | null = fecha ? { year: fecha.getFullYear(), month: fecha.getMonth() + 1, day: fecha.getDate() } : null;

    // Rellena el formulario con los datos del club
    this.clubForm.patchValue({
      idClub: club.idClub,
      nombre: club.nombre,
      direccion: club.direccion,
      telefono: club.telefono,
      email: club.email,
      cuit: club.cuit,
      fechaAfiliacion: ngbDate,
      estadoAfiliacion: club.estadoAfiliacion
    });
    // Desplaza la vista a la parte superior de la página para mostrar el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Cancela el modo edición y reinicia el formulario
  cancelarEdicion(): void {
    this.clubParaEditar = null; // Sale del modo edición
    this.clubForm.reset({
      estadoAfiliacion: 'Activo' // Reinicia el formulario con el valor por defecto
    });
    this.clubForm.get('idClub')?.setValue(null); // Asegura que idClub sea null para nuevas adiciones
  }

  // Abre el modal de confirmación de eliminación
  openDeleteConfirmationModal(content: any, club: Club): void {
    this.clubParaEliminar = club;
    this.modalService.open(content, { ariaLabelledBy: 'modal-confirm-delete' });
  }

  // Confirma y ejecuta la eliminación del club
  confirmarEliminacion(): void {
    if (this.clubParaEliminar) {
      this.clubService.eliminarClub(this.clubParaEliminar.idClub).subscribe({
        next: () => {
          alert('Club eliminado con éxito');
          this.refreshClubs$.next(true); // Refresca la lista
          this.modalService.dismissAll(); // Cierra el modal
          this.clubParaEliminar = null; // Limpia el club a eliminar
        },
        error: (err: HttpErrorResponse) => console.error('Error al eliminar club:', err)
      });
    }
  }
}