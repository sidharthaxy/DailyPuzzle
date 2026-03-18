import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import syncRoutes from './routes/syncRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Needs explicit origin for cookies
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/sync', syncRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
