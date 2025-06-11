import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      title: 'Torneos Provinciales',
      description: 'Organizamos torneos en todas las categorías, promoviendo la competencia a nivel provincial y regional.',
      icon: 'fas fa-trophy'
    },
    {
      title: 'Selecciones Provinciales',
      description: 'Formamos y preparamos las selecciones de Jujuy para representar a nuestra provincia en torneos nacionales.',
      icon: 'fas fa-users'
    },
    {
      title: 'Capacitación Deportiva',
      description: 'Ofrecemos cursos para jugadores, entrenadores y árbitros para mantener el alto nivel del voley jujeño.',
      icon: 'fas fa-graduation-cap'
    }
  ];
}
