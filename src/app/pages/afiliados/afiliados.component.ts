import { Component, OnInit } from '@angular/core';
import { Afiliado } from '../../interfaces/afiliado.interface';
import { AfiliadoService } from '../../services/afiliado.service';
import { Observable, BehaviorSubject, switchMap, map } from 'rxjs';
import { FormularioAfiliadoComponent } from '../afiliados/components/Formulario/formulario-afiliado.component';
import { BuscadorAfiliadosComponent } from '../afiliados/components/Buscador/buscador-afiliado.component';
import { ListadoAfiliadosComponent } from '../afiliados/components/Listado/listado-afiliados.component';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-afiliados',
  templateUrl: './afiliados.component.html',
  styleUrls: ['./afiliados.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormularioAfiliadoComponent,
    BuscadorAfiliadosComponent,
    ListadoAfiliadosComponent,
    AsyncPipe
  ],
})
export class AfiliadosComponent implements OnInit {
  afiliados$!: Observable<Afiliado[]>;

  // Filtros reactivos con dni y nombreApellido (un solo campo)
  private filtrosBusqueda$ = new BehaviorSubject<{ dni?: string; nombreApellido?: string }>({}); // Cambiado a string

  afiliadoParaEditar: Afiliado | null = null;

  categoria1 = ['Jugador', 'Jugadora', 'Entrenador', 'Entrenadora', 'Arbitro', 'Arbitra', 'Planillero'];
  categoria2 = [
    'Mini', 'Sub12', 'Sub14', 'Sub16', 'Sub18', 'Sub20', 'Mayores', 'Beach', 'Maxi', 'Newcom',
    'FJV Aspirante', 'FEVA Provincial N1', 'FEVA Provincial N2', 'FEVA Nacional N1', 'FEVA Nacional N2',
    'FIVB Internacional N1', 'FIVB Internacional N2', 'FIVB Internacional N3',
    'A.FJV Local', 'A.FJV Provincial', 'A.Cand.Nacional', 'A.FEVA Nacional', 'A.Cand. Continental',
    'Arbitro Continental', 'Arbitro Intenacional', 'Arbitro FIVB'
  ];
  categoria3 = ['Local', 'Regional', 'Liga', 'Selección'];
  clubes = [
    'Sociedad Española de Jujuy', 'Sociedad Italiana de Jujuy', 'Club Atletico Gorriti', 'Direccion de Deportes',
    'Club Atletico Independiente', 'Club Atletico Ciudad de Nieva', 'Club Altos Hornos Zapla', 'Club Atletico Talleres',
    'Club Deportivo Universitario', 'Club Deportivo Lujan', 'Club Atletico General Lavalle',
    'Club Gimnasia y Esgrima de Jujuy', 'CIDEF Jujuy', 'Club Atletico San Pedro',
    'Club Deportivo Sirio Voley', 'Club Sportivo Rivadavia', 'Los Ceibos Voley',
    'Club Academia de Voley', 'Club Amigos del Voley', 'Autoridades Tecnicas de Control'
  ];

  constructor(private afiliadoService: AfiliadoService) {}

  // Normaliza texto para ignorar acentos y mayúsculas/minúsculas
  private normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  ngOnInit(): void {
    this.afiliados$ = this.filtrosBusqueda$.pipe(
      switchMap(filtros =>
        this.afiliadoService.obtenerAfiliados().pipe(
          map(afiliados => afiliados.filter(a => {
            const filtroDni = filtros.dni;
            const filtroNombreApellido = filtros.nombreApellido;

            const matchesDni = filtroDni !== undefined 
              ? a.dni.toString().includes(filtroDni)
              : true;

            const matchesNombreApellido = filtroNombreApellido
              ? this.normalizeText(a.apellidoNombre).includes(this.normalizeText(filtroNombreApellido))
              : true;

            return matchesDni && matchesNombreApellido;
          }))
        )
      )
    );
  }

  onBuscarAfiliado(filtros: { dni?: string; nombreApellido?: string }) { // Cambiado a string
    this.filtrosBusqueda$.next(filtros);
  }

  onGuardarAfiliado(afiliado: Afiliado) {
    if (this.afiliadoParaEditar) {
      this.onEliminarAfiliado(this.afiliadoParaEditar.numeroAfiliacion);
    }
    this.afiliadoService.agregarAfiliado(afiliado);
    this.afiliadoParaEditar = null;
    this.filtrosBusqueda$.next(this.filtrosBusqueda$.value); // Recarga con filtros actuales
  }

  onEliminarAfiliado(numeroAfiliacion: number) {
    const actuales = this.afiliadoService['afiliados'];
    const index = actuales.findIndex(a => a.numeroAfiliacion === numeroAfiliacion);
    if (index !== -1) {
      actuales.splice(index, 1);
      this.afiliadoService['afiliados$'].next(actuales);
      this.filtrosBusqueda$.next(this.filtrosBusqueda$.value);
    }
  }

  onEditarAfiliado(afiliado: Afiliado) {
    this.afiliadoParaEditar = afiliado;
  }

  onEditarCategorias(tipo: 'categoria1' | 'categoria2' | 'categoria3'): void {
    const nuevaCategoria = prompt(`Agregar nueva opción para ${tipo}:`);
    if (nuevaCategoria) {
      const target = this[tipo];
      if (!target.includes(nuevaCategoria)) {
        target.push(nuevaCategoria);
      }
    }
  }

  onEditarClubes(): void {
    const nuevoClub = prompt('Agregar nuevo club:');
    if (nuevoClub && !this.clubes.includes(nuevoClub)) {
      this.clubes.push(nuevoClub);
    }
  }
}