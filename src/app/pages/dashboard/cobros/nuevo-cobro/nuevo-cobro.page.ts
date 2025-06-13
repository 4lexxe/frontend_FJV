import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Club {
  id: number;
  nombre: string;
}

interface TipoComprobante {
  id: number;
  nombre: string;
}

interface Estado {
  id: number;
  nombre: string;
  color: string;
}

@Component({
  selector: 'app-nuevo-cobro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './nuevo-cobro.page.html',
  styleUrls: ['./nuevo-cobro.page.css']
})
export class NuevoCobroPage implements OnInit {
  cobroForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Datos de ejemplo para los select
  clubes: Club[] = [
    { id: 1, nombre: 'Club Atlético' },
    { id: 2, nombre: 'Deportivo Jujuy' },
    { id: 3, nombre: 'Universitario' },
    { id: 4, nombre: 'Club San Pedro' },
    { id: 5, nombre: 'Palermo' },
    { id: 6, nombre: 'Villa San Martín' }
  ];

  tiposComprobante: TipoComprobante[] = [
    { id: 1, nombre: 'Factura A' },
    { id: 2, nombre: 'Factura B' },
    { id: 3, nombre: 'Recibo' },
    { id: 4, nombre: 'Otro' }
  ];

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente', color: 'warning' },
    { id: 2, nombre: 'Pagado', color: 'success' },
    { id: 3, nombre: 'Vencido', color: 'danger' },
    { id: 4, nombre: 'Anulado', color: 'secondary' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    // Obtener la fecha actual en formato yyyy-MM-dd para el campo fecha
    const today = new Date();
    const formattedDate = today.toISOString().substring(0, 10);

    // Calcular fecha de vencimiento por defecto (30 días después)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const formattedDueDate = dueDate.toISOString().substring(0, 10);

    this.cobroForm = this.fb.group({
      monto: ['', [Validators.required, Validators.min(1)]],
      fecha: [formattedDate, Validators.required],
      concepto: ['', [Validators.required, Validators.minLength(5)]],
      idClub: ['', Validators.required],
      estado: ['1', Validators.required], // Por defecto "Pendiente"
      fechaVencimiento: [formattedDueDate, Validators.required],
      tipoComprobante: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.cobroForm.invalid) {
      this.cobroForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulación de envío al servidor
    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessage = 'El cobro ha sido registrado correctamente.';

      // Limpiar el formulario después de 2 segundos
      setTimeout(() => {
        this.initForm();
        this.successMessage = '';
      }, 2000);
    }, 1000);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }

  // Getters para facilitar el acceso a los campos del formulario
  get montoControl() { return this.cobroForm.get('monto'); }
  get fechaControl() { return this.cobroForm.get('fecha'); }
  get conceptoControl() { return this.cobroForm.get('concepto'); }
  get idClubControl() { return this.cobroForm.get('idClub'); }
  get estadoControl() { return this.cobroForm.get('estado'); }
  get fechaVencimientoControl() { return this.cobroForm.get('fechaVencimiento'); }
  get tipoComprobanteControl() { return this.cobroForm.get('tipoComprobante'); }
}
