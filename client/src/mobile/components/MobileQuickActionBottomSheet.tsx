import { useNavigate } from 'react-router-dom';
import { X, FileText, UserPlus, PackagePlus, Wallet, Scan } from 'lucide-react';

interface MobileQuickActionBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileQuickActionBottomSheet({ open, onClose }: MobileQuickActionBottomSheetProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const actions = [
    {
      title: 'Create Sales Invoice',
      subtitle: 'Issue GST Bill / Tax Invoice',
      icon: FileText,
      color: 'bg-brand-600 text-white',
      onClick: () => navigate('/app/documents/invoice/new'),
    },
    {
      title: 'Add Customer / Party',
      subtitle: 'Register new buyer or client',
      icon: UserPlus,
      color: 'bg-emerald-600 text-white',
      onClick: () => navigate('/app/parties/new?type=customer'),
    },
    {
      title: 'Add Product / Item',
      subtitle: 'Catalog new stock item',
      icon: PackagePlus,
      color: 'bg-purple-600 text-white',
      onClick: () => navigate('/app/products/new'),
    },
    {
      title: 'Record Payment In',
      subtitle: 'Collect payment from customer',
      icon: Wallet,
      color: 'bg-amber-600 text-white',
      onClick: () => navigate('/app/payments/new'),
    },
    {
      title: 'Scan Barcode',
      subtitle: 'Quick item lookup',
      icon: Scan,
      color: 'bg-sky-600 text-white',
      onClick: () => navigate('/app/barcode'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Bottom Sheet Modal */}
      <div className="relative w-full rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 z-10 animate-in slide-in-from-bottom duration-200">
        {/* Drag Pill */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Quick Actions</h3>
            <p className="text-xs text-slate-500">Create & manage business records instantly</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onClose();
                  act.onClick();
                }}
                className="flex w-full items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-left transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800 active:scale-98"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${act.color} shadow-xs`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{act.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{act.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
