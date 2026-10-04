import { describe, expect, it } from 'vitest';
import { DateTime } from 'luxon';
import { computeStreak, nowIn, periodKey, toggleCompletion } from './period.js';

const at = (iso: string) => DateTime.fromISO(iso, { zone: 'UTC' });

describe('periodKey', () => {
  it('formatea cada frecuencia', () => {
    const d = at('2026-10-03T12:00');
    expect(periodKey(d, 'daily')).toBe('2026-10-03');
    expect(periodKey(d, 'weekly')).toBe('2026-W40');
    expect(periodKey(d, 'monthly')).toBe('2026-10');
  });

  it('usa el año ISO en semanas que cruzan de año', () => {
    // 1 de enero de 2027 cae en la semana 53 de 2026
    expect(periodKey(at('2027-01-01T12:00'), 'weekly')).toBe('2026-W53');
  });

  it('respeta la zona horaria del usuario', () => {
    const utc = at('2026-10-04T02:00');
    expect(periodKey(utc.setZone('America/Mexico_City'), 'daily')).toBe('2026-10-03');
  });
});

describe('computeStreak', () => {
  const now = at('2026-10-03T12:00');

  it('es 0 sin completions', () => {
    expect(computeStreak([], 'daily', now)).toBe(0);
  });

  it('cuenta días consecutivos incluyendo hoy', () => {
    expect(computeStreak(['2026-10-01', '2026-10-02', '2026-10-03'], 'daily', now)).toBe(3);
  });

  it('mantiene la racha si hoy aún no se marca', () => {
    expect(computeStreak(['2026-10-01', '2026-10-02'], 'daily', now)).toBe(2);
  });

  it('vuelve a 0 si se saltó el periodo anterior', () => {
    expect(computeStreak(['2026-09-30', '2026-10-01'], 'daily', now)).toBe(0);
  });

  it('reinicia la cuenta tras un hueco', () => {
    expect(computeStreak(['2026-09-29', '2026-10-01', '2026-10-02', '2026-10-03'], 'daily', now)).toBe(3);
  });

  it('cuenta semanas a través del cambio de año', () => {
    const jan = at('2027-01-06T12:00'); // 2027-W01
    expect(computeStreak(['2026-W52', '2026-W53', '2027-W01'], 'weekly', jan)).toBe(3);
  });

  it('cuenta meses a través del cambio de año', () => {
    const jan31 = at('2027-01-31T12:00');
    expect(computeStreak(['2026-11', '2026-12', '2027-01'], 'monthly', jan31)).toBe(3);
  });
});

describe('toggleCompletion', () => {
  const now = at('2026-10-03T12:00');

  it('marca y desmarca el periodo actual sin romper la racha previa', () => {
    const base = ['2026-10-02'];
    const marked = toggleCompletion(base, 'daily', now);
    expect(computeStreak(marked, 'daily', now)).toBe(2);
    const unmarked = toggleCompletion(marked, 'daily', now);
    expect(unmarked).toEqual(base);
    expect(computeStreak(unmarked, 'daily', now)).toBe(1);
  });
});

describe('nowIn', () => {
  it('usa UTC si la zona horaria no es válida', () => {
    expect(nowIn('No/Existe').zoneName).toBe('UTC');
  });
});
