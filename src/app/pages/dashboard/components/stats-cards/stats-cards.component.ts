import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardStats {
  totalCobros: number;
  cobrosPendientes: number;
  cobrosVencidos: number;
  totalRecaudado: number;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css']
})
export class StatsCardsComponent {
  @Input() statistics!: DashboardStats;
}
