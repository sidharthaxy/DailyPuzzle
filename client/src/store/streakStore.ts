import { create } from 'zustand';

interface StreakState {
  currentStreak: number;
  lastSolvedDate: string | null;
  updateStreak: (date: string) => void;
}

// Helper to determine if dates are consecutive days
function isYesterday(lastDateStr: string, currentDateStr: string): boolean {
  const last = new Date(lastDateStr);
  const curr = new Date(currentDateStr);
  // Reset timestamps to midnight to perfectly compare days difference
  last.setHours(0, 0, 0, 0);
  curr.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(curr.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

// In a real app we'd load this from local storage or backend
const initialStreakStr = typeof window !== 'undefined' ? localStorage.getItem('puzzleStreak') : null;
let initialStreak = 0;
let initialLastDate = null;
if (initialStreakStr) {
    try {
        const parsed = JSON.parse(initialStreakStr);
        initialStreak = parsed.currentStreak || 0;
        initialLastDate = parsed.lastSolvedDate || null;
    } catch(e) {}
}

export const useStreakStore = create<StreakState>((set, get) => ({
  currentStreak: initialStreak,
  lastSolvedDate: initialLastDate,
  
  updateStreak: (date: string) => {
    const state = get();
    
    // Prevent double counts for the same day
    if (state.lastSolvedDate === date) {
      return; 
    }
    
    let newStreak = 1;
    
    if (state.lastSolvedDate) {
      if (isYesterday(state.lastSolvedDate, date)) {
          newStreak = state.currentStreak + 1;
      } else {
          // Missed day -> reset streak to 1
          newStreak = 1;
      }
    }
    
    set({
      currentStreak: newStreak,
      lastSolvedDate: date
    });
    
    // Persist
    if (typeof window !== 'undefined') {
        localStorage.setItem('puzzleStreak', JSON.stringify({
            currentStreak: newStreak,
            lastSolvedDate: date
        }));
    }
  }
}));
