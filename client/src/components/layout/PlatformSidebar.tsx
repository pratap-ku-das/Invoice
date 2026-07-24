import { NavLink } from 'react-router-dom';
import { X, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PLATFORM_NAV, type PlatformNavItem } from '@/config/platformNav';
import { cn } from '@/lib/utils';

function Leaf({ item, onNavigate }: { item: PlatformNavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2 text.sm font-medium transition-all duration-150',
          isActive
            ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-500/20 dark:bg-brand-600 dark:text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

export function PlatformSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const content = (
    <div className="flex h-full flex-col">
      {/* Platform Admin Header */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
            Platform Owner
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            SaaS Control Panel
          </div>
        </div>
        <button className="ml-auto lg:hidden" onClick={onClose} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-none">
        {PLATFORM_NAV.map((sec) => (
          <div key={sec.section} className="space-y-1">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {sec.section}
            </div>
            {sec.items.map((item) => (
              <Leaf key={item.to} item={item} onNavigate={onClose} />
            ))}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
        {content}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 lg:hidden shadow-2xl"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
