import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, map, of, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Verificar si hay un token
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
      return false;
    }

    // Verificar si el token es válido
    return this.authService.checkToken().pipe(
      map(isValid => {
        if (isValid) {
          // Verificar roles si están definidos en la ruta
          const requiredRoles = route.data['roles'] as Array<string>;

          if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = this.authService.hasRole(requiredRoles);
            if (!hasRole) {
              this.router.navigate(['/unauthorized']);
              return false;
            }
          }

          return true;
        } else {
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
        return of(false);
      })
    );
  }
}
