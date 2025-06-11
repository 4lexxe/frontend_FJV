import { Component } from '@angular/core';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { FeaturesComponent } from './components/features/features.component';
import { NewsCarouselComponent } from '../../components/news-carousel/news-carousel.component';
import { RecentResultsComponent } from '../../components/recent-results/recent-results.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeroBannerComponent,
    NewsCarouselComponent,
    FeaturesComponent,
    RecentResultsComponent
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css']
})
export class HomePage {}
