import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  imageUrl: string;
  date: string;
  category: string;
}

@Component({
  selector: 'app-news-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './news-carousel.component.html',
  styleUrls: ['./news-carousel.component.css']
})
export class NewsCarouselComponent implements OnInit {
  newsItems: NewsItem[] = [];
  activeSlideIndex = 0;
  animationClass = 'animate__fadeIn';
  itemsPerView = 4;
  Math = Math;

  @HostListener('window:resize')
  onResize(): void {
    this.updateItemsPerView();
  }

  ngOnInit(): void {
    this.loadNewsData();
    this.updateItemsPerView();
  }

  private updateItemsPerView(): void {
    const width = window.innerWidth;
    this.itemsPerView = width < 576 ? 1 : width < 992 ? 2 : 4;
  }

  private loadNewsData(): void {
    this.newsItems = [
      {
        id: 1,
        title: 'Brian Impellizzeri brilló en Suiza y reafirmó su liderazgo mundial',
        summary: 'El atleta paralímpico jujeño logró un impresionante primer puesto en la competencia internacional',
        imageUrl: 'images/noticia.png',
        date: '10 Jun 2025',
        category: 'Atletas'
      },
      {
        id: 2,
        title: 'Murciélagos y Murciélagas: orgullo argentino en el fútbol para ciegos',
        summary: 'El equipo nacional conquistó el campeonato con una actuación destacada de los jugadores jujeños',
        imageUrl: 'images/noticia2.png',
        date: '5 Jun 2025',
        category: 'Inclusión'
      },
      {
        id: 3,
        title: 'La historia de Pablo Cingolani: del abismo al podio con la fuerza de la voluntad',
        summary: 'El deportista jujeño superó todas las adversidades para lograr un lugar en el podio nacional',
        imageUrl: 'images/noticia.png',
        date: '1 Jun 2025',
        category: 'Inspiración'
      },
      {
        id: 4,
        title: 'Juegos Binacionales',
        summary: 'Jujuy representará a Argentina en los próximos juegos de voleibol internacional',
        imageUrl: 'images/noticia2.png',
        date: '29 May 2025',
        category: 'Internacional'
      },
      {
        id: 5,
        title: 'Ampliación de Liga Provincial',
        summary: 'La liga provincial sumará dos nuevas categorías para la temporada 2026',
        imageUrl: 'images/noticia.png',
        date: '25 May 2025',
        category: 'Liga'
      },
      {
        id: 6,
        title: 'Beach Volley en Jujuy',
        summary: 'Se inaugura circuito provincial de vóley playa con 6 fechas en diferentes localidades',
        imageUrl: 'images/noticia2.png',
        date: '20 May 2025',
        category: 'Beach Volley'
      }
    ];
  }

  nextSlide(): void {
    if (this.showNextButton) {
      this.animationClass = 'animate__fadeInRight';
      this.activeSlideIndex++;
    }
  }

  prevSlide(): void {
    if (this.showPrevButton) {
      this.animationClass = 'animate__fadeInLeft';
      this.activeSlideIndex--;
    }
  }

  goToPage(pageIndex: number): void {
    this.activeSlideIndex = pageIndex * this.itemsPerView;
    this.animationClass = pageIndex > this.currentPage ? 'animate__fadeInRight' :
                          pageIndex < this.currentPage ? 'animate__fadeInLeft' :
                          'animate__fadeIn';
  }

  get currentPage(): number {
    return Math.floor(this.activeSlideIndex / this.itemsPerView);
  }

  get visibleNews(): NewsItem[] {
    return this.newsItems.slice(this.activeSlideIndex, this.activeSlideIndex + this.itemsPerView);
  }

  get showNextButton(): boolean {
    return this.activeSlideIndex < this.newsItems.length - this.itemsPerView;
  }

  get showPrevButton(): boolean {
    return this.activeSlideIndex > 0;
  }

  getPageIndicators(): number[] {
    const pageCount = Math.ceil((this.newsItems.length - this.itemsPerView + 1) / this.itemsPerView);
    return Array.from({ length: pageCount }, (_, i) => i);
  }
}
