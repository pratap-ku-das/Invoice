import { create } from 'zustand';

type Mode = 'light' | 'dark';
const KEY = 'ims.theme';

function apply(mode: Mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

interface ThemeState {
  mode: Mode;
  toggle: () => void;
  init: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  mode: 'light',
  init: () => {
    const saved = (localStorage.getItem(KEY) as Mode | null) ?? 'light';
    apply(saved);
    set({ mode: saved });
  },
  toggle: () => {
    const next: Mode = get().mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    apply(next);
    set({ mode: next });
  },
}));
