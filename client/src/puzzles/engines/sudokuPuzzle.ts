// @ts-ignore
import sudoku from './sudoku';

export type SudokuGrid = (number | null)[][];
export interface SudokuPuzzleData {
  puzzle: SudokuGrid;
  solution: number[][]; // Full solution included or computed on demand
}

export function generateSudokuPuzzle(_seed: number): SudokuPuzzleData {
  // Since sudoku.js doesn't natively support seeding easily without modifying its internal random,
  // we'll just generate an "easy" to "medium" puzzle. 
  // In a truly seed-deterministic game, we would replace its random with a seeded random,
  // but for now, we'll try to keep it simple and just generate a standard puzzle.
  const boardStr = sudoku.generate(40); // 40 givens is a medium/hard puzzle
  const solutionStr = sudoku.solve(boardStr);

  const puzzle = sudoku.board_string_to_grid(boardStr).map((row: string[]) =>
    row.map((cell) => (cell === '.' ? null : parseInt(cell)))
  );

  const solution = sudoku.board_string_to_grid(solutionStr).map((row: string[]) =>
    row.map((cell) => parseInt(cell))
  );

  return { puzzle, solution };
}

export function validateSudoku(userGrid: (number | null)[][]): boolean {
  // Convert userGrid back to a board string
  let boardStr = "";
  for (let r = 0; r < 9; ++r) {
    for (let c = 0; c < 9; ++c) {
      if (userGrid[r][c] === null) {
        boardStr += '.';
      } else {
        boardStr += userGrid[r][c]?.toString();
      }
    }
  }

  // If there are still empty cells, it's not solved
  if (boardStr.includes('.')) return false;

  // Let sudoku.js validate
  const candidates = sudoku.get_candidates(boardStr);
  return candidates !== false;
}

