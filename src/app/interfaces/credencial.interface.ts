import { Afiliado } from './afiliado.interface';

export interface Credencial {
  idCredencial?: number;
  identificador: string;
  fechaAlta: string; // Ahora es requerido y mapea a fechaLicencia
  fechaVencimiento: string; // Ahora es requerido y mapea a fechaLicenciaBaja
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'VENCIDO'; // Estados actualizados para coincidir con backend
  motivoSuspension?: string; // Nuevo campo para motivo de suspensión
  idPersona: number;
  persona?: Afiliado;
  createdAt?: string;
  updatedAt?: string;

  // Campos obsoletos mantenidos para compatibilidad
  numeroCredencial?: string;
  fechaEmision?: string; // Alias para fechaAlta
  tipoCredencial?: string;
  observaciones?: string;
  activo?: boolean;
}
