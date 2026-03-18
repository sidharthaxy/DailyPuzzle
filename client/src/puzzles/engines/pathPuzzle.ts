import { createSeededRandom } from '../../utils/seededRandom';

export interface Position { r: number; c: number; }
export interface PathPuzzleData {
  grid: string[][];
  start: Position;
  end: Position;
  solution: Position[];
}

export function generatePathPuzzle(seed: number): PathPuzzleData {
  const rng = createSeededRandom(seed);
  const size = 5;
  
  let grid: string[][] = [];
  let start: Position = { r: 0, c: 0 };
  let end: Position = { r: size - 1, c: size - 1 };
  let solution: Position[] = [];

  while (true) {
    grid = Array(size).fill(null).map(() => Array(size).fill('.'));
    grid[start.r][start.c] = 'S';
    grid[end.r][end.c] = 'E';

    const numWalls = rng.randomInt(5, 8);
    let wallsPlaced = 0;
    while (wallsPlaced < numWalls) {
      const r = rng.randomInt(0, size - 1);
      const c = rng.randomInt(0, size - 1);
      
      if (grid[r][c] === '.') {
        grid[r][c] = '#';
        wallsPlaced++;
      }
    }

    solution = findPath(grid, start, end);
    if (solution.length > 0) {
      break; 
    }
  }

  return { grid, start, end, solution };
}

function findPath(grid: string[][], start: Position, end: Position): Position[] {
  const size = grid.length;
  const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.r},${start.c}`);
  
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up
  
  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    
    if (pos.r === end.r && pos.c === end.c) {
      return path;
    }
    
    for (const [dr, dc] of dirs) {
      const nr = pos.r + dr;
      const nc = pos.c + dc;
      
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (grid[nr][nc] !== '#' && !visited.has(`${nr},${nc}`)) {
          visited.add(`${nr},${nc}`);
          queue.push({ pos: { r: nr, c: nc }, path: [...path, { r: nr, c: nc }] });
        }
      }
    }
  }
  
  return [];
}

export function validatePath(userMoves: Position[], solution: Position[], grid: string[][]): boolean {
  if (!userMoves || userMoves.length === 0) return false;
  
  const startPos = userMoves[0];
  const endPos = userMoves[userMoves.length - 1];
  
  if (grid[startPos.r][startPos.c] !== 'S') return false;
  if (grid[endPos.r][endPos.c] !== 'E') return false;
  
  const visited = new Set<string>();
  
  for (let i = 0; i < userMoves.length; i++) {
    const { r, c } = userMoves[i];
    
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
    if (grid[r][c] === '#') return false;
    
    const key = `${r},${c}`;
    if (visited.has(key)) return false;
    visited.add(key);
    
    if (i > 0) {
      const prev = userMoves[i - 1];
      const dist = Math.abs(r - prev.r) + Math.abs(c - prev.c);
      if (dist !== 1) return false;
    }
  }

  // Strictly check "path equals solution" as mentioned in requirement
  if (userMoves.length !== solution.length) return false;
  for (let i = 0; i < userMoves.length; i++) {
     if (userMoves[i].r !== solution[i].r || userMoves[i].c !== solution[i].c) return false;
  }
  
  return true;
}
