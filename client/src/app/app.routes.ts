import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
import { Habits } from './pages/habits/habits';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Habits, canActivate: [authGuard], title: 'Mis Hábitos' },
  { path: 'login', component: Login, canActivate: [guestGuard], title: 'Iniciar sesión · Mis Hábitos' },
  { path: '**', redirectTo: '' },
];
