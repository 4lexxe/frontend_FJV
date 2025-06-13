import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuCollapsed = true;
  // Simulación de estado de autenticación (conectar con servicio real en el futuro)
  isAuthenticated = false;
  userProfile = {
    name: 'Usuario Demo',
    image: 'images/avatar-default.png',
    role: 'Miembro'
  };
  isUserMenuOpen = false;

  // Flag para indicar error en la carga de la imagen
  imageLoadError = false;

  ngOnInit(): void {
    // Verificar si hay información de autenticación en localStorage al cargar
    this.checkAuthStatus();

    // Suscribirse a cambios en localStorage
    window.addEventListener('storage', () => {
      this.checkAuthStatus();
    });
  }

  checkAuthStatus(): void {
    const auth = localStorage.getItem('auth_demo');
    if (auth) {
      this.isAuthenticated = true;
      try {
        this.userProfile = JSON.parse(auth);
      } catch (e) {
        console.error('Error parsing auth data', e);
      }
    } else {
      this.isAuthenticated = false;
    }
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    // Eliminar info de localStorage
    localStorage.removeItem('auth_demo');
    this.isAuthenticated = false;
    this.isUserMenuOpen = false;

    // Notificar a otros componentes
    window.dispatchEvent(new Event('storage'));
  }

  // Método para manejar errores de carga de imagen
  handleImageError() {
    this.imageLoadError = true;
  }
}
