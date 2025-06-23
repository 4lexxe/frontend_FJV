import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Club } from '../../../../interfaces/club.interface';

@Component({
  selector: 'app-listado-clubes',
  standalone: true,
  imports: [CommonModule, DatePipe, NgbModalModule],
  templateUrl: './listado-clubes.component.html',
  styleUrls: ['./listado-clubes.component.css']
})
export class ListadoClubesComponent {
  @Input() clubes: Club[] = [];
  @Output() editar = new EventEmitter<Club>();
  @Output() eliminar = new EventEmitter<Club>();

  clubParaEliminar: Club | null = null;

  constructor(private modalService: NgbModal) {}

  onEditar(club: Club): void {
    this.editar.emit(club);
  }

  // Abre el modal de confirmación de eliminación
  onEliminar(content: any, club: Club): void { // 'content' es la referencia al ng-template del modal
    this.clubParaEliminar = club;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.confirmarEliminacion();
        }
      },
      (reason) => { /* Modal cerrado sin confirmar */ }
    );
  }

  confirmarEliminacion(): void {
    if (this.clubParaEliminar) {
      this.eliminar.emit(this.clubParaEliminar);
      this.clubParaEliminar = null;
    }
  }
}
