import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

// Rutas para noticias
export const noticiasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/noticias/lista-noticias/lista-noticias.component')
      .then(m => m.ListaNoticiasComponent)
  },
  {
    path: 'ver/:id',
    loadComponent: () => import('./components/noticias/detalle-noticia/detalle-noticia.component')
      .then(m => m.DetalleNoticiaComponent)
  },
  {
    path: ':categoria/:slug',
    loadComponent: () => import('./components/noticias/detalle-noticia/detalle-noticia.component')
      .then(m => m.DetalleNoticiaComponent)
  }
];

// Rutas de administración de noticias - volver a la estructura anterior
export const adminNoticiasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/noticias/admin/dashboard-noticias/dashboard-noticias.component')
      .then(m => m.DashboardNoticiasComponent)
  },
  {
    path: 'listado',
    loadComponent: () => import('./components/noticias/admin/lista-noticias-admin/lista-noticias-admin.component')
      .then(m => m.ListaNoticiasAdminComponent)
  },
  {
    path: 'nueva',
    loadComponent: () => import('./components/noticias/editor-noticia/editor-noticia.component')
      .then(m => m.EditorNoticiaComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./components/noticias/editor-noticia/editor-noticia.component')
      .then(m => m.EditorNoticiaComponent)
  }
];

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
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/dashboard/dashboard-home/dashboard-home.component')
          .then(m => m.DashboardHomeComponent)
      },
      {
        path: 'cobros',
        loadComponent: () => import('./pages/dashboard/cobros/lista-cobros/lista-cobros.page').then(m => m.ListaCobrosPage)
      },
      {
        path: 'cobros/nuevo',
        loadComponent: () => import('./pages/dashboard/cobros/nuevo-cobro/nuevo-cobro.page').then(m => m.NuevoCobroPage)
      },
      {
        path: 'cobros/detalle/:id',
        loadComponent: () => import('./pages/dashboard/cobros/detalle-cobro/detalle-cobro.page').then(m => m.DetalleCobroPage)
      },
      {
        path: 'cobros/factura/:id',
        loadComponent: () => import('./pages/dashboard/cobros/factura/factura.page').then(m => m.FacturaPage)
      }
    ]
  },
  {
    path: 'admin/noticias',
    loadChildren: () => Promise.resolve(adminNoticiasRoutes),
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'clubs',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'listado', pathMatch: 'full' },
      {
        path: 'listado',
        loadComponent: () => import('./pages/clubs/clubs.component').then(m => m.ClubsComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/clubs/nuevo-club/nuevo-club.page').then(m => m.NuevoClubPage)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./pages/clubs/nuevo-club/nuevo-club.page').then(m => m.NuevoClubPage)
      }
    ]
  },
  {
    path: 'afiliados',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'listado', pathMatch: 'full' },
      {
        path: 'listado',
        loadComponent: () => import('./pages/afiliados/afiliados.component').then(m => m.AfiliadosComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/afiliados/nuevo-afiliado/nuevo-afiliado.page').then(m => m.NuevoAfiliadoPage)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./pages/afiliados/nuevo-afiliado/nuevo-afiliado.page').then(m => m.NuevoAfiliadoPage)
      },
      {
        path: 'detalle/:id',
        loadComponent: () => import('./pages/afiliados/components/detalle-afiliado/detalle-afiliado.component').then(m => m.DetalleAfiliadoComponent)
      }
    ]
  },
  {
    path: 'noticias',
    loadChildren: () => Promise.resolve(noticiasRoutes)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.page').then(m => m.UnauthorizedPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
