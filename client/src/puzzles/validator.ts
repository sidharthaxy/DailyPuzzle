import { validatePath } from './engines/pathPuzzle';
import { validateSudoku } from './engines/sudokuPuzzle';
import { PuzzleType } from './generator';

export function validatePuzzle(type: PuzzleType, userState: any, solution: any, puzzleData?: any): boolean {
    if (type === 'path') {
        const grid = puzzleData?.grid;
        return validatePath(userState, solution, grid);
    } else if (type === 'sudoku') {
        return validateSudoku(userState);
    }
    return false;
}
