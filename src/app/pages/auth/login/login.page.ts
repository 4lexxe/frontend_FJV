import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Simulación de login exitoso
    setTimeout(() => {
      this.isSubmitting = false;

      // Para fines de demostración, siempre autenticamos al usuario
      const email = this.loginForm.get('email')?.value;
      const demoUser = {
        name: email.split('@')[0], // Usar parte del email como nombre
        image: 'images/avatar-default.png',
        role: 'Miembro'
      };

      // Guardar en localStorage para simular persistencia
      localStorage.setItem('auth_demo', JSON.stringify(demoUser));

      // Notificar a otros componentes (como el navbar)
      window.dispatchEvent(new Event('storage'));

      // Redirigir al home
      this.router.navigate(['/']);
    }, 1000);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Getters para facilitar el acceso a los campos del formulario en el template
  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
}
