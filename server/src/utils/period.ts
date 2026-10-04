import { DateTime } from 'luxon';

export type Frequency = 'daily' | 'weekly' | 'monthly';

export const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly'];

const UNIT = { daily: 'days', weekly: 'weeks', monthly: 'months' } as const;

/** Fecha/hora actual en la zona horaria del usuario (UTC si la zona no es válida). */
export function nowIn(timezone?: string): DateTime {
  const now = DateTime.now().setZone(timezone || 'UTC');
  return now.isValid ? now : DateTime.utc();
}

/** Clave del periodo al que pertenece una fecha: 2026-10-03, 2026-W40 o 2026-10. */
export function periodKey(date: DateTime, frequency: Frequency): string {
  switch (frequency) {
    case 'daily':
      return date.toFormat('yyyy-MM-dd');
    case 'weekly':
      return `${date.weekYear}-W${String(date.weekNumber).padStart(2, '0')}`;
    case 'monthly':
      return date.toFormat('yyyy-MM');
  }
}

/** Fecha que cae en el periodo anterior al de `date`. */
export function previousPeriod(date: DateTime, frequency: Frequency): DateTime {
  return date.minus({ [UNIT[frequency]]: 1 });
}

/**
 * Racha = periodos consecutivos cumplidos contando hacia atrás desde el actual.
 * Si el periodo actual aún no está marcado, se empieza desde el anterior
 * (todavía hay tiempo para cumplirlo). Si falta un periodo, la racha es 0.
 */
export function computeStreak(completions: string[], frequency: Frequency, now: DateTime): number {
  const done = new Set(completions);
  let cursor = now;
  if (!done.has(periodKey(cursor, frequency))) {
    cursor = previousPeriod(cursor, frequency);
  }
  let streak = 0;
  while (done.has(periodKey(cursor, frequency))) {
    streak++;
    cursor = previousPeriod(cursor, frequency);
  }
  return streak;
}

/** Marca o desmarca el periodo actual. Devuelve la nueva lista de completions. */
export function toggleCompletion(completions: string[], frequency: Frequency, now: DateTime): string[] {
  const key = periodKey(now, frequency);
  return completions.includes(key) ? completions.filter((k) => k !== key) : [...completions, key];
}
