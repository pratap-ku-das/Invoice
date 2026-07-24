import { create } from 'zustand';
import { api, tokenStore } from '@/lib/api';
import { queryClient } from '@/lib/query';
import type { AuthResponse, AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (dto: {
    name: string;
    email: string;
    password: string;
    companyName: string;
  }) => Promise<AuthUser>;
  switchCompany: (companyId: string) => Promise<void>;
  createCompany: (dto: { name: string; gstin?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

const USER_KEY = 'ims.user';

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,

  hydrate: () => {
    const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    const user = raw && tokenStore.access ? (JSON.parse(raw) as AuthUser) : null;
    set({ user, ready: true });
  },

  login: async (email, password) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    tokenStore.set(data.accessToken, data.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user });
    return data.user;
  },

  register: async (dto) => {
    const { data } = await api.post<AuthResponse>('/auth/register', dto);
    tokenStore.set(data.accessToken, data.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user });
    return data.user;
  },

  switchCompany: async (companyId) => {
    const { data } = await api.post<AuthResponse>('/auth/switch-company', { companyId });
    tokenStore.set(data.accessToken, data.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user });
    queryClient.clear();
  },

  createCompany: async (dto) => {
    const { data } = await api.post<AuthResponse>('/auth/companies', dto);
    tokenStore.set(data.accessToken, data.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user });
    queryClient.clear();
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_KEY);
    queryClient.clear();
    set({ user: null });
    window.location.href = '/';
  },
}));
