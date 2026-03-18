import type { Request, Response } from 'express';
import { saveDailyScore } from '../services/syncService.js';

export const syncDailyScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, date, score, time, puzzleType } = req.body;
    
    if (!userId || !date || score === undefined || time === undefined || !puzzleType) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Validations
    const reqDate = new Date(date);
    const today = new Date();
    // Reset time to compare just dates
    today.setHours(0, 0, 0, 0);
    reqDate.setHours(0, 0, 0, 0);
    
    if (reqDate > today) {
      res.status(400).json({ error: 'Cannot sync future dates' });
      return;
    }
    
    if (time < 5) {
      res.status(400).json({ error: 'Impossible completion time' });
      return;
    }
    
    if (score < 0 || score > 50000) { // Arbitrary max score logic
      res.status(400).json({ error: 'Impossible score' });
      return;
    }
    
    const result = await saveDailyScore(userId, date, score, time, puzzleType);
    res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error('Error in syncDailyScore:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDailyScores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'Missing userId parameter' });
      return;
    }
    const scores = await import('../services/syncService.js').then(m => m.getDailyScores(userId as string));
    res.status(200).json({ success: true, scores });
  } catch (err: any) {
    console.error('Error in getDailyScores:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
