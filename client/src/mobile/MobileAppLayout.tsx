import { ReactNode } from 'react';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

interface MobileAppLayoutProps {
  children: ReactNode;
  companyName?: string;
  unreadNotifications?: number;
}

export default function MobileAppLayout({ children, companyName, unreadNotifications }: MobileAppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 md:hidden">
      <MobileHeader companyName={companyName} unreadNotifications={unreadNotifications} />
      <main className="pb-16">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
