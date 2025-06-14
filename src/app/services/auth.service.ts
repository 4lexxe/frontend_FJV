import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rolId: number;
  rol: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  fotoPerfil?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  usuario: User;
  token: string;
}

export interface TokenValidationResponse {
  success: boolean;
  message: string;
  user: User;
  token?: string; // Añadimos el token como propiedad opcional
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly TOKEN_EXPIRATION_KEY = 'auth_token_expiration';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      const expirationStr = localStorage.getItem(this.TOKEN_EXPIRATION_KEY);

      if (token && userStr) {
        // Verificar si el token ha expirado
        if (expirationStr) {
          const expiration = new Date(expirationStr);
          if (expiration <= new Date()) {
            // Token expirado, limpiamos y salimos
            console.log('Token expirado localmente, cerrando sesión');
            this.clearAuthData();
            return;
          }
        }

        // Si el token no ha expirado localmente, restauramos el estado
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        // Validamos el token con el servidor
        this.validateToken().subscribe({
          error: (err) => {
            console.error('Error validando token:', err);
            this.clearAuthData();
          }
        });
      }
    } catch (error) {
      console.error('Error cargando datos de usuario desde localStorage', error);
      this.clearAuthData();
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRATION_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.storeAuthData(response.token, response.usuario);
            this.currentUserSubject.next(response.usuario);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        map(response => response.usuario),
        catchError(error => {
          console.error('Error en el login', error);
          return throwError(() => new Error(
            error.error?.message || 'Error al iniciar sesión'
          ));
        })
      );
  }

  private storeAuthData(token: string, user: User): void {
    // Almacenar el token y el usuario
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // Calcular y almacenar la fecha de expiración (ejemplo: 1 hora)
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    localStorage.setItem(this.TOKEN_EXPIRATION_KEY, expirationDate.toISOString());
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar expiración local
    const expirationStr = localStorage.getItem(this.TOKEN_EXPIRATION_KEY);
    if (expirationStr) {
      const expiration = new Date(expirationStr);
      if (expiration <= new Date()) {
        this.clearAuthData();
        return false;
      }
    }

    return true;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.clearAuthData();
      return of(false);
    }

    return this.http.get<TokenValidationResponse>(`${this.API_URL}/auth/validate-token`)
      .pipe(
        tap(response => {
          if (response.success) {
            // Actualizar el usuario y renovar el token (si el backend lo proporciona)
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);

            // Si la respuesta incluye un nuevo token, actualizar
            if (response.token) {
              this.storeAuthData(response.token, response.user);
            } else {
              // Si no hay nuevo token, solo actualizamos el usuario
              localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
            }
          } else {
            this.clearAuthData();
          }
        }),
        map(response => response.success),
        catchError(error => {
          console.error('Token inválido o expirado', error);
          this.clearAuthData();
          return of(false);
        })
      );
  }

  checkToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.get<{valid: boolean, message: string, token?: string}>(`${this.API_URL}/auth/check-token`)
      .pipe(
        tap(response => {
          // Si la respuesta incluye un nuevo token, actualizar
          if (response.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);

            // Actualizar la expiración
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 1);
            localStorage.setItem(this.TOKEN_EXPIRATION_KEY, expirationDate.toISOString());
          }
        }),
        map(response => response.valid),
        catchError(() => {
          this.clearAuthData();
          return of(false);
        })
      );
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.rol) return false;
    return roles.includes(user.rol.nombre);
  }
}
