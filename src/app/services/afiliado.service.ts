import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Afiliado } from '../interfaces/afiliado.interface';
import { Club } from '../interfaces/club.interface';

@Injectable({ providedIn: 'root' })
export class AfiliadoService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  obtenerAfiliados(): Observable<Afiliado[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/personas?includeClub=true`)
      .pipe(
        map((personas) => personas.map((p) => this.mapPersonaToAfiliado(p)))
      );
  }

  agregarAfiliado(afiliado: Afiliado): Observable<Afiliado> {
    const personaBackend = this.mapAfiliadoToPersona(afiliado);
    return this.http.post<any>(`${this.apiUrl}/personas`, personaBackend).pipe(
      map((response) => {
        const persona = response.persona || response.data || response;
        return this.mapPersonaToAfiliado(persona);
      }),
      catchError((error) => {
        console.error('Error en agregarAfiliado:', error);
        throw error;
      })
    );
  }

  actualizarAfiliado(
    idPersona: number,
    afiliado: Afiliado
  ): Observable<Afiliado> {
    const personaBackend = this.mapAfiliadoToPersona(afiliado);
    return this.http
      .put<any>(`${this.apiUrl}/personas/${idPersona}`, personaBackend)
      .pipe(
        map((response) => {
          const persona = response.persona || response.data || response;
          return this.mapPersonaToAfiliado(persona);
        }),
        catchError((error) => {
          console.error('Error en actualizarAfiliado:', error);
          throw error;
        })
      );
  }

  obtenerAfiliadoPorId(idPersona: number): Observable<Afiliado> {
    return this.http
      .get<any>(`${this.apiUrl}/personas/${idPersona}?includeClub=true`)
      .pipe(map((p) => this.mapPersonaToAfiliado(p)));
  }

  eliminarAfiliado(idPersona: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/personas/${idPersona}`);
  }

  renovarLicencia(idPersona: number): Observable<Afiliado> {
    return this.http
      .put<any>(`${this.apiUrl}/personas/${idPersona}/licencia/renovar`, {})
      .pipe(
        map((response) => {
          const persona = response.persona || response.data || response;
          return this.mapPersonaToAfiliado(persona);
        }),
        catchError((error) => {
          console.error('Error al renovar licencia:', error);
          throw error;
        })
      );
  }

  obtenerClubes(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.apiUrl}/clubs`);
  }

  subirFotoAfiliado(idPersona: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fotoPerfil', file);
    return this.http.put(`${this.apiUrl}/personas/${idPersona}`, formData);
  }

  crearAfiliadoConFoto(afiliado: Afiliado, file?: File): Observable<Afiliado> {
    if (file) {
      const formData = new FormData();
      const personaData = this.mapAfiliadoToPersona(afiliado);

      Object.keys(personaData).forEach((key) => {
        if (personaData[key] !== null && personaData[key] !== undefined) {
          formData.append(key, personaData[key]);
        }
      });

      formData.append('fotoPerfil', file);

      return this.http.post<any>(`${this.apiUrl}/personas`, formData).pipe(
        map((response) => {
          const persona = response.persona || response.data || response;
          return this.mapPersonaToAfiliado(persona);
        }),
        catchError((error) => {
          console.error('Error en crearAfiliadoConFoto:', error);
          throw error;
        })
      );
    } else {
      return this.agregarAfiliado(afiliado);
    }
  }

  actualizarAfiliadoConFoto(
    idPersona: number,
    afiliado: Afiliado,
    file?: File
  ): Observable<Afiliado> {
    if (file) {
      const formData = new FormData();
      const personaData = this.mapAfiliadoToPersona(afiliado);

      Object.keys(personaData).forEach((key) => {
        if (personaData[key] !== null && personaData[key] !== undefined) {
          formData.append(key, personaData[key]);
        }
      });

      formData.append('fotoPerfil', file);

      return this.http
        .put<any>(`${this.apiUrl}/personas/${idPersona}`, formData)
        .pipe(
          map((response) => {
            const persona = response.persona || response.data || response;
            return this.mapPersonaToAfiliado(persona);
          }),
          catchError((error) => {
            console.error('Error en actualizarAfiliadoConFoto:', error);
            throw error;
          })
        );
    } else {
      return this.actualizarAfiliado(idPersona, afiliado);
    }
  }

  obtenerFotoPerfil(idPersona: number): Observable<string> {
    return this.http.get<any>(`${this.apiUrl}/personas/${idPersona}/foto`).pipe(
      map((response) => {
        if (
          response.status === '1' &&
          response.foto &&
          response.foto.fotoPerfilUrl
        ) {
          return response.foto.fotoPerfilUrl;
        }
        return '';
      }),
      catchError((error) => {
        console.log('Error o no hay foto disponible:', error);
        return of('');
      })
    );
  }

  eliminarFotoPerfil(idPersona: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/personas/${idPersona}/foto`);
  }

  actualizarEstadosLicenciasAutomatico(): Observable<Afiliado[]> {
    return this.obtenerAfiliados().pipe(
      map((afiliados) => {
        const hoy = new Date();
        return afiliados.map((afiliado) => {
          if (
            afiliado.fechaLicenciaBaja &&
            afiliado.estadoLicencia !== 'SUSPENDIDO' &&
            afiliado.estadoLicencia !== 'INACTIVO'
          ) {
            const vencimiento = new Date(afiliado.fechaLicenciaBaja);
            if (vencimiento < hoy && afiliado.estadoLicencia === 'ACTIVO') {
              afiliado.estadoLicencia = 'VENCIDO';
            } else if (
              vencimiento >= hoy &&
              afiliado.estadoLicencia === 'VENCIDO'
            ) {
              afiliado.estadoLicencia = 'ACTIVO';
            }
          }
          return afiliado;
        });
      })
    );
  }

  actualizarEstadoLicencias(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/personas/licencias/actualizar`)
      .pipe(
        catchError((error) => {
          console.log('Error al actualizar estados con GET:', error);
          return this.http
            .post<any>(
              `${this.apiUrl}/personas/actualizar-estado-licencias`,
              {}
            )
            .pipe(
              catchError((postError) => {
                console.log('Error también con POST:', postError);
                return of({
                  success: false,
                  error: 'No se pudo actualizar estados',
                });
              })
            );
        })
      );
  }

  getResumenTotales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/personas/resumen`);
  }

  getTipo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personas/tipo`);
  }

  getAfiliadosPorClub(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personas/clubes`);
  }

  getAvatarUrl(afiliado: Afiliado): string {
    if (afiliado.foto) {
      if (
        afiliado.foto.startsWith('http') ||
        afiliado.foto.startsWith('data:')
      ) {
        return afiliado.foto;
      }
      return afiliado.foto;
    }
    return '';
  }

  getAvatarIcon(afiliado: Afiliado): any {
    if (afiliado && afiliado.avatar) {
      return afiliado.avatar;
    }
    return this.generateDefaultAvatar();
  }

  private mapAfiliadoToPersona(afiliado: Afiliado): any {
    const persona: any = {
      nombreApellido: afiliado.apellidoNombre,
      dni: afiliado.dni,
      fechaNacimiento: afiliado.fechaNacimiento,
      tipo: afiliado.tipo,
      categoria: afiliado.categoria,
      categoriaNivel: afiliado.categoriaNivel,
      clubActual: afiliado.club,
      paseClub: afiliado.clubDestino,
      otorgado: afiliado.otorgado || false,
      idClub: afiliado.idClub || null,
      licencia: afiliado.licencia,
      fechaLicencia: afiliado.fechaLicencia,
      fechaLicenciaBaja: afiliado.fechaLicenciaBaja,
      estadoLicencia: afiliado.estadoLicencia || 'ACTIVO',
      createdAt: afiliado.createdAt,
      updatedAt: afiliado.updatedAt,
      foto: afiliado.foto,
      avatar: afiliado.avatar ? JSON.stringify(afiliado.avatar) : null,
    };

    Object.keys(persona).forEach((key) => {
      if (persona[key] === undefined) delete persona[key];
    });

    return persona;
  }

  private mapPersonaToAfiliado(persona: any): Afiliado {
    if (!persona) {
      throw new Error(
        'Los datos del afiliado no se recibieron correctamente del servidor'
      );
    }

    const tempNumeroAfiliacion = persona.idPersona
      ? 1000 + persona.idPersona
      : 0;

    let estadoLicencia = persona.estadoLicencia;
    if (!estadoLicencia && persona.fechaLicenciaBaja) {
      const hoy = new Date();
      const vencimiento = new Date(persona.fechaLicenciaBaja);
      estadoLicencia = vencimiento < hoy ? 'VENCIDO' : 'ACTIVO';
    }

    const afiliado: Afiliado = {
      idPersona: persona.idPersona,
      apellidoNombre: persona.nombreApellido || '',
      dni: persona.dni || '',
      fechaNacimiento: persona.fechaNacimiento || '',
      tipo: persona.tipo || '',
      categoria: persona.categoria || '',
      categoriaNivel: persona.categoriaNivel || '',
      numeroAfiliacion: persona.numeroAfiliacion || tempNumeroAfiliacion,
      licencia: persona.licencia || 'FJV',
      club: persona.clubActual || (persona.Club ? persona.Club.nombre : ''),
      clubDestino: persona.paseClub || null,
      clubActual: persona.clubActual,
      fechaLicencia: persona.fechaLicencia,
      fechaLicenciaBaja: persona.fechaLicenciaBaja,
      estadoLicencia: estadoLicencia || 'INACTIVO',
      otorgado: persona.otorgado,
      idClub: persona.idClub,
      paseClub: persona.paseClub,
      clubObjeto: persona.Club,
      createdAt: persona.createdAt,
      updatedAt: persona.updatedAt,
      foto: persona.fotoPerfil || undefined,
      avatar: persona.avatar
        ? JSON.parse(persona.avatar)
        : this.generateDefaultAvatar(),
      credenciales: persona.credenciales || [],
    };

    if (afiliado.otorgado && afiliado.paseClub) {
      afiliado.pase = 'Destino';
    }

    return afiliado;
  }

  private generateDefaultAvatar() {
    return {
      icon: 'fas fa-user',
      color: '#6c757d',
      size: '2.5rem',
      type: 'fontawesome',
    };
  }
}
