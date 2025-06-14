import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Cobro {
  idCobro?: number;  // Actualizado para coincidir con el backend
  concepto: string;
  monto: number;
  fechaCobro?: string;  // Actualizado a fechaCobro
  fechaVencimiento?: string;
  estado: 'Pendiente' | 'Pagado' | 'Vencido' | 'Anulado';  // Actualizado según los estados definidos
  tipoComprobante?: string;
  idClub: number;
  idEquipo?: number;
  comprobantePago?: string;
  observaciones?: string;
  club?: {
    idClub: number;
    nombre: string;
  };
  equipo?: {
    idEquipo: number;
    nombre: string;
  };
}

export interface CobroResponse {
  status?: string;
  msg?: string;
  error?: string;
  cobro?: Cobro;
}

export interface CobroFilter {
  idClub?: number;
  idEquipo?: number;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CobroService {
  private readonly API_URL = `${environment.apiUrl}/cobros`;

  constructor(private http: HttpClient) { }

  // Obtener todos los cobros
  getCobros(): Observable<Cobro[]> {
    return this.http.get<Cobro[]>(this.API_URL).pipe(
      catchError(this.handleError<Cobro[]>('getCobros', []))
    );
  }

  // Filtrar cobros según criterios
  filterCobros(filters: CobroFilter): Observable<Cobro[]> {
    let params = new HttpParams();

    if (filters.idClub) params = params.set('idClub', filters.idClub.toString());
    if (filters.idEquipo) params = params.set('idEquipo', filters.idEquipo.toString());
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);

    return this.http.get<Cobro[]>(`${this.API_URL}/filter`, { params }).pipe(
      catchError(this.handleError<Cobro[]>('filterCobros', []))
    );
  }

  // Obtener cobros de un club específico
  getCobrosByClub(idClub: number): Observable<Cobro[]> {
    return this.http.get<Cobro[]>(`${this.API_URL}/club/${idClub}`).pipe(
      catchError(this.handleError<Cobro[]>(`getCobrosByClub id=${idClub}`, []))
    );
  }

  // Obtener cobros de un equipo específico
  getCobrosByEquipo(idEquipo: number): Observable<Cobro[]> {
    return this.http.get<Cobro[]>(`${this.API_URL}/equipo/${idEquipo}`).pipe(
      catchError(this.handleError<Cobro[]>(`getCobrosByEquipo id=${idEquipo}`, []))
    );
  }

  // Obtener un cobro por ID
  getCobro(id: number): Observable<Cobro> {
    return this.http.get<Cobro>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError<Cobro>(`getCobro id=${id}`))
    );
  }

  // Crear un nuevo cobro
  createCobro(cobro: Cobro): Observable<CobroResponse> {
    return this.http.post<CobroResponse>(this.API_URL, cobro).pipe(
      catchError(this.handleError<CobroResponse>('createCobro'))
    );
  }

  // Actualizar un cobro existente
  updateCobro(id: number, cobro: Cobro): Observable<CobroResponse> {
    return this.http.put<CobroResponse>(`${this.API_URL}/${id}`, cobro).pipe(
      catchError(this.handleError<CobroResponse>(`updateCobro id=${id}`))
    );
  }

  // Cambiar el estado de un cobro (ej: marcar como pagado)
  cambiarEstadoCobro(id: number, estado: string, comprobantePago?: string, observaciones?: string): Observable<CobroResponse> {
    const data = {
      estado,
      comprobantePago,
      observaciones
    };

    return this.http.patch<CobroResponse>(`${this.API_URL}/${id}/estado`, data).pipe(
      catchError(this.handleError<CobroResponse>(`cambiarEstadoCobro id=${id}`))
    );
  }

  // Eliminar un cobro
  deleteCobro(id: number): Observable<CobroResponse> {
    return this.http.delete<CobroResponse>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError<CobroResponse>(`deleteCobro id=${id}`))
    );
  }

  // Método para simulación mientras el backend está en desarrollo
  simulateGetCobrosByClub(idClub: number): Observable<Cobro[]> {
    console.log('Usando datos simulados para cobros del club:', idClub);
    const cobrosDePrueba: Cobro[] = [
      {
        idCobro: 1,
        monto: 5000,
        fechaCobro: new Date().toISOString().substring(0, 10),
        concepto: 'Cuota mensual',
        idClub: idClub,
        estado: 'Pendiente',
        fechaVencimiento: new Date(Date.now() + 30*24*60*60*1000).toISOString().substring(0, 10),
        tipoComprobante: 'FACTURA_A',
        club: { idClub, nombre: 'Club #' + idClub }
      },
      {
        idCobro: 2,
        monto: 7500,
        fechaCobro: new Date(Date.now() - 15*24*60*60*1000).toISOString().substring(0, 10),
        concepto: 'Inscripción torneo',
        idClub: idClub,
        estado: 'Pagado',
        fechaVencimiento: new Date(Date.now() + 15*24*60*60*1000).toISOString().substring(0, 10),
        tipoComprobante: 'FACTURA_B',
        club: { idClub, nombre: 'Club #' + idClub }
      }
    ];
    return of(cobrosDePrueba).pipe(
      delay(800) // simular delay de red
    );
  }

  // Método para simulación de crear cobro
  simulateCreateCobro(cobro: Cobro): Observable<Cobro> {
    console.log('Usando simulación para crear cobro:', cobro);
    const nuevoCobro = {
      ...cobro,
      idCobro: Math.floor(Math.random() * 1000) + 10,
      fechaCobro: new Date().toISOString().substring(0, 10),
      club: { idClub: cobro.idClub, nombre: 'Club Simulado' }
    };
    return of(nuevoCobro).pipe(
      delay(1200) // simular delay de red
    );
  }

  /**
   * Maneja los errores HTTP
   * @param operationName - nombre de la operación que falló
   * @param result - valor opcional a devolver como observable
   */
  private handleError<T>(operationName = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operationName} falló:`, error);
      console.log(`${operationName} error completo:`, error);

      // Devuelve un resultado vacío para que la aplicación siga funcionando
      return of(result as T);
    };
  }
}
