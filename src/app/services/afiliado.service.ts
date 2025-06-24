import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Afiliado } from '../interfaces/afiliado.interface';
import { Club } from '../interfaces/club.interface';

@Injectable({ providedIn: 'root' })
export class AfiliadoService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) {}

    obtenerAfiliados(): Observable<Afiliado[]> {
        return this.http.get<any[]>(`${this.apiUrl}/personas?includeClub=true`).pipe(
            map(personas => personas.map(p => this.mapPersonaToAfiliado(p)))
        );
    }

    agregarAfiliado(afiliado: Afiliado): Observable<Afiliado> {
        const personaBackend = this.mapAfiliadoToPersona(afiliado);
        return this.http.post<any>(`${this.apiUrl}/personas`, personaBackend).pipe(
            map(p => this.mapPersonaToAfiliado(p))
        );
    }

    actualizarAfiliado(idPersona: number, afiliado: Afiliado): Observable<Afiliado> {
        const personaBackend = this.mapAfiliadoToPersona(afiliado);
        return this.http.put<any>(`${this.apiUrl}/personas/${idPersona}`, personaBackend).pipe(
            map(p => this.mapPersonaToAfiliado(p))
        );
    }

    obtenerAfiliadoPorId(idPersona: number): Observable<Afiliado> {
        return this.http.get<any>(`${this.apiUrl}/personas/${idPersona}?includeClub=true`).pipe(
            map(p => this.mapPersonaToAfiliado(p))
        );
    }

    eliminarAfiliado(idPersona: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/personas/${idPersona}`);
    }

    obtenerClubes(): Observable<Club[]> {
        return this.http.get<Club[]>(`${this.apiUrl}/clubs`);
    }

    // Nuevo método para subir foto con archivo
    subirFotoAfiliado(idPersona: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('fotoPerfil', file);

        return this.http.put(`${this.apiUrl}/personas/${idPersona}`, formData);
    }

    // Nuevo método para crear afiliado con foto
    crearAfiliadoConFoto(afiliado: Afiliado, file?: File): Observable<Afiliado> {
        if (file) {
            // Si hay archivo, crear con FormData
            const formData = new FormData();
            const personaData = this.mapAfiliadoToPersona(afiliado);

            // Agregar todos los campos del afiliado al FormData
            Object.keys(personaData).forEach(key => {
                if (personaData[key] !== null && personaData[key] !== undefined) {
                    formData.append(key, personaData[key]);
                }
            });

            // Agregar el archivo
            formData.append('fotoPerfil', file);

            return this.http.post<any>(`${this.apiUrl}/personas`, formData).pipe(
                map(response => this.mapPersonaToAfiliado(response.persona || response))
            );
        } else {
            // Si no hay archivo, usar el método normal
            return this.agregarAfiliado(afiliado);
        }
    }

    // Nuevo método para actualizar afiliado con foto
    actualizarAfiliadoConFoto(idPersona: number, afiliado: Afiliado, file?: File): Observable<Afiliado> {
        if (file) {
            // Si hay archivo, actualizar con FormData
            const formData = new FormData();
            const personaData = this.mapAfiliadoToPersona(afiliado);

            // Agregar todos los campos del afiliado al FormData
            Object.keys(personaData).forEach(key => {
                if (personaData[key] !== null && personaData[key] !== undefined) {
                    formData.append(key, personaData[key]);
                }
            });

            // Agregar el archivo
            formData.append('fotoPerfil', file);

            return this.http.put<any>(`${this.apiUrl}/personas/${idPersona}`, formData).pipe(
                map(response => this.mapPersonaToAfiliado(response.persona || response))
            );
        } else {
            // Si no hay archivo, usar el método normal
            return this.actualizarAfiliado(idPersona, afiliado);
        }
    }

    // Método para obtener foto de perfil
    obtenerFotoPerfil(idPersona: number): Observable<string> {
        return this.http.get<any>(`${this.apiUrl}/personas/${idPersona}/foto`).pipe(
            map(response => {
                if (response.status === "1" && response.foto && response.foto.fotoPerfil) {
                    return `data:${response.foto.tipo};base64,${response.foto.fotoPerfil}`;
                }
                return '';
            })
        );
    }

    // Método para eliminar foto de perfil
    eliminarFotoPerfil(idPersona: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/personas/${idPersona}/foto`);
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
            createdAt: afiliado.createdAt,
            updatedAt: afiliado.updatedAt,
            foto: afiliado.foto,
            avatar: afiliado.avatar ? JSON.stringify(afiliado.avatar) : null,
        };

        delete persona.numeroAfiliacion;
        delete persona.tipoAfiliacion;
        delete persona.fechaAlta;
        delete persona.pase;
        delete persona.fechaPase;
        delete persona.clubObjeto;

        return persona;
    }

    /**
     * Mapea un objeto Persona (desde el backend) a la estructura de Afiliado (para el frontend).
     * Asigna valores por defecto o placeholders para campos solo del frontend.
     */
    private mapPersonaToAfiliado(persona: any): Afiliado {
        // Generar un número de afiliación temporal si no viene del backend o se quiere mostrar un placeholder
        // Podrías usar un contador global o derivarlo del ID de la persona si te sirve.
        const tempNumeroAfiliacion = persona.idPersona ? (1000 + persona.idPersona) : 0;

        const afiliado: Afiliado = {
            idPersona: persona.idPersona,
            apellidoNombre: persona.nombreApellido,
            dni: persona.dni,
            fechaNacimiento: persona.fechaNacimiento,

            tipo: persona.tipo,
            categoria: persona.categoria,
            categoriaNivel: persona.categoriaNivel,

            // Campos solo del frontend que se asignan a valores por defecto o nulos si no vienen del backend
            numeroAfiliacion: persona.numeroAfiliacion || tempNumeroAfiliacion,
            tipoAfiliacion: persona.tipoAfiliacion || 'FJV',
            fechaAlta: persona.fechaAlta || (new Date()).toISOString().substring(0, 10),

            club: persona.clubActual || (persona.Club ? persona.Club.nombre : ''),

            clubDestino: persona.paseClub || null,

            // Campos que son idénticos o equivalentes en ambos lados
            clubActual: persona.clubActual,
            licenciaFEVA: persona.licenciaFEVA,
            fechaLicencia: persona.fechaLicencia,
            otorgado: persona.otorgado,
            idClub: persona.idClub,
            paseClub: persona.paseClub,

            clubObjeto: persona.Club,
            createdAt: persona.createdAt,
            updatedAt: persona.updatedAt,

            // Manejar foto de perfil desde el backend
            foto: persona.fotoPerfil ? `data:${persona.fotoPerfilTipo};base64,${persona.fotoPerfil}` : undefined,
            avatar: persona.avatar ? JSON.parse(persona.avatar) : this.generateDefaultAvatar(),
        };

        if (afiliado.otorgado && afiliado.paseClub) {
            afiliado.pase = 'Destino';
        }

        return afiliado;
    }

    private generateDefaultAvatar() {
        // Siempre usar el mismo icono por defecto
        return {
            icon: 'fas fa-user',
            color: '#6c757d', // Gris Bootstrap
            size: '2.5rem',
            type: 'fontawesome'
        };
    }

    getAvatarUrl(afiliado: Afiliado): string {
        if (afiliado.foto) {
            return afiliado.foto;
        }

        return '';
    }

    getAvatarIcon(afiliado: Afiliado): any {
        if (afiliado.avatar && afiliado.avatar.type === 'fontawesome') {
            return afiliado.avatar;
        }

        // Devolver siempre el mismo icono por defecto
        return {
            icon: 'fas fa-user',
            color: '#6c757d',
            size: '2.5rem',
            type: 'fontawesome'
        };
    }

    uploadFoto(file: File): Observable<string> {
        const formData = new FormData();
        formData.append('foto', file);

        return this.http.post<{url: string}>(`${this.apiUrl}/upload-foto`, formData).pipe(
            map(response => response.url)
        );
    }
}
