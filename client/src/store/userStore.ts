import { create } from 'zustand';

interface UserState {
  streak: number;
  totalScore: number;
  lastPlayedDate: string | null;
  incrementStreak: (date: string) => void;
  resetStreak: () => void;
  addScore: (score: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  streak: 0,
  totalScore: 0,
  lastPlayedDate: null,
  incrementStreak: (date) => set((state) => ({ 
    streak: state.streak + 1,
    lastPlayedDate: date
  })),
  resetStreak: () => set({ streak: 0 }),
  addScore: (score) => set((state) => ({ totalScore: state.totalScore + score }))
}));
