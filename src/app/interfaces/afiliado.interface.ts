// src/app/interfaces/afiliado.interface.ts
import { Club } from './club.interface';

export interface Afiliado {
  idPersona?: number; // El ID de la persona en la base de datos (generado por el backend)

  // Campos principales del afiliado (frontend y backend)
  apellidoNombre: string;
  dni: string;
  fechaNacimiento: string;

  // Campos específicos del frontend (no están directamente en el modelo 'Persona' del backend)
  numeroAfiliacion: number;
  tipoAfiliacion: 'FEVA' | 'FJV';
  fechaAlta: string;

  // Campos que mapean directamente a propiedades de 'Persona' en el backend
  tipo: string;
  categoria: string;
  categoriaNivel: string;

  // Campos relacionados con el Club al que pertenece y su ID (backend y frontend)
  club: string;
  idClub?: number | null;
  clubActual?: string;

  // Campos relacionados con licencias FEVA (directamente del backend 'Persona')
  licenciaFEVA?: string;
  fechaLicencia?: string;

  // Campos relacionados con pases (algunos frontend, otros backend)
  pase?: 'Proveniente' | 'Destino' | 'Habilitacion';
  clubDestino?: string;
  fechaPase?: string;
  paseClub?: string | null;
  otorgado?: boolean;

  // Propiedad para el objeto Club completo (si se incluye en la consulta del backend)
  clubObjeto?: Club;

  // Timestamps automáticos de Sequelize (backend)
  createdAt?: string;
  updatedAt?: string;

  // Nuevos campos para foto y avatar
  foto?: string;
  avatar?: {
    estilo?: 'Circle' | 'Transparent';
    top?: string;
    accesorios?: string;
    colorCabello?: string;
    cabelloFacial?: string;
    colorCabelloFacial?: string;
    // Nuevos campos para FontAwesome
    icon?: string;
    color?: string;
    size?: string;
    type?: 'fontawesome' | 'avataaars';
  };
}
