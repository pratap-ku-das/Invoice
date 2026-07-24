import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({ baseURL: BASE_URL });

const TOKEN_KEY = 'ims.accessToken';
const REFRESH_KEY = 'ims.refreshToken';

export const tokenStore = {
  get access() {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },
  get refresh() {
    return sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    sessionStorage.setItem(TOKEN_KEY, access);
    sessionStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refresh,
    });
    tokenStore.set(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing = refreshing ?? doRefresh();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      if (!location.pathname.startsWith('/login')) location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data!.message.join(', ');
    return data?.message ?? err.message;
  }
  return 'Something went wrong';
}
