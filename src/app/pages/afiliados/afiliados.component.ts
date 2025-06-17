import { Component, OnInit } from '@angular/core';
import { Afiliado } from '../../interfaces/afiliado.interface';
import { AfiliadoService } from '../../services/afiliado.service';
import { Observable, map } from 'rxjs';
import { FormularioAfiliadoComponent } from '../afiliados/components/Formulario/formulario-afiliado.component';
import { BuscadorAfiliadoComponent } from '../afiliados/components/Buscador/buscador-afiliado.component';
import { ListadoAfiliadosComponent } from '../afiliados/components/Listado/listado-afiliados.component';
import { AsyncPipe, CommonModule } from '@angular/common';


@Component({
  selector: 'app-afiliados',
  templateUrl: './afiliados.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormularioAfiliadoComponent,
    BuscadorAfiliadoComponent,
    ListadoAfiliadosComponent,
    AsyncPipe
  ],
})
export class AfiliadosComponent implements OnInit {
  afiliados$!: Observable<Afiliado[]>;
  filtroDNI: number | null = null;
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

  ngOnInit(): void {
    this.cargarAfiliados();
  }

  cargarAfiliados() {
    this.afiliados$ = this.afiliadoService.obtenerAfiliados().pipe(
      map((afiliados) => {
        if (!this.filtroDNI) return afiliados;
        return afiliados.filter(a => a.dni === this.filtroDNI);
      })
    );
  }

  onBuscarPorDNI(dni: number) {
    this.filtroDNI = dni;
    this.cargarAfiliados();
  }

  onLimpiarFiltro() {
    this.filtroDNI = null;
    this.cargarAfiliados();
  }

  onGuardarAfiliado(afiliado: Afiliado) {
    console.log('Afiliado a guardar', afiliado);
    if (this.afiliadoParaEditar) {
      this.onEliminarAfiliado(this.afiliadoParaEditar.numeroAfiliacion);
    }

    this.afiliadoService.agregarAfiliado(afiliado);
    this.afiliadoParaEditar = null;
    this.cargarAfiliados();
  }

  onEliminarAfiliado(numeroAfiliacion: number) {
    const actuales = this.afiliadoService['afiliados'];
    const index = actuales.findIndex(a => a.numeroAfiliacion === numeroAfiliacion);
    if (index !== -1) {
      actuales.splice(index, 1);
      this.afiliadoService['afiliados$'].next(actuales);
      this.cargarAfiliados();
    }
  }

  onEditarAfiliado(afiliadoActualizado: Afiliado) {
  const index = this.afiliadoService['afiliados'].findIndex(a => a.numeroAfiliacion === afiliadoActualizado.numeroAfiliacion);
  if (index !== -1) {
    this.afiliadoService['afiliados'][index] = afiliadoActualizado;
    this.afiliadoService['afiliados$'].next(this.afiliadoService['afiliados']);
    this.cargarAfiliados();
  }
}


  onEditarCategorias(tipo: 'categoria1' | 'categoria2' | 'categoria3'): void {
  const nuevaCategoria = prompt(`Agregar nueva opción para ${tipo}:`);
  if (nuevaCategoria) {
    if (tipo === 'categoria1' && !this.categoria1.includes(nuevaCategoria)) {
      this.categoria1.push(nuevaCategoria);
    } else if (tipo === 'categoria2' && !this.categoria2.includes(nuevaCategoria)) {
      this.categoria2.push(nuevaCategoria);
    } else if (tipo === 'categoria3' && !this.categoria3.includes(nuevaCategoria)) {
      this.categoria3.push(nuevaCategoria);
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
