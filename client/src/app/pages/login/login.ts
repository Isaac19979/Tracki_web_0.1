import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { AuthService } from '../../core/auth.service';

const ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de terminar.',
  'auth/too-many-requests': 'Demasiados intentos. Prueba de nuevo en unos minutos.',
};

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly registering = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected google() {
    this.run(() => this.auth.signInWithGoogle());
  }

  protected submit() {
    this.run(() =>
      this.registering()
        ? this.auth.registerWithEmail(this.email, this.password)
        : this.auth.signInWithEmail(this.email, this.password),
    );
  }

  protected toggleMode() {
    this.registering.update((r) => !r);
    this.error.set('');
  }

  private async run(action: () => Promise<unknown>) {
    this.loading.set(true);
    this.error.set('');
    try {
      await action();
      await this.router.navigateByUrl('/');
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : '';
      this.error.set(ERRORS[code] ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}
