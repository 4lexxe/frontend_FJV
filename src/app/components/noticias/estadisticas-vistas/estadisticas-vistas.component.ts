import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { VistasNoticiaService } from '../../../services/vistas-noticia.service';
import { IPGuideService } from '../../../services/ip-guide.service';
import { AuthService } from '../../../services/auth.service';
import { NoticiaVista } from '../../../models/ip-guide.model';

@Component({
  selector: 'app-estadisticas-vistas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Solo mostrar si el usuario es administrador -->
    <div class="estadisticas-container" *ngIf="isAdmin">
      <h3>Estadísticas de Vistas</h3>

      <!-- Mensaje informativo cuando se usan datos de localStorage -->
      <div *ngIf="usandoLocalStorage" class="alert alert-warning" style="margin-bottom: 20px;">
        <i class="fas fa-info-circle me-2"></i>
        <strong>Modo offline:</strong> Mostrando datos almacenados localmente.
        Las estadísticas detalladas estarán disponibles cuando el backend esté conectado.
      </div>

      <!-- Resumen general -->
      <div class="resumen-stats">
        <div class="stat-card">
          <div class="stat-number">{{ totalVistas }}</div>
          <div class="stat-label">Total de Vistas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ paisesUnicos }}</div>
          <div class="stat-label">Países</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ asnsUnicos }}</div>
          <div class="stat-label">Proveedores</div>
        </div>
      </div>

      <!-- Estadísticas por país -->
      <div class="stats-section" *ngIf="estadisticasPais.length > 0">
        <h4>Vistas por País</h4>
        <div class="stats-list">
          <div class="stat-item" *ngFor="let stat of estadisticasPais">
            <div class="stat-info">
              <span class="stat-name">{{ stat.pais }}</span>
              <span class="stat-count">{{ stat.cantidad }} vistas</span>
            </div>
            <div class="stat-bar">
              <div class="stat-progress" [style.width.%]="getPorcentaje(stat.cantidad, totalVistas)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas por ASN -->
      <div class="stats-section" *ngIf="estadisticasASN.length > 0">
        <h4>Vistas por Proveedor (ASN)</h4>
        <div class="stats-list">
          <div class="stat-item" *ngFor="let stat of estadisticasASN">
            <div class="stat-info">
              <span class="stat-name">{{ stat.asn }}</span>
              <span class="stat-count">{{ stat.cantidad }} vistas</span>
            </div>
            <div class="stat-bar">
              <div class="stat-progress" [style.width.%]="getPorcentaje(stat.cantidad, totalVistas)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista detallada de vistas -->
      <div class="stats-section" *ngIf="vistas.length > 0">
        <h4>Vistas Detalladas</h4>
        <div class="vistas-list">
          <div class="vista-item" *ngFor="let vista of vistas; let i = index">
            <div class="vista-info">
              <div class="vista-id">Visitante #{{ i + 1 }}</div>
              <div class="vista-location" *ngIf="getLocationDisplay(vista)">
                {{ getLocationDisplay(vista) }}
              </div>
              <div class="vista-asn" *ngIf="getASNDisplay(vista)">
                {{ getASNDisplay(vista) }}
              </div>
            </div>
            <div class="vista-date">
              {{ vista.createdAt | date:'dd/MM/yyyy HH:mm' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div class="loading" *ngIf="loading">
        <p>Cargando estadísticas...</p>
      </div>

      <!-- Error -->
      <div class="error" *ngIf="error">
        <p>Error: {{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .estadisticas-container {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 20px 0;
    }

    .estadisticas-container h3 {
      color: #333;
      margin-bottom: 20px;
      font-size: 1.5rem;
    }

    .resumen-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .stats-section {
      margin-bottom: 30px;
    }

    .stats-section h4 {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.2rem;
    }

    .stats-list {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-item {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-name {
      font-weight: 500;
      color: #333;
    }

    .stat-count {
      color: #666;
      font-size: 0.9rem;
    }

    .stat-bar {
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
    }

    .stat-progress {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .vistas-list {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .vista-item {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .vista-item:last-child {
      border-bottom: none;
    }

    .vista-info {
      flex: 1;
    }

    .vista-id {
      font-weight: 500;
      color: #333;
      margin-bottom: 5px;
    }

    .vista-location,
    .vista-asn {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 2px;
    }

    .vista-date {
      color: #999;
      font-size: 0.8rem;
      text-align: right;
    }

    .loading,
    .error {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .error {
      color: #dc3545;
    }

    @media (max-width: 768px) {
      .resumen-stats {
        grid-template-columns: 1fr;
      }

      .vista-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .vista-date {
        text-align: left;
      }
    }
  `]
})
export class EstadisticasVistasComponent implements OnInit, OnDestroy {
  @Input() noticiaId!: number;

  vistas: NoticiaVista[] = [];
  estadisticasPais: any[] = [];
  estadisticasASN: any[] = [];
  totalVistas = 0;
  paisesUnicos = 0;
  asnsUnicos = 0;
  loading = false;
  error = '';
  isAdmin = false;
  usandoLocalStorage = false;

  private subscriptions = new Subscription();

  constructor(
    public vistasNoticiaService: VistasNoticiaService,
    public ipGuideService: IPGuideService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    this.subscriptions.add(
      this.authService.isAdmin$.subscribe(isAdmin => {
        this.isAdmin = isAdmin;
        // Solo cargar estadísticas si es admin y hay noticiaId
        if (isAdmin && this.noticiaId) {
          this.cargarEstadisticas();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarEstadisticas(): void {
    this.loading = true;
    this.error = '';

    // Cargar vistas con información de IP
    const vistasSub = this.vistasNoticiaService.getVistasConInfoIP(this.noticiaId)
      .subscribe({
        next: (vistas) => {
          this.vistas = vistas;
          this.totalVistas = vistas.length;
          this.calcularEstadisticas();
          this.loading = false;

          // Si no hay vistas del backend, intentar con localStorage
          if (vistas.length === 0) {
            this.cargarEstadisticasLocalStorage();
          }
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          // Si falla el backend, usar localStorage
          this.cargarEstadisticasLocalStorage();
        }
      });

    // Cargar estadísticas por país
    const paisSub = this.vistasNoticiaService.getEstadisticasPorPais(this.noticiaId)
      .subscribe({
        next: (stats) => {
          this.estadisticasPais = stats;
          this.paisesUnicos = stats.length;
        },
        error: (error) => {
          console.error('Error cargando estadísticas por país:', error);
        }
      });

    // Cargar estadísticas por ASN
    const asnSub = this.vistasNoticiaService.getEstadisticasPorASN(this.noticiaId)
      .subscribe({
        next: (stats) => {
          this.estadisticasASN = stats;
          this.asnsUnicos = stats.length;
        },
        error: (error) => {
          console.error('Error cargando estadísticas por ASN:', error);
        }
      });

    this.subscriptions.add(vistasSub);
    this.subscriptions.add(paisSub);
    this.subscriptions.add(asnSub);
  }

  /**
   * Carga estadísticas básicas desde localStorage
   */
  private cargarEstadisticasLocalStorage(): void {
    const STORAGE_KEY = 'noticia_vistas';

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const todasLasVistas = JSON.parse(stored);
        const vistasDeEstaNoticia = todasLasVistas.filter((v: any) => v.noticiaId === this.noticiaId);

        this.vistas = vistasDeEstaNoticia;
        this.totalVistas = vistasDeEstaNoticia.length;
        this.usandoLocalStorage = true;

        // Calcular estadísticas básicas
        this.calcularEstadisticasBasicas(vistasDeEstaNoticia);

        console.log('Estadísticas cargadas desde localStorage:', {
          totalVistas: this.totalVistas,
          paisesUnicos: this.paisesUnicos,
          asnsUnicos: this.asnsUnicos
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas desde localStorage:', error);
    }
  }

  /**
   * Calcula estadísticas básicas desde localStorage
   */
  private calcularEstadisticasBasicas(vistas: any[]): void {
    // Contar IPs únicas
    const ipsUnicas = new Set(vistas.map(v => v.ip));
    this.asnsUnicos = ipsUnicas.size;

    // Para localStorage, no tenemos información de país, así que mostramos "Desconocido"
    this.paisesUnicos = 1;
    this.estadisticasPais = [{
      pais: 'Desconocido (localStorage)',
      cantidad: vistas.length
    }];

    this.estadisticasASN = [{
      asn: `IPs únicas: ${ipsUnicas.size}`,
      cantidad: vistas.length
    }];
  }

  private calcularEstadisticas(): void {
    // Calcular países únicos
    const paises = new Set();
    this.vistas.forEach(vista => {
      if (vista.ipInfo?.ubicacion?.pais) {
        paises.add(vista.ipInfo.ubicacion.pais);
      }
    });
    this.paisesUnicos = paises.size;

    // Calcular ASNs únicos
    const asns = new Set();
    this.vistas.forEach(vista => {
      if (vista.ipInfo?.red?.sistemaAutonomo?.nombre) {
        asns.add(vista.ipInfo.red.sistemaAutonomo.nombre);
      }
    });
    this.asnsUnicos = asns.size;
  }

  getPorcentaje(cantidad: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((cantidad / total) * 100);
  }

  getLocationDisplay(vista: NoticiaVista): string | null {
    if (vista.ipInfo?.ubicacion) {
      return this.ipGuideService.formatLocationDisplay(vista.ipInfo.ubicacion);
    }
    return null;
  }

  getASNDisplay(vista: NoticiaVista): string | null {
    if (vista.ipInfo?.red?.sistemaAutonomo) {
      return this.ipGuideService.formatASNDisplay(vista.ipInfo.red.sistemaAutonomo);
    }
    return null;
  }
}
