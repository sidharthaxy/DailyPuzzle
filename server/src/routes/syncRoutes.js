"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const syncController_js_1 = require("../controllers/syncController.js");
const router = (0, express_1.Router)();
router.post('/daily-scores', syncController_js_1.syncDailyScore);
router.get('/daily-scores/:userId', syncController_js_1.getDailyScores);
exports.default = router;
//# sourceMappingURL=syncRoutes.js.map