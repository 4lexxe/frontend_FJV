// modal-edicion-lista.component.ts
import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-modal-edicion-lista',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Editar {{ titulo }}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <ul class="list-group mb-2">
        <li *ngFor="let item of lista; let i = index" class="list-group-item d-flex justify-content-between">
          <input [(ngModel)]="lista[i]" class="form-control me-2" />
          <button class="btn btn-danger btn-sm" (click)="eliminar(i)">
            <i class="fa fa-trash"></i>
          </button>
        </li>
      </ul>
      <input [(ngModel)]="nuevoItem" class="form-control" placeholder="Nuevo valor..." />
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" (click)="activeModal.dismiss()">Cancelar</button>
      <button class="btn btn-primary" (click)="agregar()">Agregar</button>
      <button class="btn btn-success" (click)="guardar()">Guardar</button>
    </div>
  `,
})
export class ModalEdicionListaComponent {
  @Input() lista: string[] = [];
  @Input() titulo: string = '';

  nuevoItem: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  agregar() {
    const valor = this.nuevoItem.trim();
    if (valor && !this.lista.includes(valor)) {
      this.lista.push(valor);
      this.nuevoItem = '';
    }
  }

  eliminar(index: number) {
    this.lista.splice(index, 1);
  }

  guardar() {
    this.activeModal.close(this.lista);
  }
}
