import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { AuthPage } from './pages/auth/auth.page';
import { LoginPage } from './pages/auth/login/login.page';
import { SignupPage } from './pages/auth/signup/signup.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'auth',
    component: AuthPage,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginPage
      },
      {
        path: 'registro',
        component: SignupPage
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
