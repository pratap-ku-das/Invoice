import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Package, Users, Settings } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/app', icon: LayoutDashboard },
    { label: 'Invoices', path: '/app/documents/invoice', icon: FileText },
    { label: 'Products', path: '/app/products', icon: Package },
    { label: 'Parties', path: '/app/parties', icon: Users },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
              isActive
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[11px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
