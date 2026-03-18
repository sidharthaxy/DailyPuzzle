import { create } from 'zustand';
import { savePuzzleProgress, loadPuzzleProgress } from '../db/indexeddb';
import { generateDailyPuzzle, PuzzleType } from '../puzzles/generator';
import { validatePuzzle } from '../puzzles/validator';
import { useStreakStore } from './streakStore';

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
  initDailyPuzzle: () => Promise<void>;
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

    initDailyPuzzle: async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayDate = `${year}-${month}-${day}`;
      
      const savedState = await loadPuzzleProgress(todayDate);
      const generated = generateDailyPuzzle();
      
      if (savedState) {
        set({
          date: todayDate,
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
            date: todayDate,
            puzzleType: generated.type,
            puzzleData: generated.puzzleData,
            solution: generated.solution,
            // Path needs empty array, sudoku needs empty grid matching puzzle layout
            userState: generated.type === 'path' ? [] : JSON.parse(JSON.stringify(generated.puzzleData.grid)),
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
      savePuzzleProgress({
        date: updatedState.date,
        puzzleType: updatedState.puzzleType as string,
        moves: updatedState.userState,
        gridState: updatedState.userState,
        timer: updatedState.timer,
        hintsUsed: updatedState.hintsUsed
      });
      
      const isValid = validatePuzzle(updatedState.puzzleType!, updatedState.userState, updatedState.solution, updatedState.puzzleData);
      
      if (isValid) {
        state.handlePuzzleCompletion();
      }
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
      savePuzzleProgress({
        date: updatedState.date,
        puzzleType: updatedState.puzzleType as string,
        moves: updatedState.userState,
        gridState: updatedState.userState,
        timer: updatedState.timer,
        hintsUsed: updatedState.hintsUsed
      });
      
      const isValid = validatePuzzle(updatedState.puzzleType!, updatedState.userState, updatedState.solution, updatedState.puzzleData);
      if (isValid) {
        updatedState.handlePuzzleCompletion();
      }
    },
    
    handlePuzzleCompletion: () => {
      set({ isRunning: false, isComplete: true });
      const state = get();
      
      const baseScore = 100;
      const timeMultiplier = Math.max(0, 60 - state.timer);
      const hintPenalty = state.hintsUsed * 10;
      const score = baseScore + timeMultiplier - hintPenalty;
      
      set({ score });
      
      // Streak update trigger module
      useStreakStore.getState().updateStreak(state.date);
      
      // Ideally trigger backend sync queue here
    },
    
    tickTimer: () => {
      const state = get();
      if (state.isRunning) {
        set({ timer: state.timer + 1 });
      }
    }
  };
});
