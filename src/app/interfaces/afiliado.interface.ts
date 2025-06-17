// src/app/interfaces/afiliado.interface.ts
export interface Afiliado {
  apellidoNombre: string;
  dni: number;
  fechaNacimiento: string; // formato ISO: 'YYYY-MM-DD'
  numeroAfiliacion: number;
  tipoAfiliacion: 'FEVA' | 'FJV';
  categoria1: string;
  categoria2: string;
  categoria3: string;
  fechaAlta: string;
  club: string;
  pase: 'Proveniente' | 'Destino' | 'Habilitacion';
  clubDestino?: string;
  fechaPase?: string;
}
