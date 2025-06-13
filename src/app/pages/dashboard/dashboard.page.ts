import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { ActionCardsComponent } from './components/action-cards/action-cards.component';
import { RecentActivitiesComponent } from './components/recent-activities/recent-activities.component';
import { QuickAccessComponent } from './components/quick-access/quick-access.component';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatsCardsComponent,
    ActionCardsComponent,
    RecentActivitiesComponent,
    QuickAccessComponent
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css']
})
export class DashboardPage {
  userName: string = 'Administrador';

  // Tarjetas principales de acciones
  dashboardCards: DashboardCard[] = [
    {
      title: 'Cobros',
      description: 'Gestión de cobros y facturación',
      icon: 'fa-dollar-sign',
      route: '/dashboard/cobros',
      color: 'primary'
    },
    {
      title: 'Clubes',
      description: 'Administrar clubes registrados',
      icon: 'fa-building',
      route: '/dashboard/clubes',
      color: 'success'
    },
    {
      title: 'Comprobantes',
      description: 'Registro y consulta de comprobantes',
      icon: 'fa-file-invoice',
      route: '/dashboard/comprobantes',
      color: 'info'
    },
    {
      title: 'Reportes',
      description: 'Generar informes de cobros',
      icon: 'fa-chart-bar',
      route: '/dashboard/reportes',
      color: 'warning'
    }
  ];

  // Actividades recientes (datos de ejemplo para el dashboard)
  recentActivities = [
    { action: 'Cobro registrado', club: 'Club Atlético', amount: 15000, date: '2023-06-15' },
    { action: 'Comprobante emitido', club: 'Deportivo Jujuy', amount: 22000, date: '2023-06-14' },
    { action: 'Cobro vencido', club: 'Universitario', amount: 18000, date: '2023-06-10' },
    { action: 'Nuevo club registrado', club: 'Villa San Martín', amount: null, date: '2023-06-08' }
  ];

  // Estadísticas de cobros (datos de ejemplo)
  statistics = {
    totalCobros: 45,
    cobrosPendientes: 12,
    cobrosVencidos: 5,
    totalRecaudado: 850000
  };
}
