// src/app/services/afiliado.service.ts
import { Injectable } from '@angular/core';
import { Afiliado } from '../interfaces/afiliado.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AfiliadoService {
  private afiliados: Afiliado[] = [];
  private afiliados$ = new BehaviorSubject<Afiliado[]>([]);

  agregarAfiliado(afiliado: Afiliado): void {
    this.afiliados.push(afiliado);
    this.afiliados$.next(this.afiliados);
  }

  obtenerAfiliados(): Observable<Afiliado[]> {
    return this.afiliados$.asObservable();
  }

  buscarPorDNI(dni: number): Afiliado | undefined {
    return this.afiliados.find(a => a.dni === dni);
  }
}
