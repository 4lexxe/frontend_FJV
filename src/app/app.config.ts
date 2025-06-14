import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { routes } from './app.routes';
import { catchError, throwError } from 'rxjs';

// Creamos un interceptor más simple que no cause dependencias circulares
function authInterceptor(req: any, next: any) {
  // Obtenemos el token del localStorage directamente en lugar de usar el servicio
  const token = localStorage.getItem('auth_token');

  // Si hay token, añadirlo a los headers
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: any) => {
      // Si recibimos un 401 o 403, redirigimos al login
      if (error.status === 401 || error.status === 403) {
        const router = inject(Router);
        // Limpiamos el localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // Redirigimos al login
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url }
        });
      }
      return throwError(() => error);
    })
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
