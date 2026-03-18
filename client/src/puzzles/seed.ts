import CryptoJS from 'crypto-js';

const PUZZLE_SECRET = import.meta.env.VITE_PUZZLE_SECRET || 'puzzle_secret';

export function getSeedForDate(date: string): number {
  // Generate a SHA256 hash using the date and secret
  const hash = CryptoJS.SHA256(date + PUZZLE_SECRET).toString();
  
  // Return a numeric seed usable for seeded random generator
  // Parse the first 13 characters (to fit in max safe integer) of the hex hash to an integer
  return parseInt(hash.substring(0, 13), 16);
}

export function getTodaySeed(): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  return getSeedForDate(dateString);
}
