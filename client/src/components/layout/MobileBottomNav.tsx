import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Boxes,
  Users,
  X,
  ShoppingCart,
  UserPlus,
  PackagePlus,
  Receipt,
  Printer,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard, exact: true },
    { to: '/app/documents/sales_invoice', label: 'Invoices', icon: FileText },
    { to: '/app/stock', label: 'Stock', icon: Boxes },
    { to: '/app/parties', label: 'Parties', icon: Users },
  ];

  const quickActions = [
    {
      title: 'Sales Invoice',
      subtitle: 'Create & send GST invoice',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      action: () => navigate('/app/documents/sales_invoice/new'),
    },
    {
      title: 'POS Receipt',
      subtitle: 'Fast thermal billing receipt',
      icon: Printer,
      color: 'from-emerald-500 to-teal-600',
      action: () => navigate('/app/documents/sales_invoice/new?pos=true'),
    },
    {
      title: 'Purchase Bill',
      subtitle: 'Record vendor purchase',
      icon: ShoppingCart,
      color: 'from-purple-500 to-violet-600',
      action: () => navigate('/app/documents/purchase_bill/new'),
    },
    {
      title: 'Add Customer / Supplier',
      subtitle: 'Create party record',
      icon: UserPlus,
      color: 'from-amber-500 to-orange-600',
      action: () => navigate('/app/parties'),
    },
    {
      title: 'Add Product / Item',
      subtitle: 'Add inventory product',
      icon: PackagePlus,
      color: 'from-pink-500 to-rose-600',
      action: () => navigate('/app/products'),
    },
    {
      title: 'Record Expense',
      subtitle: 'Track business expenses',
      icon: Receipt,
      color: 'from-red-500 to-rose-600',
      action: () => navigate('/app/expenses'),
    },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Hidden on Large Desktop Screens) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 block border-t border-slate-200/80 bg-white/95 px-3 py-1.5 backdrop-blur-lg lg:hidden dark:border-slate-800/80 dark:bg-slate-950/95"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between">
          {/* Left Nav Items */}
          <div className="flex flex-1 justify-around">
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-1 transition-all',
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium',
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
                  <span className="text-[10px] tracking-tight">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Elevated Floating (+) Quick Action Button */}
          <div className="relative -top-4 mx-2 flex justify-center">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={cn(
                'flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-500 text-white shadow-xl ring-4 ring-white transition-all active:scale-90 dark:ring-slate-950',
                menuOpen && 'rotate-45 from-red-600 to-rose-600',
              )}
              aria-label="Quick create menu"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
            </button>
          </div>

          {/* Right Nav Items */}
          <div className="flex flex-1 justify-around">
            {navItems.slice(2, 4).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-1 transition-all',
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium',
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
                  <span className="text-[10px] tracking-tight">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Quick Action Drawer Modal */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Quick Create
                  </h3>
                  <p className="text-xs text-slate-400">Choose action to perform</p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                {quickActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.title}
                      onClick={() => {
                        setMenuOpen(false);
                        act.action();
                      }}
                      className="group flex flex-col items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-left transition hover:border-brand-300 hover:bg-white active:scale-98 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
                          act.color,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {act.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{act.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
