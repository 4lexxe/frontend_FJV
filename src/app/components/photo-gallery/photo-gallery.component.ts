import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'vertical' | 'horizontal';
  category: string;
  position: number;
}

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.css']
})
export class PhotoGalleryComponent {
  selectedImage: GalleryItem | null = null;

  galleryItems: GalleryItem[] = [
    {
      id: 1,
      image: 'images/noticia.png',
      title: 'Torneo Provincial 2024',
      size: 'large',
      category: 'Torneos',
      position: 1
    },
    {
      id: 2,
      image: 'images/noticia.png',
      title: 'Club Universitario vs. Palermo',
      size: 'vertical',
      category: 'Partidos',
      position: 3
    },
    {
      id: 3,
      image: 'images/noticia.png',
      title: 'Selección Juvenil',
      size: 'horizontal',
      category: 'Equipos',
      position: 4
    },
    {
      id: 4,
      image: 'images/noticia.png',
      title: 'Entrenamiento Sub-16',
      size: 'small',
      category: 'Entrenamientos',
      position: 2
    },
    {
      id: 5,
      image: 'images/noticia.png',
      title: 'Copa Jujuy 2025',
      size: 'medium',
      category: 'Eventos',
      position: 5
    },
    {
      id: 6,
      image: 'images/noticia.png',
      title: 'Voleibol Playa Jujuy',
      size: 'small',
      category: 'Beach Volley',
      position: 6
    }
  ];

  get sortedGalleryItems(): GalleryItem[] {
    return [...this.galleryItems].sort((a, b) => a.position - b.position);
  }

  openImage(item: GalleryItem): void {
    this.selectedImage = item;
  }

  closeImage(): void {
    this.selectedImage = null;
  }
}
