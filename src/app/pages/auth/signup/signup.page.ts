import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.css']
})
export class SignupPage {
  signupForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator para confirmar que las contraseñas coinciden
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Simulación de registro exitoso
    setTimeout(() => {
      this.isSubmitting = false;

      // Para fines de demostración, registramos al usuario y lo autenticamos directamente
      const demoUser = {
        name: this.signupForm.get('name')?.value,
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

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  // Getters para facilitar el acceso a los campos del formulario en el template
  get nameControl() { return this.signupForm.get('name'); }
  get emailControl() { return this.signupForm.get('email'); }
  get passwordControl() { return this.signupForm.get('password'); }
  get confirmPasswordControl() { return this.signupForm.get('confirmPassword'); }
  get termsControl() { return this.signupForm.get('termsAccepted'); }

  get passwordsMatch(): boolean {
    return this.signupForm.get('password')?.value === this.signupForm.get('confirmPassword')?.value;
  }
}
