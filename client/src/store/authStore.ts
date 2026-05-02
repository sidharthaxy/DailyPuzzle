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
  hasHydrated: boolean;
  isCheckingAuth: boolean;
  isProfileSyncing: boolean;
  lastServerReachableAt: number | null;
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  checkAuth: (options?: { background?: boolean }) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasHydrated: false,
      isCheckingAuth: true,
      isProfileSyncing: false,
      lastServerReachableAt: null,
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
          user: data.user,
          isCheckingAuth: false,
          isProfileSyncing: false,
          lastServerReachableAt: Date.now()
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
          user: data.user,
          isCheckingAuth: false,
          isProfileSyncing: false,
          lastServerReachableAt: Date.now()
        });
      },
      loginAsGuest: () =>
        set({
          isAuthenticated: true,
          isCheckingAuth: false,
          isProfileSyncing: false,
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

        set({
          isAuthenticated: false,
          user: null,
          isCheckingAuth: false,
          isProfileSyncing: false
        });
      },
      checkAuth: async (options) => {
        const { isAuthenticated, user } = get();

        if (user?.isGuest) {
          set({ isCheckingAuth: false, isProfileSyncing: false });
          return;
        }

        try {
          if (!navigator.onLine) {
            // If offline, trust the persisted state from Zustand.
            set({ isCheckingAuth: false, isProfileSyncing: false });
            return;
          }

          const shouldSyncInBackground = options?.background ?? (isAuthenticated && !!user);
          set({
            isCheckingAuth: !shouldSyncInBackground,
            isProfileSyncing: shouldSyncInBackground
          });

          const res = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
          });
          const data = await res.json();
          const lastServerReachableAt = Date.now();

          if (res.ok && data.user) {
            set({
              isAuthenticated: true,
              user: data.user,
              isCheckingAuth: false,
              isProfileSyncing: false,
              lastServerReachableAt
            });
            return;
          }

          set({
            isAuthenticated: false,
            user: null,
            isCheckingAuth: false,
            isProfileSyncing: false,
            lastServerReachableAt
          });
        } catch (e) {
          console.warn('Network error during checkAuth. Trusting persisted state:', e);
          set({ isCheckingAuth: false, isProfileSyncing: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
      // We only persist 'isAuthenticated' and 'user'. 'isCheckingAuth' should not be persisted.
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
    }
  )
);
