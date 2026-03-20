// Seed utility no longer needed here as date is passed directly
import { generatePathPuzzle } from './engines/pathPuzzle';
import { generateSudokuPuzzle } from './engines/sudokuPuzzle';


export type PuzzleType = 'path' | 'sudoku';

export interface GeneratedPuzzle {
    type: PuzzleType;
    puzzleData: any;
    solution: any;
    difficulty: string;
}

export function generateDailyPuzzle(dateStr: string, type: PuzzleType): GeneratedPuzzle {
    // Generate a stable seed from the date and puzzle type to ensure each puzzle 
    // for a specific day is uniquely deterministic.
    const dateNum = parseInt(dateStr.replace(/-/g, ''), 10);
    const typeOffset = type === 'path' ? 1 : 2;
    const seed = dateNum * 100 + typeOffset;
    
    if (type === 'path') {
        const { grid, start, end, solution } = generatePathPuzzle(seed);
        return {
            type,
            puzzleData: { grid, start, end },
            solution: solution,
            difficulty: 'Medium'
        };
    } else {
        const { puzzle, solution } = generateSudokuPuzzle(seed);
        return {
            type,
            puzzleData: { grid: puzzle },
            solution: solution,
            difficulty: 'Medium'
        };
    }
}
