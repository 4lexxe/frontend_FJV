import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClubService } from '../../../../services/club.service';
import { Club } from '../../../../interfaces/club.interface';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-editar-club',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './editar-club.page.html',
  styleUrls: ['./editar-club.page.css']
})
export class EditarClubPage implements OnInit {
  clubForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  clubId: number = 0;

  // Estados de afiliación disponibles
  estadosAfiliacion = ['Activo', 'Inactivo', 'Suspendido'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (isNaN(id)) {
          return of(null);
        }
        this.clubId = id;
        return this.clubService.getClub(id);
      })
    ).subscribe({
      next: (club) => {
        this.isLoading = false;
        if (!club) {
          this.errorMessage = 'No se encontró el club solicitado';
          return;
        }
        this.patchFormValues(club);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = `Error al cargar el club: ${error.message}`;
      }
    });
  }

  initForm(): void {
    this.clubForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      telefono: ['', [Validators.pattern(/^[0-9+\-\s]{6,20}$/)]],
      email: ['', [Validators.required, Validators.email]],
      cuit: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{8}-\d{1}$/)]],
      fechaAfiliacion: ['', Validators.required],
      estadoAfiliacion: ['', Validators.required]
    });
  }

  patchFormValues(club: Club): void {
    this.clubForm.patchValue({
      nombre: club.nombre,
      direccion: club.direccion,
      telefono: club.telefono || '',
      email: club.email,
      cuit: club.cuit,
      fechaAfiliacion: club.fechaAfiliacion,
      estadoAfiliacion: club.estadoAfiliacion
    });
  }

  onSubmit(): void {
    if (this.clubForm.invalid) {
      this.clubForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const clubData: Club = this.clubForm.value;

    this.clubService.updateClub(this.clubId, clubData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status === "1") {
          this.successMessage = response.msg;
          setTimeout(() => {
            this.router.navigate(['/dashboard/clubes/detalle', this.clubId]);
          }, 2000);
        } else {
          this.errorMessage = response.msg || 'Error al actualizar el club';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.msg || 'Error al actualizar el club. Por favor intente nuevamente.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/clubes/detalle', this.clubId]);
  }

  // Getters para acceder a los controles del formulario desde el template
  get nombreControl() { return this.clubForm.get('nombre'); }
  get direccionControl() { return this.clubForm.get('direccion'); }
  get telefonoControl() { return this.clubForm.get('telefono'); }
  get emailControl() { return this.clubForm.get('email'); }
  get cuitControl() { return this.clubForm.get('cuit'); }
  get fechaAfiliacionControl() { return this.clubForm.get('fechaAfiliacion'); }
  get estadoAfiliacionControl() { return this.clubForm.get('estadoAfiliacion'); }
}
