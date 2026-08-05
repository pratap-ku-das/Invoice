import { useNavigate } from 'react-router-dom';
import {
  X,
  Building2,
  BarChart2,
  FileSpreadsheet,
  Receipt,
  Crown,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/store/auth';

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  companyName?: string;
}

export function MobileNavDrawer({ open, onClose, companyName = 'BalajiOne ERP' }: MobileNavDrawerProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!open) return null;

  const drawerItems = [
    { label: 'Reports & Analytics', path: '/app/reports', icon: BarChart2, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'GST Tax Compliance', path: '/app/gst-reports', icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Expenses Manager', path: '/app/expenses', icon: Receipt, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Subscription Plan', path: '/app/plan', icon: Crown, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Support & Help', path: '/app/support', icon: HelpCircle, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' },
    { label: 'Settings', path: '/app/settings', icon: Settings, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative flex w-4/5 max-w-xs flex-col bg-white p-5 shadow-2xl dark:bg-slate-900 h-full overflow-y-auto z-10">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-extrabold text-slate-900 dark:text-slate-100">{companyName}</h2>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Business
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="my-4 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Business User'}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
          <div className="mt-2 inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 uppercase">
            {user?.role?.replace('_', ' ') || 'OWNER'}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-1.5 py-2">
          {drawerItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  onClose();
                  navigate(item.path);
                }}
                className="flex w-full items-center justify-between rounded-2xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            );
          })}
        </div>

        {/* Drawer Footer / Logout */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600 dark:bg-red-950/40 dark:text-red-300"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
