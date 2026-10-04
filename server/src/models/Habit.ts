import { Schema, model } from 'mongoose';
import { FREQUENCIES } from '../utils/period.js';

const habitSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    frequency: { type: String, enum: FREQUENCIES, required: true },
    completions: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Habit = model('Habit', habitSchema);
