import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const saveDailyScore = async (
  userId: string, 
  date: string, 
  score: number, 
  time: number, 
  puzzleType: string
) => {
  // Ensure user exists (Mock auto-create for demo, normally handled by Auth)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@demo.com`, // Mock email
      password: 'mock_guest_password' // Added to satisfy new schema constraint
    }
  });

  // Upsert the puzzle result for the day
  return await prisma.dailyPuzzleResult.upsert({
    where: {
      userId_date_puzzleType: {
        userId,
        date,
        puzzleType
      }
    },
    update: {
      score,
      time,
      puzzleType
    },
    create: {
      userId,
      date,
      score,
      time,
      puzzleType
    }
  });
};

export const getDailyScores = async (userId: string) => {
  return await prisma.dailyPuzzleResult.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
    select: { date: true, score: true, puzzleType: true }
  });
};
