import { getTodaySeed } from './seed';
import { generatePathPuzzle } from './engines/pathPuzzle';
import { generateSudokuPuzzle } from './engines/sudokuPuzzle';


export type PuzzleType = 'path' | 'sudoku';

export interface GeneratedPuzzle {
    type: PuzzleType;
    puzzleData: any;
    solution: any;
    difficulty: string;
}

export function generateDailyPuzzle(): GeneratedPuzzle {
    const seed = getTodaySeed();
    
    const isPath = seed % 2 === 0;
    const type: PuzzleType = isPath ? 'path' : 'sudoku';
    
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
