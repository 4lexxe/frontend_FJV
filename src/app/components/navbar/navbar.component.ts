import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isMenuCollapsed = true;
  // Simulación de estado de autenticación (conectar con servicio real en el futuro)
  isAuthenticated = false;
  userProfile = {
    name: 'Usuario Demo',
    image: 'images/avatar-default.png',
    role: 'Miembro'
  };
  isUserMenuOpen = false;

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    // Lógica para cerrar sesión
    this.isAuthenticated = false;
    // Redireccionar al home o login
  }
}
