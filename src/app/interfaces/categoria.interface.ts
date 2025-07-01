export interface Categoria {
  idCategoria: number;
  nombre: string;
  tipo: 'afiliado' | 'division' | 'competencia';
  edadMinima?: number;
  edadMaxima?: number;
}
