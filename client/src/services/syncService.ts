import { getUnsyncedResults, markSynced } from '../db/indexeddb';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const syncOfflineResults = async () => {
  if (!navigator.onLine) return;
  
  const results = await getUnsyncedResults();
  
  for (const result of results) {
    try {
      const response = await fetch(`${API_URL}/sync/daily-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'guest_user', // Fixed for demo, would be from Auth
          date: result.date,
          score: result.score,
          time: result.time,
          puzzleType: result.puzzleType
        }),
      });
      
      if (response.ok) {
        await markSynced(result.id);
      }
    } catch (err) {
      console.error('Failed to sync result', result.id, err);
    }
  }
};

window.addEventListener('online', syncOfflineResults);
