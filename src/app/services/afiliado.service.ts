import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importar el operador map
import { Afiliado } from '../interfaces/afiliado.interface';
import { Club } from '../interfaces/club.interface';

@Injectable({ providedIn: 'root' })
export class AfiliadoService {
    private apiUrl = 'http://localhost:3000/api'; 

    constructor(private http: HttpClient) {}

    obtenerAfiliados(): Observable<Afiliado[]> {
        // Al obtener, solicitamos que se incluya el objeto Club (si tu backend lo soporta)
        // Y mapeamos la respuesta de 'Persona' a la interfaz 'Afiliado' del frontend.
        return this.http.get<any[]>(`${this.apiUrl}/personas?includeClub=true`).pipe(
            map(personas => personas.map(p => this.mapPersonaToAfiliado(p)))
        );
    }

    agregarAfiliado(afiliado: Afiliado): Observable<Afiliado> {
        // Mapea el objeto Afiliado del frontend a la estructura de Persona esperada por el backend.
        const personaBackend = this.mapAfiliadoToPersona(afiliado);
        return this.http.post<any>(`${this.apiUrl}/personas`, personaBackend).pipe(
            map(p => this.mapPersonaToAfiliado(p))
        );
    }

    actualizarAfiliado(idPersona: number, afiliado: Afiliado): Observable<Afiliado> {
        // Mapea el objeto Afiliado del frontend a la estructura de Persona esperada por el backend.
        const personaBackend = this.mapAfiliadoToPersona(afiliado);
        return this.http.put<any>(`${this.apiUrl}/personas/${idPersona}`, personaBackend).pipe(
            map(p => this.mapPersonaToAfiliado(p))
        );
    }

    eliminarAfiliado(idPersona: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/personas/${idPersona}`);
    }

    obtenerClubes(): Observable<Club[]> {
        return this.http.get<Club[]>(`${this.apiUrl}/clubs`);
    }

    /**
     * Mapea un objeto Afiliado (desde el frontend) a la estructura de Persona (para el backend).
     * Elimina campos que no existen en el modelo Persona del backend.
     */
    private mapAfiliadoToPersona(afiliado: Afiliado): any {
        const persona: any = {
            // Mapeo crucial: apellidoNombre del frontend a nombreApellido del backend
            nombreApellido: afiliado.apellidoNombre,
            dni: afiliado.dni,
            fechaNacimiento: afiliado.fechaNacimiento,
            
            // Mapeo directo de categorías
            tipo: afiliado.tipo,
            categoria: afiliado.categoria,
            categoriaNivel: afiliado.categoriaNivel,

            // Mapeo de nombres de club a los campos de Persona del backend
            clubActual: afiliado.club, // Nombre del club para Persona.clubActual
            paseClub: afiliado.clubDestino, // Nombre del club de destino para Persona.paseClub

            // Campos del backend que pueden ser opcionales o venir de valores por defecto
           
            otorgado: afiliado.otorgado || false, // 'otorgado' se deriva de 'fechaPase' en el componente principal

            // idClub ya debe venir resuelto (ID numérico) desde el componente principal
            idClub: afiliado.idClub || null,

            // Timestamps (si el backend no los gestiona automáticamente en POST/PUT y esperas enviarlos)
            createdAt: afiliado.createdAt,
            updatedAt: afiliado.updatedAt,
        };

        // ****** IMPORTE: Eliminar campos que existen solo en el frontend y no en el modelo Persona del backend ******
        delete persona.numeroAfiliacion;
        delete persona.tipoAfiliacion;
        delete persona.fechaAlta;
        delete persona.pase; // El backend tiene 'paseClub' (string), no un campo 'pase' (tipo de pase)
        delete persona.fechaPase; // El backend tiene 'otorgado' (boolean) en su lugar
        delete persona.clubObjeto; // No enviar el objeto Club completo al backend

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
            apellidoNombre: persona.nombreApellido, // Mapeo: nombreApellido del backend a apellidoNombre del frontend
            dni: persona.dni,
            fechaNacimiento: persona.fechaNacimiento,
            
            tipo: persona.tipo,
            categoria: persona.categoria,
            categoriaNivel: persona.categoriaNivel,
            
            // Campos solo del frontend que se asignan a valores por defecto o nulos si no vienen del backend
            numeroAfiliacion: persona.numeroAfiliacion || tempNumeroAfiliacion, // Asigna el valor del backend o el temporal
            tipoAfiliacion: persona.tipoAfiliacion || 'FJV', // Valor por defecto
            fechaAlta: persona.fechaAlta || (new Date()).toISOString().substring(0, 10), // Valor por defecto

            club: persona.clubActual || (persona.Club ? persona.Club.nombre : ''), // Nombre del club para el frontend
           
            clubDestino: persona.paseClub || null, // Nombre del club de pase para el frontend
           

            // Campos que son idénticos o equivalentes en ambos lados
            clubActual: persona.clubActual,
            licenciaFEVA: persona.licenciaFEVA,
            fechaLicencia: persona.fechaLicencia,
            otorgado: persona.otorgado,
            idClub: persona.idClub,
            paseClub: persona.paseClub, 

            clubObjeto: persona.Club, // El objeto Club completo si se incluyó con Sequelize include
            createdAt: persona.createdAt,
            updatedAt: persona.updatedAt,
        };
        
        // Si el campo 'otorgado' del backend es true y hay 'paseClub', podríamos inferir un tipo de pase para el frontend
        if (afiliado.otorgado && afiliado.paseClub) {
            afiliado.pase = 'Destino'; // O el tipo de pase que mejor represente un pase otorgado a un club destino
        }

        return afiliado;
    }
}