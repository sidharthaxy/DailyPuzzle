"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        console.log(`\n🎉 New Account Created! Email: ${user.email}, ID: ${user.id}\n`);
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,          
            sameSite: 'none',      
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(201).json({
            success: true,
            user: { id: user.id, email: user.email, isGuest: false, createdAt: user.createdAt }
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,          
            sameSite: 'none',      
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            success: true,
            user: { id: user.id, email: user.email, isGuest: false, createdAt: user.createdAt }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out' });
};
exports.logout = logout;
const me = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({
            success: true,
            user: { id: user.id, email: user.email, isGuest: false, createdAt: user.createdAt }
        });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.me = me;
//# sourceMappingURL=authController.js.map