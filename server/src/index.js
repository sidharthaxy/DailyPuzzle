"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const syncRoutes_js_1 = __importDefault(require("./routes/syncRoutes.js"));
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:5173', credentials: true })); // Needs explicit origin for cookies
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/auth', authRoutes_js_1.default);
app.use('/sync', syncRoutes_js_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map