import { Suspense, useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GlobalSearch } from './GlobalSearch';
import { MobileBottomNav } from './MobileBottomNav';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';
import { AppUpdateModal } from '@/components/update/AppUpdateModal';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/feedback';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: notif } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await api.get<{ count: number }>('/notifications/unread-count')).data,
    enabled: !!user,
    refetchInterval: 60_000,
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

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onMenu={() => setMobileOpen(true)}
          onSearch={() => setSearchOpen(true)}
          notifCount={notif?.count ?? 0}
        />
        <main className="min-w-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileBottomNav />
      <PWAInstallBanner />
      <AppUpdateModal />
    </div>
  );
}
