import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then(m => m.AuthPage),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'dashboard/cobros',
    loadComponent: () => import('./pages/dashboard/cobros/lista-cobros/lista-cobros.page').then(m => m.ListaCobrosPage),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'dashboard/cobros/nuevo',
    loadComponent: () => import('./pages/dashboard/cobros/nuevo-cobro/nuevo-cobro.page').then(m => m.NuevoCobroPage),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'dashboard/cobros/detalle/:id',
    loadComponent: () => import('./pages/dashboard/cobros/detalle-cobro/detalle-cobro.page').then(m => m.DetalleCobroPage),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'dashboard/cobros/factura/:id',
    loadComponent: () => import('./pages/dashboard/cobros/factura/factura.page').then(m => m.FacturaPage),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
  path: 'afiliados',
  loadComponent: () => import('./pages/afiliados/afiliados.component').then(m => m.AfiliadosComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.page').then(m => m.UnauthorizedPage)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
