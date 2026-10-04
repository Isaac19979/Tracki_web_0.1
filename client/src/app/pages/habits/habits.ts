import { Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Frequency, Habit, HabitsService } from '../../core/habits.service';

const SECTIONS: { frequency: Frequency; title: string; period: string; unit: [string, string] }[] = [
  { frequency: 'daily', title: 'Diarias', period: 'Hoy', unit: ['día', 'días'] },
  { frequency: 'weekly', title: 'Semanales', period: 'Esta semana', unit: ['semana', 'semanas'] },
  { frequency: 'monthly', title: 'Mensuales', period: 'Este mes', unit: ['mes', 'meses'] },
];

@Component({
  selector: 'app-habits',
  imports: [FormsModule],
  templateUrl: './habits.html',
  styleUrl: './habits.scss',
})
export class Habits implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly habitsService = inject(HabitsService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected newTitle = '';
  protected newFrequency: Frequency = 'daily';

  protected readonly editingId = signal<string | null>(null);
  private readonly editInput = viewChild<ElementRef<HTMLInputElement>>('editInput');

  constructor() {
    effect(() => this.editInput()?.nativeElement.select());
  }

  protected readonly sections = computed(() =>
    SECTIONS.map((s) => ({
      ...s,
      habits: this.habitsService.habits().filter((h) => h.frequency === s.frequency),
    })),
  );

  async ngOnInit() {
    await this.run(() => this.habitsService.load());
    this.loading.set(false);
  }

  protected add() {
    const title = this.newTitle.trim();
    if (!title) return;
    this.run(async () => {
      await this.habitsService.add(title, this.newFrequency);
      this.newTitle = '';
    });
  }

  protected toggle(habit: Habit) {
    this.run(() => this.habitsService.toggle(habit.id));
  }

  protected startEdit(habit: Habit) {
    this.editingId.set(habit.id);
  }

  protected saveEdit(habit: Habit, value: string) {
    // Enter guarda y quita el input, lo que también dispara blur: guardar una sola vez.
    if (this.editingId() !== habit.id) return;
    const title = value.trim();
    this.editingId.set(null);
    if (!title || title === habit.title) return;
    this.run(() => this.habitsService.update(habit.id, { title }));
  }

  protected remove(habit: Habit) {
    if (!confirm(`¿Eliminar "${habit.title}"? Se perderá su racha.`)) return;
    this.run(() => this.habitsService.remove(habit.id));
  }

  protected streakLabel(streak: number, unit: [string, string]) {
    return `${streak} ${streak === 1 ? unit[0] : unit[1]}`;
  }

  protected async logout() {
    await this.auth.logout();
    this.habitsService.clear();
    await this.router.navigateByUrl('/login');
  }

  private async run(action: () => Promise<unknown>) {
    this.error.set('');
    try {
      await action();
    } catch {
      this.error.set('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    }
  }
}
