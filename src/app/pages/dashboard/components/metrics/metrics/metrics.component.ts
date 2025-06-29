import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-metrics',
  imports: [CommonModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css',
})
export class MetricsComponent implements OnChanges {
  @Input() metricas!: {
    resumenTotales: { fjv: number; feva: number; total: number };
    // Renombrado 'categorias' a 'tipos' para mayor claridad
    tipos: { tipo: string; cantidad: string }[];
    afiliadosPorClub: { nombreClub: string; totalAfiliados: string }[];
  };

  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef;
  // Si el gráfico de donut ahora muestra tipos, quizás quieras renombrar esta referencia
  @ViewChild('doughnutChartCanvas') doughnutChartCanvas!: ElementRef;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;

  viewReady = false;
  private chartInstances: any[] = []; // Para almacenar las instancias de los gráficos

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRenderCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metricas'] && this.metricas) {
      this.tryRenderCharts();
    }
  }

  private tryRenderCharts(): void {
    if (!this.viewReady || !this.metricas) return;

    // Destruir instancias de gráficos anteriores para evitar duplicados/errores
    this.destroyCharts();

    // Pie chart (FJV/FEVA)
    // Asegúrate de que los datos de resumenTotales siempre estén disponibles si quieres mostrar este gráfico.
    // O añade un *ngIf condicional en el HTML para el canvas del pieChart.
    if (this.metricas.resumenTotales) {
      this.renderPieChart();
    }

    // Doughnut chart (tipos)
    // Cambiado de 'categorias' a 'tipos' para la condición
    if (this.metricas.tipos?.length > 0) {
      this.renderDoughnutChart();
    }

    // Bar chart (clubes)
    if (this.metricas.afiliadosPorClub?.length > 0) {
      this.renderBarChart();
    }
  }

  private destroyCharts(): void {
    this.chartInstances.forEach((chart) => {
      if (chart) {
        chart.destroy();
      }
    });
    this.chartInstances = [];
  }

  private renderPieChart(): void {
    // Es buena práctica verificar si el nativeElement está disponible antes de usarlo
    if (!this.pieChartCanvas?.nativeElement) {
      console.warn('Canvas para el gráfico de pie no disponible.');
      return;
    }
    const chart = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['FJV', 'FEVA'],
        datasets: [
          {
            data: [
              this.metricas.resumenTotales.fjv,
              this.metricas.resumenTotales.feva,
            ],
            backgroundColor: ['#36A2EB', '#FF6384'],
          },
        ],
      },
      options: {
        responsive: true, // Hacer el gráfico responsive
        maintainAspectRatio: false, // No mantener el aspect ratio fijo
      },
    });
    this.chartInstances.push(chart);
  }

  private renderDoughnutChart(): void {
    // Es buena práctica verificar si el nativeElement está disponible antes de usarlo
    if (!this.doughnutChartCanvas?.nativeElement) {
      console.warn('Canvas para el gráfico de donut no disponible.');
      return;
    }

    // **CAMBIO CRUCIAL:** Usar 'c.tipo' en lugar de 'c.categoria'
    const labels = this.metricas.tipos.map(
      (c) => c.tipo || 'Sin tipo' // Etiqueta por defecto 'Sin tipo' si el campo 'tipo' es nulo/vacío
    );
    const data = this.metricas.tipos.map((c) => parseInt(c.cantidad));

    const chart = new Chart(this.doughnutChartCanvas.nativeElement, {
      type: 'doughnut', // Tipo de gráfico: donut
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              '#FF6384', // Rojo claro
              '#36A2EB', // Azul claro
              '#FFCE56', // Amarillo
              '#4BC0C0', // Verde turquesa
              '#9966FF', // Púrpura
              '#FF9F40', // Naranja
              '#C9CBCE', // Gris (añadido por si hay más de 5 tipos)
            ],
            borderColor: [
              // Opcional: añade bordes para mejor distinción
              '#FFFFFF',
              '#FFFFFF',
              '#FFFFFF',
              '#FFFFFF',
              '#FFFFFF',
              '#FFFFFF',
              '#FFFFFF',
            ],
            borderWidth: 2, // Ancho de los bordes
          },
        ],
      },
      options: {
        responsive: true, // Hacer el gráfico responsive
        maintainAspectRatio: false, // No mantener el aspect ratio fijo
        plugins: {
          title: {
            display: true,
            text: 'Cantidad de Personas por Tipo', // Título descriptivo
            font: {
              size: 16,
            },
          },
          legend: {
            position: 'top', // Posición de la leyenda
          },
        },
      },
    });
    this.chartInstances.push(chart);
  }

  private renderBarChart(): void {
    // Es buena práctica verificar si el nativeElement está disponible antes de usarlo
    if (!this.barChartCanvas?.nativeElement) {
      console.warn('Canvas para el gráfico de barras no disponible.');
      return;
    }
    const labels = this.metricas.afiliadosPorClub.map((c) => c.nombreClub);
    const data = this.metricas.afiliadosPorClub.map((c) =>
      parseInt(c.totalAfiliados)
    );
    const chart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Afiliados por Club',
            data,
            backgroundColor: '#36A2EB',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Afiliados por Club',
            font: {
              size: 16,
            },
          },
          legend: {
            display: false, // Usualmente la leyenda no es tan relevante en barras si hay una sola serie
          },
        },
      },
    });
    this.chartInstances.push(chart);
  }

  // Renombrada la función para mayor claridad, aunque el HTML aún usa 'isCategoriasAvailable'
  isTiposAvailable(): boolean {
    return !!this.metricas?.tipos?.length;
  }

  isAfiliadosPorClubAvailable(): boolean {
    return !!this.metricas?.afiliadosPorClub?.length;
  }
}
