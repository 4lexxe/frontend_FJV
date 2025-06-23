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
        };
        
        if (afiliado.otorgado && afiliado.paseClub) {
            afiliado.pase = 'Destino'; 
        }

        return afiliado;
    }
}