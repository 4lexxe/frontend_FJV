// src/app/services/afiliado.service.ts
import { Injectable } from '@angular/core';
import { Afiliado } from '../interfaces/afiliado.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AfiliadoService {
  private afiliados: Afiliado[] = [];
  private afiliados$ = new BehaviorSubject<Afiliado[]>([]);

  constructor() {
    // SOLO PARA PRUEBAS: precargar afiliados al iniciar la app
    this.precargarAfiliados();
  }

  agregarAfiliado(afiliado: Afiliado): void {
    afiliado.fechaAlta = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    //afiliado.qr = `QR-${afiliado.dni}`; // QR simulado
    this.afiliados.push(afiliado);
    this.afiliados$.next([...this.afiliados]); 
  }

  obtenerAfiliados(): Observable<Afiliado[]> {
    return this.afiliados$.asObservable();
  }

  buscarPorDNI(dni: number): Afiliado | undefined {
    return this.afiliados.find(a => a.dni === dni);
  }

  private precargarAfiliados(): void {
    const ejemplo: Afiliado[] = [
      {
        numeroAfiliacion: 1,
        apellidoNombre: 'Juan Pérez',
        dni: 12345678,
        fechaNacimiento: '2000-06-15',
        tipoAfiliacion: 'FJV',
        categoria1: 'Jugador',
        categoria2: 'Sub20',
        categoria3: 'Liga',
        club: 'Club Atletico Gorriti',
        pase: 'Proveniente',
        fechaAlta: new Date().toISOString().split('T')[0],
        clubDestino: '',
        fechaPase: '',
      },
      {
        numeroAfiliacion: 2,
        apellidoNombre: 'Lucía Gómez',
        dni: 23456789,
        fechaNacimiento: '2005-03-22',
        tipoAfiliacion: 'FEVA',
        categoria1: 'Entrenadora',
        categoria2: 'Sub16',
        categoria3: 'Selección',
        club: 'Club Altos Hornos Zapla',
        pase: 'Habilitacion',
        fechaAlta: new Date().toISOString().split('T')[0],
        clubDestino: '',
        fechaPase: '',
      }
    ];

    this.afiliados = ejemplo;
    this.afiliados$.next(this.afiliados);
  }
}
