import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsCardsComponent } from '../components/stats-cards/stats-cards.component';
import { ActionCardsComponent } from '../components/action-cards/action-cards.component';
import { RecentActivitiesComponent } from '../components/recent-activities/recent-activities.component';
import { QuickAccessComponent } from '../components/quick-access/quick-access.component';
import { AfiliadoService } from '../../../services/afiliado.service';
import { CobroService, DashboardStats, PaymentMetrics } from '../../../services/cobro.service';
import { forkJoin } from 'rxjs';
import { MetricsComponent } from '../components/metrics/metrics/metrics.component';
import { PaymentMetricsComponent } from '../components/payment-metrics/payment-metrics.component';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatsCardsComponent,
    ActionCardsComponent,
    RecentActivitiesComponent,
    QuickAccessComponent,
    MetricsComponent,
    PaymentMetricsComponent,
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  userName: string = 'Administrador';

  // Tarjetas principales de acciones
  dashboardCards: DashboardCard[] = [
    {
      title: 'Cobros',
      description: 'Gestión de cobros y facturación',
      icon: 'fa-dollar-sign',
      route: '/dashboard/cobros',
      color: 'primary',
    },
    {
      title: 'Clubes',
      description: 'Administrar clubes registrados',
      icon: 'fa-building',
      route: '/clubs',
      color: 'success',
    },
    {
      title: 'Afiliados',
      description: 'Gestión de afiliados',
      icon: 'fa-users',
      route: '/afiliados',
      color: 'info',
    },
    {
      title: 'Noticias',
      description: 'Administrar noticias del sitio',
      icon: 'fa-newspaper',
      route: '/admin/noticias',
      color: 'warning',
    },
  ];

  // Actividades recientes (datos de ejemplo para el dashboard)
  recentActivities = [
    {
      action: 'Cobro registrado',
      club: 'Club Atlético',
      amount: 15000,
      date: '2023-06-15',
    },
    {
      action: 'Comprobante emitido',
      club: 'Deportivo Jujuy',
      amount: 22000,
      date: '2023-06-14',
    },
    {
      action: 'Cobro vencido',
      club: 'Universitario',
      amount: 18000,
      date: '2023-06-10',
    },
    {
      action: 'Nuevo club registrado',
      club: 'Villa San Martín',
      amount: null,
      date: '2023-06-08',
    },
  ];

  // Estadísticas de cobros - Inicializar con valores por defecto
  statistics: DashboardStats = {
    totalCobros: 0,
    cobrosPendientes: 0,
    cobrosVencidos: 0,
    totalRecaudado: 0,
  };

  metricas: any = null;
  loading: boolean = true;
  loadingStats: boolean = true;

  // Métricas de pagos
  paymentMetrics: PaymentMetrics | null = null;
  loadingPaymentMetrics: boolean = true;

  constructor(
    private afiliadoService: AfiliadoService,
    private cobroService: CobroService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Carga todos los datos del dashboard
   */
  private loadDashboardData(): void {
    this.loading = true;
    this.loadingStats = true;
    this.loadingPaymentMetrics = true;

    // Cargar estadísticas de cobros, métricas de afiliados y métricas de pagos en paralelo
    forkJoin({
      // Estadísticas de cobros
      cobroStats: this.cobroService.getDashboardStats(),

      // Métricas de afiliados (existentes)
      resumenTotales: this.afiliadoService.getResumenTotales(),
      tipos: this.afiliadoService.getTipo(),
      afiliadosPorClub: this.afiliadoService.getAfiliadosPorClub(),

      // Métricas de pagos (NUEVO)
      paymentMetrics: this.cobroService.getPaymentMetrics(),
    }).subscribe({
      next: (data) => {
        // Actualizar estadísticas de cobros
        if (data.cobroStats) {
          this.statistics = data.cobroStats;
          console.log('✅ Estadísticas de cobros cargadas:', this.statistics);
        }

        // Actualizar métricas de afiliados
        this.metricas = {
          resumenTotales: data.resumenTotales,
          tipos: data.tipos,
          afiliadosPorClub: data.afiliadosPorClub
        };

        // Actualizar métricas de pagos
        if (data.paymentMetrics) {
          this.paymentMetrics = data.paymentMetrics;
          console.log('✅ Métricas de pagos cargadas:', this.paymentMetrics);
        }

        this.loading = false;
        this.loadingStats = false;
        this.loadingPaymentMetrics = false;

        console.log('✅ Dashboard cargado completamente');
      },
      error: (err) => {
        console.error('❌ Error al cargar datos del dashboard:', err);

        // En caso de error, mantener valores por defecto
        this.loading = false;
        this.loadingStats = false;
        this.loadingPaymentMetrics = false;

        // Mostrar mensaje de fallback
        console.log('📊 Usando datos por defecto para el dashboard');
      },
    });
  }

  /**
   * Recargar todos los datos del dashboard
   */
  refreshCobroStats(): void {
    this.loadingStats = true;
    this.loadingPaymentMetrics = true;

    // Cargar estadísticas y métricas en paralelo
    forkJoin({
      cobroStats: this.cobroService.getDashboardStats(),
      paymentMetrics: this.cobroService.getPaymentMetrics()
    }).subscribe({
      next: (data) => {
        // Actualizar estadísticas
        if (data.cobroStats) {
          this.statistics = data.cobroStats;
        }

        // Actualizar métricas de pagos
        if (data.paymentMetrics) {
          this.paymentMetrics = data.paymentMetrics;
        }

        this.loadingStats = false;
        this.loadingPaymentMetrics = false;
        console.log('🔄 Datos del dashboard actualizados');
      },
      error: (err) => {
        console.error('❌ Error al actualizar datos del dashboard:', err);
        this.loadingStats = false;
        this.loadingPaymentMetrics = false;
      }
    });
  }

  /**
   * Obtener estadísticas por rango de fechas
   */
  getStatsByDateRange(fechaDesde: string, fechaHasta: string): void {
    this.loadingStats = true;

    this.cobroService.getStatsByDateRange(fechaDesde, fechaHasta).subscribe({
      next: (stats) => {
        if (stats) {
          this.statistics = {
            totalCobros: stats.totalCobros || 0,
            cobrosPendientes: stats.cobrosPendientes || 0,
            cobrosVencidos: stats.cobrosVencidos || 0,
            totalRecaudado: stats.totalRecaudado || 0
          };
        }
        this.loadingStats = false;
        console.log('📅 Estadísticas por rango cargadas:', stats);
      },
      error: (err) => {
        console.error('❌ Error al cargar estadísticas por rango:', err);
        this.loadingStats = false;
      }
    });
  }

  /**
   * Recargar solo las métricas de pagos
   */
  refreshPaymentMetrics(): void {
    this.loadingPaymentMetrics = true;

    this.cobroService.getPaymentMetrics().subscribe({
      next: (metrics) => {
        this.paymentMetrics = metrics;
        this.loadingPaymentMetrics = false;
        console.log('🔄 Métricas de pagos actualizadas:', metrics);
      },
      error: (err) => {
        console.error('❌ Error al actualizar métricas de pagos:', err);
        this.loadingPaymentMetrics = false;
      }
    });
  }

  /**
   * Obtener métricas de pagos por rango de fechas
   */
  getPaymentMetricsByDateRange(fechaDesde: string, fechaHasta: string): void {
    this.loadingPaymentMetrics = true;

    this.cobroService.getPaymentMetricsByDateRange(fechaDesde, fechaHasta).subscribe({
      next: (metrics) => {
        if (metrics) {
          this.paymentMetrics = metrics;
        }
        this.loadingPaymentMetrics = false;
        console.log('📅 Métricas de pagos por rango cargadas:', metrics);
      },
      error: (err) => {
        console.error('❌ Error al cargar métricas por rango:', err);
        this.loadingPaymentMetrics = false;
      }
    });
  }
}
