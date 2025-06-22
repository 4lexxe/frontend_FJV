import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // No necesitamos HttpErrorResponse aquí
import { Observable } from 'rxjs';
import { Club } from '../interfaces/club.interface';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private apiUrl = 'http://localhost:3000/api/clubs'; // ¡AJUSTA ESTA URL A LA DE TU BACKEND PARA CLUBES SI ES DIFERENTE!

  constructor(private http: HttpClient) { }

  obtenerClubes(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl);
  }

  obtenerClubPorId(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.apiUrl}/${id}`);
  }

  agregarClub(club: Club): Observable<Club> {
    // Al agregar, el backend debe generar el idClub y los timestamps (createdAt, updatedAt).
    // Usamos desestructuración para crear un nuevo objeto que omite estas propiedades.
    const { idClub, createdAt, updatedAt, ...clubParaBackend } = club;
    
    return this.http.post<Club>(this.apiUrl, clubParaBackend);
  }

  actualizarClub(id: number, club: Club): Observable<Club> {
    // Para actualizar, omitimos los timestamps (createdAt, updatedAt) ya que el backend los gestiona.
    // No omitimos idClub aquí porque lo usamos en la URL para identificar el club a actualizar.
    const { createdAt, updatedAt, ...clubParaBackend } = club;

    return this.http.put<Club>(`${this.apiUrl}/${id}`, clubParaBackend);
  }

  eliminarClub(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}