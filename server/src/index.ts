import 'dotenv/config';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from './middleware/auth.js';
import { habitsRouter } from './routes/habits.js';

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habits';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});
app.use('/api/habits', requireAuth, habitsRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
};
app.use(errorHandler);

await mongoose.connect(MONGODB_URI);
console.log('Conectado a MongoDB');
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
