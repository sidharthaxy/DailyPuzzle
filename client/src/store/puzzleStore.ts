import { create } from 'zustand';
import { savePuzzleProgress, loadPuzzleProgress } from '../db/indexeddb';
import { generateDailyPuzzle, PuzzleType } from '../puzzles/generator';
import { validatePuzzle } from '../puzzles/validator';
import { useStreakStore } from './streakStore';
import { useAuthStore } from './authStore';

interface PuzzleState {
  date: string;
  puzzleType: PuzzleType | null;
  puzzleData: any;
  solution: any;
  
  userState: any;
  
  timer: number; // elapsed time in seconds
  startTime: number | null;
  isRunning: boolean;
  
  hintsUsed: number;
  score: number | null;
  isComplete: boolean;
  
  // Actions
  initDailyPuzzle: (dateStr: string, type: PuzzleType) => Promise<void>;
  makeMove: (newState: any) => void;
  useHint: () => void;
  handlePuzzleCompletion: () => void;
  tickTimer: () => void;
}

export const usePuzzleStore = create<PuzzleState>((set, get) => {
  return {
    date: new Date().toISOString().split('T')[0],
    puzzleType: null,
    puzzleData: null,
    solution: null,
    
    userState: null,
    
    timer: 0,
    startTime: null,
    isRunning: false,
    
    hintsUsed: 0,
    score: null,
    isComplete: false,

    initDailyPuzzle: async (dateStr: string, type: PuzzleType) => {
      const userId = useAuthStore.getState().user?.id || 'guest';
      const stateKey = `${dateStr}_${type}_${userId}`;
      const savedState = type === 'sudoku' ? undefined : await loadPuzzleProgress(stateKey);
      const generated = generateDailyPuzzle(dateStr, type);
      
      if (savedState) {
        set({
          date: dateStr,
          puzzleType: generated.type,
          puzzleData: generated.puzzleData,
          solution: generated.solution,
          userState: savedState.moves,
          timer: savedState.timer,
          hintsUsed: savedState.hintsUsed,
          isComplete: false // Validation can be checked next
        });
        
        // Check if previously completed
        const isValid = validatePuzzle(generated.type, savedState.moves, generated.solution, generated.puzzleData);
        if (isValid) {
            set({ isComplete: true, isRunning: false });
        }
      } else {
        set({
            date: dateStr,
            puzzleType: generated.type,
            puzzleData: generated.puzzleData,
            solution: generated.solution,
            // Path needs start pos, sudoku needs empty grid matching puzzle layout
            userState: generated.type === 'path' ? [generated.puzzleData.start] : JSON.parse(JSON.stringify(generated.puzzleData.grid)),
            timer: 0,
            hintsUsed: 0,
            isComplete: false,
            score: null
        });
      }
    },
    
    makeMove: (newState: any) => {
      const state = get();
      if (state.isComplete) return;
      
      if (!state.isRunning) {
        set({ isRunning: true, startTime: Date.now() });
      }
      
      set({ userState: newState });
      
      const updatedState = get();
      const userId = useAuthStore.getState().user?.id || 'guest';
      
      if (updatedState.puzzleType !== 'sudoku') {
        savePuzzleProgress({
          date: `${updatedState.date}_${updatedState.puzzleType}_${userId}`,
          puzzleType: updatedState.puzzleType as string,
          moves: updatedState.userState,
          gridState: updatedState.userState,
          timer: updatedState.timer,
          hintsUsed: updatedState.hintsUsed
        });
      }
      // Manual submission only. No auto-submit.
    },
    
    useHint: () => {
      const state = get();
      if (state.isComplete || state.hintsUsed >= 2) return;
      
      let nextState = JSON.parse(JSON.stringify(state.userState));
      
      if (state.puzzleType === 'path') {
         if (nextState.length === 0) {
            nextState.push(state.solution[0]);
         } else {
            let matchLen = 0;
            for (let i = 0; i < nextState.length; i++) {
               if (i < state.solution.length && nextState[i].r === state.solution[i].r && nextState[i].c === state.solution[i].c) {
                   matchLen++;
               } else {
                   break;
               }
            }
            nextState = state.solution.slice(0, matchLen + 1);
         }
      } else if (state.puzzleType === 'sudoku') {
         const emptyCells: {r: number, c: number}[] = [];
         for(let r = 0; r < 4; r++) {
           for(let c = 0; c < 4; c++) {
             // Treat empty or wrong as hintable
             if (nextState[r][c] === null || nextState[r][c] !== state.solution[r][c]) {
                emptyCells.push({r, c});
             }
           }
         }
         if (emptyCells.length > 0) {
           const cell = emptyCells[0]; 
           nextState[cell.r][cell.c] = state.solution[cell.r][cell.c];
         }
      }
      
      if (!state.isRunning) {
         set({ isRunning: true, startTime: Date.now() });
      }
      
      set({ userState: nextState, hintsUsed: state.hintsUsed + 1 });
      
      const updatedState = get();
      const userId = useAuthStore.getState().user?.id || 'guest';
      
      if (updatedState.puzzleType !== 'sudoku') {
        savePuzzleProgress({
          date: `${updatedState.date}_${updatedState.puzzleType}_${userId}`,
          puzzleType: updatedState.puzzleType as string,
          moves: updatedState.userState,
          gridState: updatedState.userState,
          timer: updatedState.timer,
          hintsUsed: updatedState.hintsUsed
        });
      }
      // Manual submission only. No auto-submit.
    },
    
    handlePuzzleCompletion: () => {
      set({ isRunning: false, isComplete: true });
      const state = get();
      
      const today = new Date().toISOString().split('T')[0];
      const isToday = state.date === today;
      
      let score = 0;
      if (isToday) {
          const baseScore = 100;
          const timeMultiplier = Math.max(0, 60 - state.timer);
          const hintPenalty = state.hintsUsed * 10;
          score = baseScore + timeMultiplier - hintPenalty;
          
          // Streak update trigger module (only for today's puzzle)
          useStreakStore.getState().updateStreak(state.date);
      }
      
      set({ score });
      
      // Always trigger backend sync queue so the UI knows it was "Played" 
      // even if the score is 0 due to being a past puzzle.
      import('../db/indexeddb').then(db => {
         const userId = useAuthStore.getState().user?.id || 'guest';
         db.saveUnsyncedResult({
             id: `${state.date}_${state.puzzleType}_${userId}`,
             date: state.date,
             score,
             time: state.timer,
             puzzleType: state.puzzleType!
         }).then(() => {
             import('../services/syncService').then(s => s.syncOfflineResults());
         });
      });
    },
    
    tickTimer: () => {
      const state = get();
      if (state.isRunning) {
        set({ timer: state.timer + 1 });
      }
    }
  };
});
