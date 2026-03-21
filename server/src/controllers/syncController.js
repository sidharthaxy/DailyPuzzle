"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyScores = exports.syncDailyScore = void 0;
const syncService_js_1 = require("../services/syncService.js");
const syncDailyScore = async (req, res) => {
    try {
        const { userId, date, score, time, puzzleType } = req.body;
        if (!userId || !date || score === undefined || time === undefined || !puzzleType) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Validations
        const reqDate = new Date(date);
        const today = new Date();
        // Reset time to compare just dates
        today.setHours(0, 0, 0, 0);
        reqDate.setHours(0, 0, 0, 0);
        if (reqDate > today) {
            res.status(400).json({ error: 'Cannot sync future dates' });
            return;
        }
        if (time < 5) {
            res.status(400).json({ error: 'Impossible completion time' });
            return;
        }
        if (score < 0 || score > 50000) { // Arbitrary max score logic
            res.status(400).json({ error: 'Impossible score' });
            return;
        }
        const result = await (0, syncService_js_1.saveDailyScore)(userId, date, score, time, puzzleType);
        res.status(200).json({ success: true, result });
    }
    catch (err) {
        console.error('Error in syncDailyScore:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.syncDailyScore = syncDailyScore;
const getDailyScores = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'Missing userId parameter' });
            return;
        }
        const scores = await Promise.resolve().then(() => __importStar(require('../services/syncService.js'))).then(m => m.getDailyScores(userId));
        res.status(200).json({ success: true, scores });
    }
    catch (err) {
        console.error('Error in getDailyScores:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getDailyScores = getDailyScores;
//# sourceMappingURL=syncController.js.map