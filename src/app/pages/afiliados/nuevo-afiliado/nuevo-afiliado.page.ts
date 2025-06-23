import { Component, OnInit } from '@angular/core';
import { FormularioAfiliadoComponent } from '../components/Formulario/formulario-afiliado.component';
import { Afiliado } from '../../../interfaces/afiliado.interface';
import { AfiliadoService } from '../../../services/afiliado.service'; 
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; 
import { Club } from '../../../interfaces/club.interface'; 
@Component({
  selector: 'app-nuevo-afiliado-page',
  standalone: true,
  imports: [CommonModule, FormularioAfiliadoComponent],
  template: `
    <div class="container my-4">
      <app-formulario-afiliado
        [afiliadoParaEditar]="afiliadoParaEditar"
        [categoria1]="categoria1"
        [categoria2]="categoria2"
        [categoria3]="categoria3"
        [clubes]="clubesNombres"
        (guardarAfiliado)="onGuardarAfiliado($event)"
        (editarCategorias)="onEditarCategorias($event)"
        (editarClubes)="onEditarClubes()"
      ></app-formulario-afiliado>
    </div>
  `,
  styles: []
})
export class NuevoAfiliadoPage implements OnInit {
  categoria1 = ['Jugador', 'Jugadora', 'Entrenador', 'Entrenadora', 'Arbitro', 'Arbitra', 'Planillero'];
  categoria2 = [
      'Mini', 'Sub12', 'Sub14', 'Sub16', 'Sub18', 'Sub20', 'Mayores', 'Beach', 'Maxi', 'Newcom',
      'FJV Aspirante', 'FEVA Provincial N1', 'FEVA Provincial N2', 'FEVA Nacional N1', 'FEVA Nacional N2',
      'FIVB Internacional N1', 'FIVB Internacional N2', 'FIVB Internacional N3',
      'A.FJV Local', 'A.FJV Provincial', 'A.Cand.Nacional', 'A.FEVA Nacional', 'A.Cand. Continental',
      'Arbitro Continental', 'Arbitro Intenacional', 'Arbitro FIVB'
  ];
  categoria3 = ['Local', 'Regional', 'Liga', 'Selección'];
  clubesNombres: string[] = [];
  clubesCompletos: Club[] = [];
  afiliadoParaEditar: Afiliado | null = null;

  constructor(
    private afiliadoService: AfiliadoService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadClubes();
    const afiliadoId = this.route.snapshot.paramMap.get('id');
    if (afiliadoId) {
      // [ACCIÓN REQUERIDA] El método `obtenerAfiliadoPorId` no existe en tu servicio.
      // Debes agregarlo a `src/app/services/afiliado.service.ts` para que la edición funcione.
      // Puedes basarte en el método `obtenerClubPorId` que usas en `nuevo-club.page.ts`.
      this.afiliadoService.obtenerAfiliadoPorId(+afiliadoId).subscribe({
        next: (afiliado: Afiliado) => this.afiliadoParaEditar = afiliado,
        error: (err: any) => {
          console.error('Error al cargar el afiliado para editar:', err);
          this.router.navigate(['/afiliados/listado']);
        }
      });
    }
  }

  private loadClubes(): void {
    this.afiliadoService.obtenerClubes().subscribe(data => {
        this.clubesCompletos = data;
        this.clubesNombres = data.map(club => club.nombre);
    });
  }

  onGuardarAfiliado(afiliadoForm: Afiliado): void {
    const idClubMapped = this.clubesCompletos.find(c => c.nombre === afiliadoForm.club)?.idClub || null;
        
    const afiliadoParaGuardar: Afiliado = {
        ...afiliadoForm,
        idClub: idClubMapped, 
        clubActual: afiliadoForm.club, 
        paseClub: afiliadoForm.clubDestino, 
        otorgado: afiliadoForm.fechaPase ? true : false, 
    };

    const operation = afiliadoParaGuardar.idPersona
      ? this.afiliadoService.actualizarAfiliado(afiliadoParaGuardar.idPersona, afiliadoParaGuardar)
      : this.afiliadoService.agregarAfiliado(afiliadoParaGuardar);

    operation.subscribe({
      next: () => {
        alert(`Afiliado ${afiliadoParaGuardar.idPersona ? 'actualizado' : 'agregado'} con éxito!`);
        this.router.navigate(['/afiliados/listado']);
      },
      error: (err) => {
        console.error(`Error al ${afiliadoParaGuardar.idPersona ? 'actualizar' : 'agregar'} afiliado:`, err);
        alert(`Error al ${afiliadoParaGuardar.idPersona ? 'actualizar' : 'agregar'} el afiliado. Por favor, intente de nuevo.`);
      }
    });
  }

  // Estos métodos son marcadores de posición, ya que normalmente implicarían modales o páginas separadas
  // que no son parte de la responsabilidad principal de esta página de "nuevo" formulario.
  onEditarCategorias(tipo: 'categoria1' | 'categoria2' | 'categoria3'): void {
    alert(`Funcionalidad para editar categorías (${tipo}) no implementada en esta página.`);
  }

  onEditarClubes(): void {
    alert('Funcionalidad para editar clubes no implementada en esta página.');
  }
}
