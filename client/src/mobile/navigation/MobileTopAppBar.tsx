import { Bell, Sparkles, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileTopAppBarProps {
  companyName?: string;
  unreadNotifications?: number;
  onOpenDrawer: () => void;
}

export function MobileTopAppBar({
  companyName = 'BalajiOne ERP',
  unreadNotifications = 0,
  onOpenDrawer,
}: MobileTopAppBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 md:hidden shadow-xs">
      {/* Business Name Badge */}
      <button onClick={onOpenDrawer} className="flex items-center gap-2.5 text-left active:scale-95 transition">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Business</div>
          <div className="max-w-[150px] truncate text-xs font-black text-slate-900 dark:text-slate-100">
            {companyName}
          </div>
        </div>
      </button>

      {/* Top Action Icons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/app/ai')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300"
          title="AI Assistant"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
        </button>

        <button
          onClick={() => navigate('/app/notifications')}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate('/app/profile')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
          title="User Profile"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
