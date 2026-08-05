import { Suspense, useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, ShieldAlert, CreditCard, RefreshCw } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalSearch } from './GlobalSearch';
import { MobileTopAppBar } from '@/mobile/navigation/MobileTopAppBar';
import { MobileBottomNavM3 } from '@/mobile/navigation/MobileBottomNavM3';
import { MobileNavDrawer } from '@/mobile/navigation/MobileNavDrawer';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';
import { AppUpdateModal } from '@/components/update/AppUpdateModal';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/feedback';
import { Button, Badge } from '@/components/ui/primitives';

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

export function AppLayout() {
  const { user, ready } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: notif } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await api.get<{ count: number }>('/notifications/unread-count')).data,
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const { data: company, refetch: refetchCompany, isFetching: companyFetching } = useQuery<{
    _id: string;
    name: string;
    approvalStatus?: string;
    isApproved?: boolean;
  }>({
    queryKey: ['company'],
    queryFn: async () => (await api.get('/company')).data,
    enabled: !!user,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;

  const isPendingApproval =
    user.role !== 'super_admin' &&
    user.role !== 'platform_owner' &&
    company &&
    (company.approvalStatus === 'pending' || company.isApproved === false);

  const isAllowedPath = location.pathname.includes('/plan') || location.pathname.includes('/support');

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden">
      {/* Desktop Navigation System (hidden on small screens / mobile viewports) */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Desktop Topbar */}
        <div className="hidden lg:block">
          <Topbar
            onMenu={() => setMobileOpen(true)}
            onSearch={() => setSearchOpen(true)}
            notifCount={notif?.count ?? 0}
          />
        </div>

        {/* Material Design 3 Mobile Top App Bar */}
        <MobileTopAppBar
          companyName={company?.name}
          unreadNotifications={notif?.count ?? 0}
          onOpenDrawer={() => setMobileDrawerOpen(true)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
          {isPendingApproval && !isAllowedPath ? (
            <div className="flex min-h-[85vh] flex-col items-center justify-center p-6 text-center font-sans">
              <div className="w-full max-w-xl rounded-3xl border border-amber-200/80 bg-white p-8 shadow-2xl dark:border-amber-500/30 dark:bg-slate-900 space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 ring-8 ring-amber-50/50 dark:ring-amber-500/5">
                  <Clock className="h-10 w-10 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <Badge tone="amber">
                    VERIFICATION PENDING
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                    Account Verification Required
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your registered business <strong className="text-slate-900 dark:text-slate-100">{company?.name}</strong> is currently pending Super Admin approval or subscription payment confirmation.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 space-y-2 text-left">
                  <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-500" /> How to activate your account:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                    <li><strong>Instant Activation via Payment:</strong> Subscribe to any plan via Razorpay to instantly verify and unlock your account.</li>
                    <li><strong>Manual Verification:</strong> Super Admin will review your registered business details and approve your company.</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    onClick={() => navigate('/app/plan')}
                    className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 shadow-lg shadow-brand-500/25"
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Subscribe & Activate Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => refetchCompany()}
                    loading={companyFetching}
                    className="w-full sm:w-auto font-bold py-2.5 px-4"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Re-check Status
                  </Button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  Need help? WhatsApp / Call Support at <span className="font-bold text-slate-700 dark:text-slate-200">+91 93485 32113</span> (Mon-Sat, 10 AM - 6 PM)
                </div>
              </div>
            </div>
          ) : (
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          )}
        </main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Material Design 3 Mobile Navigation Bar */}
      <MobileBottomNavM3 onOpenDrawer={() => setMobileDrawerOpen(true)} />

      {/* Material Design 3 Mobile Navigation Drawer */}
      <MobileNavDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        companyName={company?.name}
      />

      <PWAInstallBanner />
      <AppUpdateModal />
    </div>
  );
}
