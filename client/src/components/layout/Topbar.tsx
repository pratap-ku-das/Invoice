import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  UserRound,
  Gem,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/store/auth';
import { useTheme } from '@/store/theme';
import { AiCopilotWidget } from '../ai/AiCopilotWidget';

function UserMenu() {
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Account menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="hidden text-left text-sm sm:block">
          <div className="font-medium leading-tight">{user?.name}</div>
          <div className="text-xs capitalize text-slate-400">{user?.role}</div>
        </div>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="card absolute right-0 top-full z-50 mt-2 w-56 p-1.5 shadow-soft"
          >
            <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <div className="mt-1 space-y-0.5">
              <button className="menu-item" onClick={() => go('/app/settings')}>
                <UserRound className="h-4 w-4" /> Profile & Settings
              </button>
              <button className="menu-item" onClick={() => go('/app/plan')}>
                <Gem className="h-4 w-4" /> Plan & Billing
              </button>
              <button className="menu-item" onClick={toggle}>
                {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {mode === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                className="menu-item !text-red-600 hover:!bg-red-50 dark:!text-red-400 dark:hover:!bg-red-500/10"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Topbar({
  onMenu,
  onSearch,
  notifCount = 0,
}: {
  onMenu: () => void;
  onSearch: () => void;
  notifCount?: number;
}) {
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-1.5 sm:gap-3 border-b border-slate-200/80 bg-white/80 px-2.5 sm:px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <button className="lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          onClick={onSearch}
          className="flex flex-1 items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-400 transition hover:border-brand-400 hover:text-slate-500 md:max-w-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="truncate">Search...</span>
          <kbd className="ml-auto hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 md:inline dark:border-slate-600 dark:bg-slate-800">
            Ctrl K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* AI Copilot Action Button */}
          <button
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-purple-500/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-300 hover:from-brand-500/20 hover:to-purple-500/20 transition shadow-xs"
            title="Open BalajiOne AI Copilot"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400 animate-pulse" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          <button
            onClick={() => navigate('/app/notifications')}
            className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          <UserMenu />
        </div>
      </header>

      <AiCopilotWidget open={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}
