import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-buscador-afiliado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscador-afiliado.component.html',
})
export class BuscadorAfiliadoComponent {
  @Output() buscarDNI = new EventEmitter<number>(); // 👈 nombre ahora coincide con el del padre

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    });
  }

  get dni() {
    return this.form.get('dni');
  }

  onBuscar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dniValue = Number(this.form.value.dni);
    this.buscarDNI.emit(dniValue); // 👈 emitís el número
  }
}
