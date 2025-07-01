import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contacto } from '../interfaces/contacto.interface';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private baseUrl = 'http://localhost:3000/api/contacto';

  constructor(private http: HttpClient) {}

  obtenerContacto(): Observable<Contacto> {
    return this.http.get<Contacto>(this.baseUrl);
  }

  actualizarContacto(contacto: Contacto): Observable<any> {
    return this.http.put(this.baseUrl, contacto);
  }
}
