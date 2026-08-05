import { useAuth } from '@/store/auth';
import { Building2, Crown, LogOut, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MobileProfileScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-slate-100">Business Profile & Settings</h1>
        <p className="text-xs text-slate-400">Account management & app preferences</p>
      </div>

      {/* User Card */}
      <div className="flex items-center gap-3.5 rounded-3xl bg-white p-4 border border-slate-200/80 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 font-black text-white text-xl shadow-md">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-extrabold text-slate-900 dark:text-slate-100">{user?.name}</h2>
          <p className="truncate text-xs text-slate-400 font-medium">{user?.email}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 uppercase">
              {user?.role?.replace('_', ' ') || 'OWNER'}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div
        onClick={() => navigate('/app/plan')}
        className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 p-4 text-white shadow-md active:scale-98 transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <Crown className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <div className="text-xs font-extrabold">Starter Plan Active</div>
            <div className="text-[10px] text-purple-200">Unlimited GST billing & multi-device sync</div>
          </div>
        </div>
        <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-purple-700 shadow-xs">Upgrade</span>
      </div>

      {/* Menu Actions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:divide-slate-800 shadow-xs">
        <button
          onClick={() => navigate('/app/settings')}
          className="flex w-full items-center justify-between p-3.5 text-xs font-extrabold text-slate-800 dark:text-slate-200"
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-brand-600" /> Business Details & Tax Settings
          </div>
        </button>

        <button
          onClick={() => navigate('/app/support')}
          className="flex w-full items-center justify-between p-3.5 text-xs font-extrabold text-slate-800 dark:text-slate-200"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="h-4 w-4 text-sky-500" /> WhatsApp & Phone Support
          </div>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 p-3.5 text-xs font-extrabold text-red-600 dark:bg-red-950/40 dark:text-red-300 active:scale-98 transition"
      >
        <LogOut className="h-4 w-4" /> Sign Out of Account
      </button>
    </div>
  );
}
