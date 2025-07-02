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
  ];

  footerLinks = [
    { label: 'Inicio', url: '/' },
    { label: 'Noticias', url: '/noticias' },
    { label: 'Contacto', url: '/contacto' }
  ];
}
