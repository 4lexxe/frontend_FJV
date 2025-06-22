import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { Club } from '../interfaces/club.interface';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private apiUrl = 'http://localhost:3000/api/clubs'; 

  constructor(private http: HttpClient) { }

  obtenerClubes(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl);
  }

  obtenerClubPorId(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.apiUrl}/${id}`);
  }

  agregarClub(club: Club): Observable<Club> {
   
    const { idClub, createdAt, updatedAt, ...clubParaBackend } = club;
    
    return this.http.post<Club>(this.apiUrl, clubParaBackend);
  }

  actualizarClub(id: number, club: Club): Observable<Club> {
   
    const { createdAt, updatedAt, ...clubParaBackend } = club;

    return this.http.put<Club>(`${this.apiUrl}/${id}`, clubParaBackend);
  }

  eliminarClub(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}