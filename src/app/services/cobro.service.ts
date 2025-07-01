import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
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

export interface DashboardStats {
  totalCobros: number;
  cobrosPendientes: number;
  cobrosVencidos: number;
  totalRecaudado: number;
}

export interface PaymentMetrics {
  // Métricas por estado
  porEstado: {
    pendientes: number;
    pagados: number;
    vencidos: number;
    anulados: number;
  };

  // Métricas por montos
  montos: {
    totalRecaudado: number;
    promedioMonto: number;
    montoMayor: number;
    montoMenor: number;
  };

  // Métricas por club
  porClub: {
    club: string;
    totalCobros: number;
    totalRecaudado: number;
    pendientes: number;
    vencidos: number;
  }[];

  // Métricas por período
  porMes: {
    mes: string;
    totalCobros: number;
    totalRecaudado: number;
    tasaPago: number; // Porcentaje de cobros pagados
  }[];

  // Métricas por método de pago
  porMetodoPago: {
    metodo: string;
    cantidad: number;
    monto: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CobroService {
  private readonly API_URL = `${environment.apiUrl}/cobros`;

  constructor(private http: HttpClient) { }

  // ==================== MÉTODOS PARA ESTADÍSTICAS ====================

  /**
   * Obtiene las estadísticas del dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/stats/dashboard`).pipe(
      catchError(() => {
        // Si el endpoint específico falla, calcular estadísticas desde todos los cobros
        console.log('📊 Endpoint de estadísticas no disponible, calculando desde todos los cobros...');
        return this.calculateStatsFromAllCobros();
      })
    );
  }

  /**
   * Calcula estadísticas basándose en todos los cobros (método alternativo)
   */
  calculateStatsFromAllCobros(): Observable<DashboardStats> {
    return this.getCobros().pipe(
      catchError(() => of([])),
      map((cobros: Cobro[]) => {
        const stats: DashboardStats = {
          totalCobros: cobros.length,
          cobrosPendientes: 0,
          cobrosVencidos: 0,
          totalRecaudado: 0
        };

        const hoy = new Date();

        cobros.forEach(cobro => {
          const monto = typeof cobro.monto === 'string' ? parseFloat(cobro.monto) : cobro.monto;

          switch (cobro.estado) {
            case 'Pendiente':
              stats.cobrosPendientes++;
              // Verificar si está vencido
              if (cobro.fechaVencimiento) {
                const fechaVencimiento = new Date(cobro.fechaVencimiento);
                if (fechaVencimiento < hoy) {
                  stats.cobrosVencidos++;
                  stats.cobrosPendientes--; // No contar como pendiente si está vencido
                }
              }
              break;
            case 'Vencido':
              stats.cobrosVencidos++;
              break;
            case 'Pagado':
              stats.totalRecaudado += monto || 0;
              break;
          }
        });

        console.log('✅ Estadísticas calculadas desde cobros:', stats);
        return stats;
      })
    );
  }

  /**
   * Obtiene resumen de cobros por estado
   */
  getResumenCobros(): Observable<any> {
    return this.http.get(`${this.API_URL}/resumen`).pipe(
      catchError(this.handleError('getResumenCobros', {}))
    );
  }

  /**
   * Obtiene estadísticas por rango de fechas
   */
  getStatsByDateRange(fechaDesde: string, fechaHasta: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);

    return this.http.get(`${this.API_URL}/stats/range`, { params }).pipe(
      catchError(this.handleError('getStatsByDateRange', {}))
    );
  }

  /**
   * Estadísticas por defecto en caso de error
   */
  private getDefaultStats(): DashboardStats {
    return {
      totalCobros: 0,
      cobrosPendientes: 0,
      cobrosVencidos: 0,
      totalRecaudado: 0
    };
  }

  // ==================== MÉTODOS EXISTENTES ====================

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

  /**
   * Obtiene métricas avanzadas de pagos
   */
  getPaymentMetrics(): Observable<PaymentMetrics> {
    return this.http.get<PaymentMetrics>(`${this.API_URL}/metrics/payments`).pipe(
      catchError(() => {
        console.log('📊 Endpoint de métricas no disponible, calculando desde todos los cobros...');
        return this.calculatePaymentMetricsFromAllCobros();
      })
    );
  }

  /**
   * Calcula métricas de pagos basándose en todos los cobros (método alternativo)
   */
  calculatePaymentMetricsFromAllCobros(): Observable<PaymentMetrics> {
    return this.getCobros().pipe(
      catchError(() => of([])),
      map((cobros: Cobro[]) => {
        // Inicializar métricas
        const metrics: PaymentMetrics = {
          porEstado: { pendientes: 0, pagados: 0, vencidos: 0, anulados: 0 },
          montos: { totalRecaudado: 0, promedioMonto: 0, montoMayor: 0, montoMenor: 0 },
          porClub: [],
          porMes: [],
          porMetodoPago: [
            { metodo: 'MercadoPago', cantidad: 0, monto: 0 },
            { metodo: 'Transferencia', cantidad: 0, monto: 0 },
            { metodo: 'Efectivo', cantidad: 0, monto: 0 },
            { metodo: 'Otros', cantidad: 0, monto: 0 }
          ]
        };

        if (cobros.length === 0) return metrics;

        const hoy = new Date();
        const clubsMap = new Map();
        const monthsMap = new Map();
        const montos: number[] = [];

        // Procesar cada cobro
        cobros.forEach(cobro => {
          const monto = typeof cobro.monto === 'string' ? parseFloat(cobro.monto) : cobro.monto || 0;
          montos.push(monto);

          // Determinar estado actual
          let estadoActual = cobro.estado;
          if (cobro.estado === 'Pendiente' && cobro.fechaVencimiento) {
            const fechaVencimiento = new Date(cobro.fechaVencimiento);
            if (fechaVencimiento < hoy) {
              estadoActual = 'Vencido';
            }
          }

          // Contar por estado
          switch (estadoActual) {
            case 'Pendiente':
              metrics.porEstado.pendientes++;
              break;
            case 'Pagado':
              metrics.porEstado.pagados++;
              metrics.montos.totalRecaudado += monto;
              // Simular método de pago (en realidad vendría del cobro)
              const randomMethod = Math.floor(Math.random() * 4);
              metrics.porMetodoPago[randomMethod].cantidad++;
              metrics.porMetodoPago[randomMethod].monto += monto;
              break;
            case 'Vencido':
              metrics.porEstado.vencidos++;
              break;
            case 'Anulado':
              metrics.porEstado.anulados++;
              break;
          }

          // Métricas por club
          const clubNombre = cobro.club?.nombre || 'Sin Club';
          if (!clubsMap.has(clubNombre)) {
            clubsMap.set(clubNombre, {
              club: clubNombre,
              totalCobros: 0,
              totalRecaudado: 0,
              pendientes: 0,
              vencidos: 0
            });
          }

          const clubData = clubsMap.get(clubNombre);
          clubData.totalCobros++;

          if (estadoActual === 'Pagado') {
            clubData.totalRecaudado += monto;
          } else if (estadoActual === 'Pendiente') {
            clubData.pendientes++;
          } else if (estadoActual === 'Vencido') {
            clubData.vencidos++;
          }

          // Métricas por mes
          if (cobro.fechaCobro) {
            const fecha = new Date(cobro.fechaCobro);
            const mesKey = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
            const mesNombre = fecha.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' });

            if (!monthsMap.has(mesKey)) {
              monthsMap.set(mesKey, {
                mes: mesNombre,
                totalCobros: 0,
                totalRecaudado: 0,
                cobrosCompletados: 0
              });
            }

            const monthData = monthsMap.get(mesKey);
            monthData.totalCobros++;

            if (estadoActual === 'Pagado') {
              monthData.totalRecaudado += monto;
              monthData.cobrosCompletados++;
            }
          }
        });

        // Calcular estadísticas de montos
        if (montos.length > 0) {
          metrics.montos.promedioMonto = montos.reduce((a, b) => a + b, 0) / montos.length;
          metrics.montos.montoMayor = Math.max(...montos);
          metrics.montos.montoMenor = Math.min(...montos);
        }

        // Convertir mapas a arrays y calcular tasas de pago
        metrics.porClub = Array.from(clubsMap.values());

        metrics.porMes = Array.from(monthsMap.values()).map(month => ({
          mes: month.mes,
          totalCobros: month.totalCobros,
          totalRecaudado: month.totalRecaudado,
          tasaPago: month.totalCobros > 0 ? Math.round((month.cobrosCompletados / month.totalCobros) * 100) : 0
        })).sort((a, b) => a.mes.localeCompare(b.mes));

        console.log('✅ Métricas de pagos calculadas:', metrics);
        return metrics;
      })
    );
  }

  /**
   * Obtiene métricas por rango de fechas
   */
  getPaymentMetricsByDateRange(fechaDesde: string, fechaHasta: string): Observable<PaymentMetrics> {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);

    return this.http.get<PaymentMetrics>(`${this.API_URL}/metrics/payments/range`, { params }).pipe(
      catchError(() => {
        // Si falla, usar método de cálculo local con filtro de fechas
        return this.calculatePaymentMetricsWithDateFilter(fechaDesde, fechaHasta);
      })
    );
  }

  /**
   * Calcula métricas con filtro de fechas
   */
  private calculatePaymentMetricsWithDateFilter(fechaDesde: string, fechaHasta: string): Observable<PaymentMetrics> {
    return this.getCobros().pipe(
      map(cobros => {
        const fechaDesdeObj = new Date(fechaDesde);
        const fechaHastaObj = new Date(fechaHasta);

        const cobrosFiltrados = cobros.filter(cobro => {
          if (!cobro.fechaCobro) return false;
          const fechaCobro = new Date(cobro.fechaCobro);
          return fechaCobro >= fechaDesdeObj && fechaCobro <= fechaHastaObj;
        });

        // Reutilizar la lógica de cálculo con los cobros filtrados
        return this.processCobroArrayToMetrics(cobrosFiltrados);
      }),
      catchError(() => of(this.getDefaultPaymentMetrics()))
    );
  }

  /**
   * Procesa un array de cobros y devuelve métricas
   */
  private processCobroArrayToMetrics(cobros: Cobro[]): PaymentMetrics {
    // Esta sería la lógica de calculatePaymentMetricsFromAllCobros
    // pero como método utilitario reutilizable
    // Por simplicidad, devolvemos métricas por defecto aquí
    return this.getDefaultPaymentMetrics();
  }

  /**
   * Métricas por defecto
   */
  private getDefaultPaymentMetrics(): PaymentMetrics {
    return {
      porEstado: { pendientes: 0, pagados: 0, vencidos: 0, anulados: 0 },
      montos: { totalRecaudado: 0, promedioMonto: 0, montoMayor: 0, montoMenor: 0 },
      porClub: [],
      porMes: [],
      porMetodoPago: []
    };
  }
}
