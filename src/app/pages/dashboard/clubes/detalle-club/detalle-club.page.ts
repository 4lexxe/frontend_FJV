import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClubService, Club } from '../../../../services/club.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-detalle-club',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-club.page.html',
  styleUrls: ['./detalle-club.page.css']
})
export class DetalleClubPage implements OnInit {
  club: Club | null = null;
  isLoading = true;
  errorMessage = '';

  badgeClasses: {[key: string]: string} = {
    'Activo': 'bg-success',
    'Suspendido': 'bg-warning',
    'Inactivo': 'bg-secondary'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (isNaN(id)) {
          return of(null);
        }
        return this.clubService.getClub(id);
      })
    ).subscribe({
      next: (club) => {
        this.isLoading = false;
        if (!club) {
          this.errorMessage = 'No se encontró el club solicitado';
          return;
        }
        this.club = club;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = `Error al cargar el club: ${error.message}`;
      }
    });
  }

  eliminarClub(): void {
    if (!this.club?.idClub) return;

    if (confirm('¿Está seguro que desea eliminar este club? Esta acción no se puede deshacer.')) {
      this.clubService.deleteClub(this.club.idClub).subscribe({
        next: (response) => {
          if (response.status === "1") {
            alert('Club eliminado con éxito');
            this.router.navigate(['/dashboard/clubes']);
          }
        },
        error: (error) => {
          alert(`Error al eliminar el club: ${error.error?.msg || error.message}`);
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/clubes']);
  }
}
