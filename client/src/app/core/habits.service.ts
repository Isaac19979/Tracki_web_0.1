import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  title: string;
  frequency: Frequency;
  streak: number;
  doneThisPeriod: boolean;
}

@Injectable({ providedIn: 'root' })
export class HabitsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/habits`;

  readonly habits = signal<Habit[]>([]);

  async load() {
    this.habits.set(await firstValueFrom(this.http.get<Habit[]>(this.url)));
  }

  async add(title: string, frequency: Frequency) {
    const habit = await firstValueFrom(this.http.post<Habit>(this.url, { title, frequency }));
    this.habits.update((list) => [...list, habit]);
  }

  async update(id: string, changes: Partial<Pick<Habit, 'title' | 'frequency'>>) {
    this.replace(await firstValueFrom(this.http.patch<Habit>(`${this.url}/${id}`, changes)));
  }

  async toggle(id: string) {
    this.replace(await firstValueFrom(this.http.post<Habit>(`${this.url}/${id}/toggle`, {})));
  }

  async remove(id: string) {
    await firstValueFrom(this.http.delete(`${this.url}/${id}`));
    this.habits.update((list) => list.filter((h) => h.id !== id));
  }

  clear() {
    this.habits.set([]);
  }

  private replace(habit: Habit) {
    this.habits.update((list) => list.map((h) => (h.id === habit.id ? habit : h)));
  }
}
