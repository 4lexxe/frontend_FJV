import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, switchMap, map } from 'rxjs';
import { NgbModal, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Club } from '../../interfaces/club.interface';
import { ClubService } from '../../services/club.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ListadoClubesComponent } from './components/listado-clubes/listado-clubes.component';
import { BuscadorClubComponent } from './components/buscador-club/buscador-club.component';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [
    CommonModule,
    NgbDatepickerModule,
    ListadoClubesComponent,
    BuscadorClubComponent,
    RouterModule
  ],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {
  clubes$!: Observable<Club[]>;
  private refreshClubs$ = new BehaviorSubject<boolean>(true);
  private searchTerm$ = new BehaviorSubject<string>('');

  constructor(
    private clubService: ClubService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.clubes$ = this.refreshClubs$.pipe(
      switchMap(() => this.clubService.getClubes()),

      switchMap(clubs => this.searchTerm$.pipe(
        map(term => {
          if (!term) {
            return clubs;
          }
          const lowerTerm = term.toLowerCase();
          return clubs.filter((club: Club) =>
            (club.nombre || '').toLowerCase().includes(lowerTerm) ||
            (club.direccion || '').toLowerCase().includes(lowerTerm) ||
            (club.email || '').toLowerCase().includes(lowerTerm) ||
            (club.telefono?.toString() || '').includes(lowerTerm) ||
            (club.cuit?.toString() || '').includes(lowerTerm)
          );
        })
      ))
    );
  }

  // Se llama cuando el valor del campo de búsqueda cambia
  onSearchChange(term: string): void {
    this.searchTerm$.next(term);
  }

  onEditClub(club: Club): void {
    this.router.navigate(['/clubs/editar', club.idClub]);
  }

  onEliminarClub(club: Club): void {
    this.clubService.deleteClub(club.idClub!).subscribe({
      next: () => {
        alert('Club eliminado con éxito');
        this.refreshClubs$.next(true);
      },
      error: (err: any) => {
        console.error('Error al eliminar club:', err);
        alert('Error al eliminar el club. Por favor, intente de nuevo.');
      }
    });
  }
}
