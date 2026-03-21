"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const router = (0, express_1.Router)();
router.post('/register', authController_js_1.register);
router.post('/login', authController_js_1.login);
router.post('/logout', authController_js_1.logout);
router.get('/me', authController_js_1.me);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map