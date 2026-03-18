import { Router } from 'express';
import { syncDailyScore, getDailyScores } from '../controllers/syncController.js';

const router = Router();

router.post('/daily-scores', syncDailyScore);
router.get('/daily-scores/:userId', getDailyScores);

export default router;
