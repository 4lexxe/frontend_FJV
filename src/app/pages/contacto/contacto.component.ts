import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../services/contacto.service';
import { Contacto } from '../../interfaces/contacto.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {
  contacto: Contacto = {
    direccion: '',
    telefono: '',
    email: '',
    horarios: '',
    facebook: '',
    instagram: ''
  };

  isAdmin = false;

  constructor(
    private contactoService: ContactoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(['admin']);
    this.contactoService.obtenerContacto().subscribe({
      next: (data) => {
        this.contacto = data;
      },
      error: (err) => console.error('Error cargando contacto:', err)
    });
  }

  guardarCambios(): void {
    this.contactoService.actualizarContacto(this.contacto).subscribe({
      next: () => alert('Contacto actualizado correctamente'),
      error: (err) => console.error('Error guardando contacto:', err)
    });
  }

  getFacebookUrl(usernameOrUrl: string): string {
    return usernameOrUrl.startsWith('http') ? usernameOrUrl : `https://facebook.com/${usernameOrUrl}`;
  }

  getInstagramUrl(usernameOrUrl: string): string {
    return usernameOrUrl.startsWith('http') ? usernameOrUrl : `https://instagram.com/${usernameOrUrl}`;
  }
}