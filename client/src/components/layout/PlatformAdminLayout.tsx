import { Suspense, useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  UserRound,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { PlatformSidebar } from './PlatformSidebar';
import { useAuth } from '@/store/auth';
import { useTheme } from '@/store/theme';
import { Skeleton } from '@/components/ui/feedback';

function AdminUserMenu() {
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
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-sm font-bold text-white shadow-xs">
          {user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <div className="hidden text-left text-xs sm:block">
          <div className="font-bold leading-tight text-slate-900 dark:text-slate-100">{user?.name}</div>
          <div className="font-semibold text-brand-600 dark:text-brand-400">Platform Owner</div>
        </div>
        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
              <p className="truncate text-sm font-bold">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <div className="mt-1 space-y-0.5">
              <button className="menu-item" onClick={() => { setOpen(false); navigate('/admin/profile'); }}>
                <UserRound className="h-4 w-4" /> Admin Profile
              </button>
              <button className="menu-item" onClick={() => { setOpen(false); navigate('/app'); }}>
                <Building2 className="h-4 w-4" /> Switch to Company ERP
              </button>
              <button className="menu-item" onClick={toggle}>
                {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button className="menu-item !text-red-600" onClick={() => logout()}>
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

export function PlatformAdminLayout() {
  const { user, ready } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!ready) return null;

  // Strict Platform Owner Guard
  const isPlatformOwner =
    user?.role === 'super_admin' || user?.role === 'platform_owner' || user?.role === 'admin';
  if (!user || !isPlatformOwner) {
    return <Navigate to="/app" replace />;
  }

  // Breadcrumb path resolution
  const pathParts = location.pathname.split('/').filter(Boolean);

  return (
    <div className="flex h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <PlatformSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Platform Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <Link to="/admin/companies" className="hover:text-brand-600">Platform Admin</Link>
            {pathParts.slice(1).map((part, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="capitalize text-slate-800 dark:text-slate-200 font-bold">{part}</span>
              </div>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/app"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <Building2 className="h-3.5 w-3.5" />
              Go to Company ERP
            </Link>
            <AdminUserMenu />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
