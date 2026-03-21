"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyScores = exports.saveDailyScore = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const saveDailyScore = async (userId, date, score, time, puzzleType) => {
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
exports.saveDailyScore = saveDailyScore;
const getDailyScores = async (userId) => {
    return await prisma.dailyPuzzleResult.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        select: { date: true, score: true, puzzleType: true }
    });
};
exports.getDailyScores = getDailyScores;
//# sourceMappingURL=syncService.js.map