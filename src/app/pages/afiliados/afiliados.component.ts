import { Component, OnInit } from '@angular/core';
import { Afiliado } from '../../interfaces/afiliado.interface';
import { Club } from '../../interfaces/club.interface';
import { AfiliadoService } from '../../services/afiliado.service';
import { Observable, BehaviorSubject, switchMap, map } from 'rxjs';
import { FormularioAfiliadoComponent } from './components/Formulario/formulario-afiliado.component';
import { BuscadorAfiliadosComponent } from './components/Buscador/buscador-afiliado.component';
import { ListadoAfiliadosComponent } from './components/Listado/listado-afiliados.component';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterModule } from '@angular/router';
import { ListadoClubesComponent } from '../clubs/components/listado-clubes/listado-clubes.component';

@Component({
    selector: 'app-afiliados',
    templateUrl: './afiliados.component.html',
    styleUrls: ['./afiliados.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BuscadorAfiliadosComponent,
        ListadoAfiliadosComponent,
        AsyncPipe,
        RouterModule
    ],
})
export class AfiliadosComponent implements OnInit {
    afiliados$!: Observable<Afiliado[]>;
    clubes$!: Observable<Club[]>;
    clubesNombres: string[] = [];
    clubesCompletos: Club[] = [];

    private filtrosBusqueda$ = new BehaviorSubject<{ dni?: string; apellidoNombre?: string }>({});

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

    constructor(
      private afiliadoService: AfiliadoService,
      private modalService: NgbModal, // Inyectar NgbModal
      private router: Router
    ) {}

    private loadAfiliados(): void {
        this.afiliados$ = this.filtrosBusqueda$.pipe(
            switchMap(filtros =>
                this.afiliadoService.obtenerAfiliados().pipe(
                    map(afiliados => {
                        return afiliados.filter(a => {
                            const filtroDni = filtros.dni;
                            const filtroApellidoNombre = filtros.apellidoNombre;

                            const matchesDni = filtroDni !== undefined && filtroDni !== null
                                ? a.dni?.toString().includes(filtroDni)
                                : true;

                            const matchesApellidoNombre = filtroApellidoNombre && a.apellidoNombre
                                ? this.normalizeText(a.apellidoNombre).includes(this.normalizeText(filtroApellidoNombre))
                                : true;

                            return matchesDni && matchesApellidoNombre;
                        });
                    })
                )
            )
        );
    }
    
    ngOnInit(): void {
        this.loadClubes(); 
        this.loadAfiliados();
    }

    // Nueva función para cargar los clubes
    private loadClubes(): void {
        this.clubes$ = this.afiliadoService.obtenerClubes();
        this.clubes$.subscribe(data => {
            this.clubesCompletos = data;
            this.clubesNombres = data.map(club => club.nombre);
        });
    }

    private normalizeText(text: string | undefined | null): string {
        if (!text) return '';
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    onBuscarAfiliado(filtros: { dni?: string; apellidoNombre?: string }) {
        this.filtrosBusqueda$.next(filtros);
    }

    onEliminarAfiliado(idPersona: number) {
        this.afiliadoService.eliminarAfiliado(idPersona).subscribe({
            next: () => {
                console.log('Afiliado eliminado con éxito');
                this.loadAfiliados();
            },
            error: (err) => console.error('Error al eliminar afiliado:', err)
        });
    }

    onEditarAfiliado(afiliado: Afiliado) {
        this.router.navigate(['/afiliados/editar', afiliado.idPersona]);
    }

    onEditarCategorias(tipo: 'categoria1' | 'categoria2' | 'categoria3'): void {
        console.log(`Solicitud para editar: ${tipo}`);
       
    }

    // Modificar este método para abrir el CRUD de Clubes en un modal
    onEditarClubes(): void {
        console.log('Abriendo CRUD de clubes...');
        this.modalService.open(ListadoClubesComponent, { size: 'xl', backdrop: 'static', keyboard: false })
            .result.then((result) => {
                // Se cerró el modal de clubes. Recargar los clubes en el formulario de afiliados
                this.loadClubes();
                console.log('CRUD de clubes cerrado:', result);
            }, (reason) => {
                // Modal de clubes cerrado sin guardar (ej. por escape o botón de cerrar)
                this.loadClubes(); 
                console.log('CRUD de clubes descartado:', reason);
            });
    }
}