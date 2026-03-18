/**
 * Creates a seeded random number generator.
 * Uses the Mulberry32 algorithm for fast, high-quality pseudo-random numbers.
 * @param seed Numeric seed
 */
export function createSeededRandom(seed: number) {
  let s = seed;

  /**
   * Returns a float between 0 (inclusive) and 1 (exclusive)
   */
  function random(): number {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Returns an integer between min and max (inclusive)
   */
  function randomInt(min: number, max: number): number {
    return Math.floor(random() * (max - min + 1)) + min;
  }

  /**
   * Returns a random element from the given array
   */
  function randomChoice<T>(array: T[]): T {
    if (array.length === 0) throw new Error("Cannot choose from an empty array");
    return array[randomInt(0, array.length - 1)];
  }

  return {
    random,
    randomInt,
    randomChoice
  };
}
