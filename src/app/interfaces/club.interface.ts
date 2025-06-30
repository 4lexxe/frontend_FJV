export interface Club {
    idClub?: number;
    nombre: string;
    direccion: string;
    telefono?: string;
    email: string;
    cuit: string;
    fechaAfiliacion: string;
    estadoAfiliacion: string;
    createdAt?: string;
    updatedAt?: string;
    personas?: any[];
    equipos?: any[];
}
