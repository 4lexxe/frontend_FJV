import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturesComponent } from './components/features/features.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css']
})
export class HomePage {
  // Sin cambios
}
