import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsCardsComponent } from '../components/stats-cards/stats-cards.component';
import { ActionCardsComponent } from '../components/action-cards/action-cards.component';
import { RecentActivitiesComponent } from '../components/recent-activities/recent-activities.component';
import { QuickAccessComponent } from '../components/quick-access/quick-access.component';
import { AfiliadoService } from '../../../services/afiliado.service';
import { forkJoin } from 'rxjs';
import { MetricsComponent } from '../components/metrics/metrics/metrics.component';

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

  // Estadísticas de cobros (datos de ejemplo)
  statistics = {
    totalCobros: 45,
    cobrosPendientes: 12,
    cobrosVencidos: 5,
    totalRecaudado: 850000,
  };

  metricas: any = null;
  loading: boolean = true;

  constructor(private afiliadoService: AfiliadoService) {}

  ngOnInit(): void {
    this.loading = true;

    forkJoin({
      resumenTotales: this.afiliadoService.getResumenTotales(),
      tipos: this.afiliadoService.getTipo(),
      afiliadosPorClub: this.afiliadoService.getAfiliadosPorClub(),
    }).subscribe({
      next: (data) => {
        this.metricas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar métricas:', err);
        this.loading = false;
      },
    });
  }
}
