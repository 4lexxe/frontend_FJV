import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Club } from '../../../../interfaces/club.interface';

@Component({
  selector: 'app-formulario-club',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './formulario-club.component.html',
  styleUrls: ['./formulario-club.component.css']
})
export class FormularioClubComponent implements OnInit, OnChanges {
  @Input() clubParaEditar: Club | null = null;
  @Output() guardarClub = new EventEmitter<Club>();

  clubForm!: FormGroup;
  estadoAfiliacionOpciones = ['Activo', 'Inactivo', 'Pendiente'];

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clubParaEditar'] && this.clubParaEditar) {
      this.setFormValues(this.clubParaEditar);
    } else if (changes['clubParaEditar'] && !this.clubParaEditar) {
      this.cancelarEdicion();
    }
  }

  initForm(): void {
    this.clubForm = this.fb.group({
      idClub: [null],
      nombre: ['', Validators.required],
      direccion: [''],
      telefono: [''],
      email: ['', Validators.email],
      cuit: ['', [Validators.pattern(/^\d{11}$/)]],
      fechaAfiliacion: ['', Validators.required],
      estadoAfiliacion: ['Activo', Validators.required]
    });
  }

  setFormValues(club: Club): void {
    const fecha = club.fechaAfiliacion ? new Date(club.fechaAfiliacion) : null;
    const ngbDate: NgbDateStruct | null = fecha ? { year: fecha.getFullYear(), month: fecha.getMonth() + 1, day: fecha.getDate() } : null;

    this.clubForm.patchValue({ ...club, fechaAfiliacion: ngbDate });
  }

  onGuardar(): void {
    if (this.clubForm.invalid) {
      this.clubForm.markAllAsTouched();
      alert('Por favor, complete todos los campos obligatorios y válidos.');
      return;
    }
    this.guardarClub.emit(this.clubForm.value);
  }

  cancelarEdicion(): void {
    this.clubParaEditar = null;
    this.clubForm.reset({
      estadoAfiliacion: 'Activo',
      idClub: null
    });
  }
}

