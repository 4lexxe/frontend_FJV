import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  socialLinks: SocialLink[] = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/federacionjujenavoleyof',
      icon: 'fab fa-facebook-f'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/fjvjujuy/',
      icon: 'fab fa-instagram'
    },
    {
      name: 'Twitter',
      url: 'https://www.twitter.com/fjvoley',
      icon: 'fab fa-twitter'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/federacionjujenyavoley',
      icon: 'fab fa-youtube'
    }
  ];

  footerLinks = [
    { label: 'Inicio', url: '/' },
    { label: 'Quiénes somos', url: '/quienes-somos' },
    { label: 'Torneos', url: '/torneos' },
    { label: 'Noticias', url: '/noticias' },
    { label: 'Calendario', url: '/calendario' },
    { label: 'Contacto', url: '/contacto' }
  ];
}
