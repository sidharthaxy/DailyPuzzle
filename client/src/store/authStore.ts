import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
      if (!navigator.onLine) {
        // If offline, trust the persisted state from Zustand
        set({ isCheckingAuth: false });
        return;
      }
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
      console.warn('Network error during checkAuth. Trusting persisted state:', e);
      set({ isCheckingAuth: false });
    }
  }
    }),
    {
      name: 'auth-storage', // unique name for the item in localStorage
      // We only persist 'isAuthenticated' and 'user'. 'isCheckingAuth' should not be persisted.
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
    }
  )
);
