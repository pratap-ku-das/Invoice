import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV, type NavItem } from '@/config/nav';
import { cn } from '@/lib/utils';

function Leaf({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-[7px] text-sm font-medium transition',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-xs border border-slate-200 dark:border-slate-800">
          <img src="/logos/app_logo.jpg" alt="Logo" className="h-full w-full object-contain p-0.5" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
            BalajiOne Invoice
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Billing Suite
          </div>
        </div>
        <button className="ml-auto lg:hidden" onClick={onClose} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-6 no-scrollbar">
        {NAV.map((section) => (
          <div key={section.section}>
            <div className="section-label">{section.section}</div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Leaf key={item.to} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white lg:block dark:border-slate-800 dark:bg-slate-950">
        {content}
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-950"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              {content}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
