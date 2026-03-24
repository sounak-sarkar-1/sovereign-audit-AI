import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'auditor' | 'client';
  isFirstLogin: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  tenantSlug: string | null;
  setAuth: (user: User, token: string, tenantSlug: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      tenantSlug: null,
      setAuth: (user, accessToken, tenantSlug) => {
        set({ user, accessToken, tenantSlug });
      },
      clearAuth: () => {
        set({ user: null, accessToken: null, tenantSlug: null });
      },
      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
