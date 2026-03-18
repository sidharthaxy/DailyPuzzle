import { createSeededRandom } from '../../utils/seededRandom';

export type SudokuGrid = (number | null)[][];
export interface SudokuPuzzleData {
  puzzle: SudokuGrid;
  solution: number[][];
}

export function generateSudokuPuzzle(seed: number): SudokuPuzzleData {
  const rng = createSeededRandom(seed);
  const size = 4;
  
  let grid: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
  
  function isValid(r: number, c: number, num: number, tempGrid: number[][]): boolean {
    for (let i = 0; i < size; i++) {
        if (tempGrid[r][i] === num) return false;
        if (tempGrid[i][c] === num) return false;
    }
    const boxR = Math.floor(r / 2) * 2;
    const boxC = Math.floor(c / 2) * 2;
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (tempGrid[boxR + i][boxC + j] === num) return false;
        }
    }
    return true;
  }

  function solve(tempGrid: number[][]): boolean {
      for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
              if (tempGrid[r][c] === 0) {
                  const nums = [1, 2, 3, 4];
                  // Shuffle choices using seeded RNG
                  for (let i = nums.length - 1; i > 0; i--) {
                      const j = rng.randomInt(0, i);
                      [nums[i], nums[j]] = [nums[j], nums[i]];
                  }
                  
                  for (let num of nums) {
                      if (isValid(r, c, num, tempGrid)) {
                          tempGrid[r][c] = num;
                          if (solve(tempGrid)) return true;
                          tempGrid[r][c] = 0;
                      }
                  }
                  return false;
              }
          }
      }
      return true;
  }

  solve(grid);
  
  const solution = grid.map(row => [...row]);
  
  const puzzle: SudokuGrid = grid.map(row => [...row]);
  const cellsToRemove = rng.randomInt(8, 10);
  let removed = 0;
  
  while (removed < cellsToRemove) {
      const r = rng.randomInt(0, 3);
      const c = rng.randomInt(0, 3);
      if (puzzle[r][c] !== null) {
          puzzle[r][c] = null;
          removed++;
      }
  }

  return { puzzle, solution };
}

export function validateSudoku(userGrid: (number | null)[][], solution: number[][]): boolean {
    const size = 4;
    
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (userGrid[r][c] === null) return false;
            if (userGrid[r][c] !== solution[r][c]) return false;
        }
    }
    
    // Explicitly check uniqueness for correctness
    for (let i = 0; i < size; i++) {
        const rowSet = new Set();
        const colSet = new Set();
        for (let j = 0; j < size; j++) {
            rowSet.add(userGrid[i][j]);
            colSet.add(userGrid[j][i]);
        }
        if (rowSet.size !== size || colSet.size !== size) return false;
    }
    
    const boxes = [ [0,0], [0,2], [2,0], [2,2] ];
    for (const [br, bc] of boxes) {
        const boxSet = new Set();
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                boxSet.add(userGrid[br+i][bc+j]);
            }
        }
        if (boxSet.size !== size) return false;
    }
    
    return true;
}
