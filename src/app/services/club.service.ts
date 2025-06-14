import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Club {
  idClub?: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  email: string;
  cuit: string;
  fechaAfiliacion: string;
  estadoAfiliacion: string;
  createdAt?: string;
  updatedAt?: string;
  personas?: any[];
  equipos?: any[];
}

export interface ClubResponse {
  status: string;
  msg: string;
  club?: Club;
}

export interface ClubFilter {
  nombre?: string;
  cuit?: string;
  estadoAfiliacion?: string;
  fechaAfiliacionDesde?: string;
  fechaAfiliacionHasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private readonly API_URL = `${environment.apiUrl}/clubs`;

  constructor(private http: HttpClient) { }

  // Obtener todos los clubes
  getClubes(): Observable<Club[]> {
    return this.http.get<Club[]>(this.API_URL);
  }

  // Obtener un club por ID
  getClub(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.API_URL}/${id}`);
  }

  // Crear un nuevo club
  createClub(club: Club): Observable<ClubResponse> {
    return this.http.post<ClubResponse>(this.API_URL, club);
  }

  // Actualizar un club existente
  updateClub(id: number, club: Club): Observable<ClubResponse> {
    return this.http.put<ClubResponse>(`${this.API_URL}/${id}`, club);
  }

  // Eliminar un club
  deleteClub(id: number): Observable<ClubResponse> {
    return this.http.delete<ClubResponse>(`${this.API_URL}/${id}`);
  }

  // Filtrar clubes
  filterClubes(filters: ClubFilter): Observable<Club[]> {
    let params = new HttpParams();

    if (filters.nombre) params = params.set('nombre', filters.nombre);
    if (filters.cuit) params = params.set('cuit', filters.cuit);
    if (filters.estadoAfiliacion) params = params.set('estadoAfiliacion', filters.estadoAfiliacion);
    if (filters.fechaAfiliacionDesde) params = params.set('fechaAfiliacionDesde', filters.fechaAfiliacionDesde);
    if (filters.fechaAfiliacionHasta) params = params.set('fechaAfiliacionHasta', filters.fechaAfiliacionHasta);

    return this.http.get<Club[]>(`${this.API_URL}/filter`, { params });
  }
}
