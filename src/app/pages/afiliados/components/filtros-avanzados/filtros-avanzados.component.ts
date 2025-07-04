import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AfiliadoService } from '../../../../services/afiliado.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface FiltrosAvanzados {
  // Filtros básicos de persona
  dni?: string;
  apellidoNombre?: string;
  estadoLicencia?: string;
  tipo?: string[];
  categoria?: string;
  categoriaNivel?: string;
  fechaNacimientoDesde?: string;
  fechaNacimientoHasta?: string;
  fechaLicenciaDesde?: string;
  fechaLicenciaHasta?: string;

  // Filtros de club
  clubId?: number;
  clubNombre?: string;
  estadoAfiliacionClub?: string;

  // Filtros de pases
  tienePases?: boolean;
  fechaPaseDesde?: string;
  fechaPaseHasta?: string;
  clubOrigenPase?: string;
  clubDestinoPase?: string;

  // Filtros de pagos/cobros
  tienePagos?: boolean;
  estadoPago?: string;
  montoPagoDesde?: number;
  montoPagoHasta?: number;
  fechaPagoDesde?: string;
  fechaPagoHasta?: string;

  // Filtros de credenciales
  tieneCredencial?: boolean;
  estadoCredencial?: string;

  // Opciones de ordenamiento
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface OpcionesFiltros {
  clubes: any[];
  estadosLicencia: string[];
  tipos: string[];
  categorias: string[];
  categoriasNivel: string[];
  estadosPago: string[];
}

@Component({
  selector: 'app-filtros-avanzados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="filtros-avanzados-container">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-filter me-2"></i>Filtros Avanzados
          </h5>
          <div class="btn-group">
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="limpiarFiltros()">
              <i class="fas fa-eraser me-1"></i>Limpiar
            </button>
            <button type="button" class="btn btn-outline-primary btn-sm" (click)="guardarConfiguracion()">
              <i class="fas fa-save me-1"></i>Guardar
            </button>
            <button type="button" class="btn btn-success btn-sm" (click)="exportarExcel()">
              <i class="fas fa-file-excel me-1"></i>Excel
            </button>
          </div>
        </div>

        <div class="card-body">
          <form [formGroup]="filtrosForm" (ngSubmit)="aplicarFiltros()">

            <!-- Pestañas de filtros -->
            <ul class="nav nav-pills nav-fill mb-3" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link" [class.active]="tabActiva === 'basicos'"
                        type="button" (click)="tabActiva = 'basicos'">
                  <i class="fas fa-user me-1"></i>Datos Básicos
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" [class.active]="tabActiva === 'club'"
                        type="button" (click)="tabActiva = 'club'">
                  <i class="fas fa-users me-1"></i>Club
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" [class.active]="tabActiva === 'pases'"
                        type="button" (click)="tabActiva = 'pases'">
                  <i class="fas fa-exchange-alt me-1"></i>Pases
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" [class.active]="tabActiva === 'pagos'"
                        type="button" (click)="tabActiva = 'pagos'">
                  <i class="fas fa-money-bill me-1"></i>Pagos
                </button>
              </li>
            </ul>

            <!-- Contenido de pestañas -->
            <div class="tab-content">

              <!-- Tab Datos Básicos -->
              <div *ngIf="tabActiva === 'basicos'" class="tab-pane fade show active">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">DNI</label>
                    <input type="text" class="form-control" formControlName="dni"
                           placeholder="Buscar por DNI...">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Nombre y Apellido</label>
                    <input type="text" class="form-control" formControlName="apellidoNombre"
                           placeholder="Buscar por nombre...">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Estado Licencia</label>
                    <select class="form-select" formControlName="estadoLicencia">
                      <option value="">Todos los estados</option>
                      <option *ngFor="let estado of opciones?.estadosLicencia || []" [value]="estado">
                        {{estado}}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Tipo de Afiliado</label>
                    <div class="checkbox-group">
                      <div *ngFor="let tipo of opciones?.tipos || []" class="form-check form-check-inline">
                        <input type="checkbox" class="form-check-input"
                               [id]="'tipo_' + tipo" [value]="tipo"
                               (change)="toggleTipo(tipo, $event)">
                        <label class="form-check-label" [for]="'tipo_' + tipo">{{tipo}}</label>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3">
                    <label class="form-label">Categoría</label>
                    <select class="form-select" formControlName="categoria">
                      <option value="">Todas las categorías</option>
                      <option *ngFor="let cat of opciones?.categorias || []" [value]="cat">{{cat}}</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Nivel Categoría</label>
                    <select class="form-select" formControlName="categoriaNivel">
                      <option value="">Todos los niveles</option>
                      <option *ngFor="let nivel of opciones?.categoriasNivel || []" [value]="nivel">{{nivel}}</option>
                    </select>
                  </div>

                  <!-- Filtros de fecha -->
                  <div class="col-md-6">
                    <label class="form-label">Fecha Nacimiento</label>
                    <div class="row">
                      <div class="col-6">
                        <input type="date" class="form-control" formControlName="fechaNacimientoDesde"
                               placeholder="Desde">
                      </div>
                      <div class="col-6">
                        <input type="date" class="form-control" formControlName="fechaNacimientoHasta"
                               placeholder="Hasta">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Fecha Licencia</label>
                    <div class="row">
                      <div class="col-6">
                        <input type="date" class="form-control" formControlName="fechaLicenciaDesde">
                      </div>
                      <div class="col-6">
                        <input type="date" class="form-control" formControlName="fechaLicenciaHasta">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Club -->
              <div *ngIf="tabActiva === 'club'" class="tab-pane fade show active">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Club</label>
                    <select class="form-select" formControlName="clubId">
                      <option value="">Todos los clubes</option>
                      <option *ngFor="let club of opciones?.clubes || []" [value]="club.idClub">
                        {{club.nombre}}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Buscar Club por Nombre</label>
                    <input type="text" class="form-control" formControlName="clubNombre"
                           placeholder="Nombre del club...">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Estado Afiliación Club</label>
                    <select class="form-select" formControlName="estadoAfiliacionClub">
                      <option value="">Todos los estados</option>
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                      <option value="SUSPENDIDO">Suspendido</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Tab Pases -->
              <div *ngIf="tabActiva === 'pases'" class="tab-pane fade show active">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" formControlName="tienePases" id="tienePases">
                      <label class="form-check-label" for="tienePases">
                        Solo afiliados con pases
                      </label>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Club Origen</label>
                    <input type="text" class="form-control" formControlName="clubOrigenPase"
                           placeholder="Club de origen...">
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Club Destino</label>
                    <input type="text" class="form-control" formControlName="clubDestinoPase"
                           placeholder="Club destino...">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Fecha Pase</label>
                    <div class="row">
                      <div class="col-6">
                        <input type="date" class="form-control" formControlName="fechaPaseDesde">
                      </div>
                      <div class="col-6">
                        <input type="date" class="form-control" formControlName="fechaPaseHasta">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Pagos -->
              <div *ngIf="tabActiva === 'pagos'" class="tab-pane fade show active">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" formControlName="tienePagos" id="tienePagos">
                      <label class="form-check-label" for="tienePagos">
                        Solo afiliados con pagos
                      </label>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Estado Pago</label>
                    <select class="form-select" formControlName="estadoPago">
                      <option value="">Todos los estados</option>
                      <option *ngFor="let estado of opciones?.estadosPago || []" [value]="estado">
                        {{estado}}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Rango de Monto</label>
                    <div class="row">
                      <div class="col-6">
                        <input type="number" class="form-control" formControlName="montoPagoDesde"
                               placeholder="Desde" min="0" step="0.01">
                      </div>
                      <div class="col-6">
                        <input type="number" class="form-control" formControlName="montoPagoHasta"
                               placeholder="Hasta" min="0" step="0.01">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Fecha Pago</label>
                    <div class="row">
                      <div class="col-6">
                        <input type="date" class="form-control" formControlName="fechaPagoDesde">
                      </div>
                      <div class="col-6">
                        <input type="date" class="form-control" formControlName="fechaPagoHasta">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ordenamiento -->
            <hr>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Ordenar por</label>
                <select class="form-select" formControlName="sortBy">
                  <option value="nombreApellido">Nombre y Apellido</option>
                  <option value="dni">DNI</option>
                  <option value="fechaNacimiento">Fecha Nacimiento</option>
                  <option value="fechaLicencia">Fecha Licencia</option>
                  <option value="numeroAfiliacion">Número Afiliación</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Orden</label>
                <select class="form-select" formControlName="sortOrder">
                  <option value="ASC">Ascendente</option>
                  <option value="DESC">Descendente</option>
                </select>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="d-flex justify-content-between">
                  <div>
                    <button type="submit" class="btn btn-primary me-2">
                      <i class="fas fa-search me-1"></i>Aplicar Filtros
                    </button>
                    <button type="button" class="btn btn-outline-secondary" (click)="limpiarFiltros()">
                      <i class="fas fa-times me-1"></i>Limpiar Todo
                    </button>
                  </div>
                  <div>
                    <small class="text-muted">
                      Filtros activos: {{contarFiltrosActivos()}}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Resumen de filtros aplicados -->
      <div *ngIf="filtrosAplicados && contarFiltrosActivos() > 0" class="mt-3">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">Filtros Aplicados:</h6>
            <div class="d-flex flex-wrap gap-2">
              <span *ngFor="let filtro of obtenerFiltrosActivos()"
                    class="badge bg-primary">
                {{filtro.nombre}}: {{filtro.valor}}
                <button type="button" class="btn-close btn-close-white ms-1"
                        (click)="eliminarFiltro(filtro.campo)"></button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./filtros-avanzados.component.css']
})
export class FiltrosAvanzadosComponent implements OnInit {
  @Output() filtrosAplicados = new EventEmitter<FiltrosAvanzados>();
  @Output() exportarSolicitado = new EventEmitter<FiltrosAvanzados>();
  @Input() estadisticas: any = null;

  filtrosForm: FormGroup;
  tabActiva = 'basicos';
  tiposSeleccionados: string[] = [];

  opciones: OpcionesFiltros = {
    clubes: [],
    estadosLicencia: ['ACTIVO', 'INACTIVO', 'PENDIENTE', 'SUSPENDIDO'],
    tipos: ['Jugador', 'Entrenador', 'Dirigente', 'Árbitro', 'Técnico'],
    categorias: ['Infantil', 'Cadete', 'Juvenil', 'Mayor', 'Veterano'],
    categoriasNivel: ['A', 'B', 'C'],
    estadosPago: ['Pendiente', 'Pagado', 'Rechazado', 'Anulado']
  };

  cargandoOpciones = false;

  constructor(
    private fb: FormBuilder,
    private afiliadoService: AfiliadoService,
    private modalService: NgbModal
  ) {
    this.filtrosForm = this.createForm();
  }

  ngOnInit() {
    this.cargarOpcionesFiltros();
    this.configurarFormSubscription();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Datos básicos
      dni: [''],
      apellidoNombre: [''],
      estadoLicencia: [''],
      categoria: [''],
      categoriaNivel: [''],
      fechaNacimientoDesde: [''],
      fechaNacimientoHasta: [''],
      fechaLicenciaDesde: [''],
      fechaLicenciaHasta: [''],

      // Club
      clubId: [''],
      clubNombre: [''],
      estadoAfiliacionClub: [''],

      // Pases
      tienePases: [false],
      fechaPaseDesde: [''],
      fechaPaseHasta: [''],
      clubOrigenPase: [''],
      clubDestinoPase: [''],

      // Pagos
      tienePagos: [false],
      estadoPago: [''],
      montoPagoDesde: [''],
      montoPagoHasta: [''],
      fechaPagoDesde: [''],
      fechaPagoHasta: [''],

      // Credenciales
      tieneCredencial: [false],
      estadoCredencial: [''],

      // Ordenamiento
      sortBy: ['nombreApellido'],
      sortOrder: ['ASC']
    });
  }

  private configurarFormSubscription() {
    this.filtrosForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      // Auto-aplicar filtros después de un delay
      // this.aplicarFiltros();
    });
  }

  private cargarOpcionesFiltros() {
    this.cargandoOpciones = true;

    this.afiliadoService.obtenerOpcionesFiltros().subscribe({
      next: (response: any) => {
        console.log('Opciones de filtros cargadas:', response);
        if (response?.data) {
          // Solo actualizar clubes desde el backend, mantener los demás valores por defecto
          this.opciones.clubes = response.data.clubes || [];

          // Opcional: actualizar otros valores si vienen del backend
          if (response.data.estadosLicencia?.length > 0) {
            this.opciones.estadosLicencia = response.data.estadosLicencia;
          }
          if (response.data.tipos?.length > 0) {
            this.opciones.tipos = response.data.tipos;
          }
          if (response.data.categorias?.length > 0) {
            this.opciones.categorias = response.data.categorias;
          }
          if (response.data.categoriasNivel?.length > 0) {
            this.opciones.categoriasNivel = response.data.categoriasNivel;
          }
          if (response.data.estadosPago?.length > 0) {
            this.opciones.estadosPago = response.data.estadosPago;
          }
        }
        this.cargandoOpciones = false;
      },
      error: (error) => {
        console.error('Error cargando opciones de filtros:', error);
        console.log('Usando valores por defecto para las opciones');
        this.cargandoOpciones = false;
        // Las opciones ya tienen valores por defecto, no necesitamos hacer nada más
      }
    });
  }

  toggleTipo(tipo: string, event: any) {
    if (event.target.checked) {
      this.tiposSeleccionados.push(tipo);
    } else {
      const index = this.tiposSeleccionados.indexOf(tipo);
      if (index > -1) {
        this.tiposSeleccionados.splice(index, 1);
      }
    }
  }

  aplicarFiltros() {
    const filtros: FiltrosAvanzados = {
      ...this.filtrosForm.value,
      tipo: this.tiposSeleccionados.length > 0 ? this.tiposSeleccionados : undefined
    };

    // Limpiar valores vacíos
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
      if (value === '' || value === null || value === false ||
          (Array.isArray(value) && value.length === 0)) {
        delete (filtros as any)[key];
      }
    });

    this.filtrosAplicados.emit(filtros);
  }

  limpiarFiltros() {
    this.filtrosForm.reset({
      sortBy: 'nombreApellido',
      sortOrder: 'ASC'
    });
    this.tiposSeleccionados = [];
    this.aplicarFiltros();
  }

  exportarExcel() {
    const filtros: FiltrosAvanzados = {
      ...this.filtrosForm.value,
      tipo: this.tiposSeleccionados.length > 0 ? this.tiposSeleccionados : undefined
    };

    this.exportarSolicitado.emit(filtros);
  }

  guardarConfiguracion() {
    // Implementar modal para guardar configuración
    console.log('Guardar configuración de filtros');
  }

  contarFiltrosActivos(): number {
    const valores = this.filtrosForm.value;
    let count = 0;

    Object.keys(valores).forEach(key => {
      const value = valores[key];
      if (value && value !== '' && value !== false) {
        count++;
      }
    });

    if (this.tiposSeleccionados.length > 0) {
      count++;
    }

    return count;
  }

  obtenerFiltrosActivos(): Array<{nombre: string, valor: string, campo: string}> {
    const filtros = [];
    const valores = this.filtrosForm.value;

    if (valores.dni) {
      filtros.push({nombre: 'DNI', valor: valores.dni, campo: 'dni'});
    }
    if (valores.apellidoNombre) {
      filtros.push({nombre: 'Nombre', valor: valores.apellidoNombre, campo: 'apellidoNombre'});
    }
    if (valores.estadoLicencia) {
      filtros.push({nombre: 'Estado Licencia', valor: valores.estadoLicencia, campo: 'estadoLicencia'});
    }
    if (this.tiposSeleccionados.length > 0) {
      filtros.push({nombre: 'Tipos', valor: this.tiposSeleccionados.join(', '), campo: 'tipo'});
    }
    // Agregar más filtros según sea necesario...

    return filtros;
  }

  eliminarFiltro(campo: string) {
    if (campo === 'tipo') {
      this.tiposSeleccionados = [];
    } else {
      this.filtrosForm.get(campo)?.setValue('');
    }
    this.aplicarFiltros();
  }
}
