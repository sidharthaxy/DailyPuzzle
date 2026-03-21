import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

export const register = async (req: Request, res: Response): Promise<void> => {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    console.log(`\n🎉 New Account Created! Email: ${user.email}, ID: ${user.id}\n`);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
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
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ 
      success: true, 
      user: { id: user.id, email: user.email, isGuest: false, createdAt: user.createdAt } 
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
