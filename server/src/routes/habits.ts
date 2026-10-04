import { Router, type Request } from 'express';
import { isValidObjectId } from 'mongoose';
import { Habit } from '../models/Habit.js';
import { computeStreak, FREQUENCIES, nowIn, periodKey, toggleCompletion, type Frequency } from '../utils/period.js';

export const habitsRouter = Router();

type HabitLike = { _id: unknown; title: string; frequency: string; completions: string[] };

function toDto(habit: HabitLike, req: Request) {
  const frequency = habit.frequency as Frequency;
  const now = nowIn(req.header('X-Timezone'));
  return {
    id: String(habit._id),
    title: habit.title,
    frequency,
    streak: computeStreak(habit.completions, frequency, now),
    doneThisPeriod: habit.completions.includes(periodKey(now, frequency)),
  };
}

function parseBody(body: unknown, partial: boolean) {
  const { title, frequency } = (body ?? {}) as { title?: unknown; frequency?: unknown };
  const update: { title?: string; frequency?: Frequency } = {};
  if (title !== undefined || !partial) {
    if (typeof title !== 'string' || !title.trim()) return { error: 'El título es obligatorio' };
    update.title = title.trim().slice(0, 120);
  }
  if (frequency !== undefined || !partial) {
    if (!FREQUENCIES.includes(frequency as Frequency)) return { error: 'Frecuencia inválida' };
    update.frequency = frequency as Frequency;
  }
  return { update };
}

/** Busca un hábito del usuario autenticado; responde 404 si no existe. */
async function findOwned(req: Request) {
  if (!isValidObjectId(req.params.id)) return null;
  return Habit.findOne({ _id: req.params.id, userId: req.uid });
}

habitsRouter.get('/', async (req, res) => {
  const habits = await Habit.find({ userId: req.uid }).sort({ createdAt: 1 }).lean();
  res.json(habits.map((h) => toDto(h, req)));
});

habitsRouter.post('/', async (req, res) => {
  const parsed = parseBody(req.body, false);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const habit = await Habit.create({ ...parsed.update, userId: req.uid });
  res.status(201).json(toDto(habit, req));
});

habitsRouter.patch('/:id', async (req, res) => {
  const parsed = parseBody(req.body, true);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const { update } = parsed;
  const habit = await findOwned(req);
  if (!habit) {
    res.status(404).json({ error: 'Hábito no encontrado' });
    return;
  }
  // Las claves de periodo dependen de la frecuencia: si cambia, se empieza de cero.
  if (update.frequency && update.frequency !== habit.frequency) habit.completions = [];
  habit.set(update);
  await habit.save();
  res.json(toDto(habit, req));
});

habitsRouter.delete('/:id', async (req, res) => {
  const habit = await findOwned(req);
  if (!habit) {
    res.status(404).json({ error: 'Hábito no encontrado' });
    return;
  }
  await habit.deleteOne();
  res.status(204).end();
});

habitsRouter.post('/:id/toggle', async (req, res) => {
  const habit = await findOwned(req);
  if (!habit) {
    res.status(404).json({ error: 'Hábito no encontrado' });
    return;
  }
  const now = nowIn(req.header('X-Timezone'));
  habit.completions = toggleCompletion(habit.completions, habit.frequency as Frequency, now);
  await habit.save();
  res.json(toDto(habit, req));
});
