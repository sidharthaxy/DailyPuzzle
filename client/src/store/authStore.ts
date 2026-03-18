import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  isGuest: boolean;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isCheckingAuth: true,
  user: null,
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    set({
      isAuthenticated: true,
      user: data.user
    });
  },
  register: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    
    set({
      isAuthenticated: true,
      user: data.user
    });
  },
  loginAsGuest: () => set({
    isAuthenticated: true,
    user: { 
      id: `guest_${Date.now()}`, 
      email: 'Guest', 
      isGuest: true,
      createdAt: new Date().toISOString()
    }
  }),
  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout error', e);
    }
    set({ isAuthenticated: false, user: null });
  },
  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.user) {
        set({ isAuthenticated: true, user: data.user, isCheckingAuth: false });
      } else {
        set({ isAuthenticated: false, user: null, isCheckingAuth: false });
      }
    } catch (e) {
      set({ isAuthenticated: false, user: null, isCheckingAuth: false });
    }
  }
}));
