import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Package, Users, Menu } from 'lucide-react';

interface MobileBottomNavM3Props {
  onOpenDrawer: () => void;
}

export function MobileBottomNavM3({ onOpenDrawer }: MobileBottomNavM3Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/app', icon: LayoutDashboard },
    { label: 'Invoices', path: '/app/documents/invoice', icon: FileText },
    { label: 'Stock', path: '/app/products', icon: Package },
    { label: 'Parties', path: '/app/parties', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 py-1.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/app' && location.pathname.startsWith(item.path));

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="group relative flex flex-col items-center gap-1 py-1 px-3"
          >
            {/* Material Design 3 Pill Active Indicator */}
            <div
              className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-xs dark:bg-brand-500'
                  : 'text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={`text-[11px] tracking-tight transition-all ${
                isActive
                  ? 'font-extrabold text-brand-600 dark:text-brand-400'
                  : 'font-medium text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* More / Menu Drawer Button */}
      <button
        onClick={onOpenDrawer}
        className="group relative flex flex-col items-center gap-1 py-1 px-3"
      >
        <div className="flex h-8 w-14 items-center justify-center rounded-full text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100 transition-all">
          <Menu className="h-5 w-5" />
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">More</span>
      </button>
    </nav>
  );
}
