import {
  LayoutDashboard,
  Building2,
  Gem,
  CreditCard,
  Users,
  LifeBuoy,
  BarChart3,
  Settings,
  ShieldAlert,
  User,
  Bell,
  type LucideIcon,
} from 'lucide-react';

export interface PlatformNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
}

export interface PlatformNavSection {
  section: string;
  items: PlatformNavItem[];
}

export const PLATFORM_NAV: PlatformNavSection[] = [
  {
    section: 'Main',
    items: [
      { label: 'Platform Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Company Management',
    items: [
      { label: 'All Companies', to: '/admin/companies', icon: Building2 },
    ],
  },
  {
    section: 'Subscription & Billing',
    items: [
      { label: 'Subscriptions & Plans', to: '/admin/subscriptions', icon: Gem },
      { label: 'Transactions & Payments', to: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    section: 'User & Access',
    items: [
      { label: 'Platform Users & Roles', to: '/admin/users', icon: Users },
      { label: 'Support & Tickets', to: '/admin/support', icon: LifeBuoy },
    ],
  },
  {
    section: 'Analytics & System',
    items: [
      { label: 'Platform Analytics', to: '/admin/analytics', icon: BarChart3 },
      { label: 'Push Notifications', to: '/admin/notifications', icon: Bell },
      { label: 'App Releases', to: '/admin/releases', icon: Gem },
      { label: 'System Settings', to: '/admin/system', icon: Settings },
      { label: 'Audit & Activity Logs', to: '/admin/audit-logs', icon: ShieldAlert },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Admin Profile', to: '/admin/profile', icon: User },
    ],
  },
];
