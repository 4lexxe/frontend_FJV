import { Routes } from '@angular/router';

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
      },
      {
        path: 'registro',
        loadComponent: () => import('./pages/auth/signup/signup.page').then(m => m.SignupPage)
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: []
  },
  {
    path: 'dashboard/cobros',
    loadComponent: () => import('./pages/dashboard/cobros/lista-cobros/lista-cobros.page').then(m => m.ListaCobrosPage),
    canActivate: []
  },
  {
    path: 'dashboard/cobros/nuevo',
    loadComponent: () => import('./pages/dashboard/cobros/nuevo-cobro/nuevo-cobro.page').then(m => m.NuevoCobroPage),
    canActivate: []
  },
  {
    path: 'dashboard/cobros/detalle/:id',
    loadComponent: () => import('./pages/dashboard/cobros/detalle-cobro/detalle-cobro.page').then(m => m.DetalleCobroPage),
    canActivate: []
  },
  {
    path: 'dashboard/cobros/factura/:id',
    loadComponent: () => import('./pages/dashboard/cobros/factura/factura.page').then(m => m.FacturaPage),
    canActivate: []
  },
  {
    path: '**',
    redirectTo: ''
  }
];
