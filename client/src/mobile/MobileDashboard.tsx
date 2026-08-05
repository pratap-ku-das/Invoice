import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Users, Package, Scan, ArrowUpRight, TrendingUp } from 'lucide-react';

interface MobileDashboardProps {
  summaryData?: {
    todaySales?: number;
    monthlySales?: number;
    pendingPayments?: number;
    recentInvoices?: Array<{
      id: string;
      number: string;
      customerName: string;
      amount: number;
      status: string;
      date: string;
    }>;
  };
}

export default function MobileDashboard({ summaryData }: MobileDashboardProps) {
  const navigate = useNavigate();

  const quickActions = [
    {
      label: '+ Invoice',
      icon: FileText,
      color: 'bg-brand-600 text-white',
      onClick: () => navigate('/app/documents/invoice/new'),
    },
    {
      label: '+ Customer',
      icon: Users,
      color: 'bg-emerald-600 text-white',
      onClick: () => navigate('/app/parties/new?type=customer'),
    },
    {
      label: '+ Product',
      icon: Package,
      color: 'bg-purple-600 text-white',
      onClick: () => navigate('/app/products/new'),
    },
    {
      label: 'Scan Code',
      icon: Scan,
      color: 'bg-amber-600 text-white',
      onClick: () => navigate('/app/barcode'),
    },
  ];

  return (
    <div className="space-y-5 pb-20 p-4">
      {/* Revenue & Sales Card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-600 via-brand-700 to-indigo-900 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">Today's Sales</span>
          <div className="rounded-lg bg-white/10 p-1.5 backdrop-blur-xs">
            <TrendingUp className="h-4 w-4 text-emerald-300" />
          </div>
        </div>

        <div className="mt-2 text-3xl font-extrabold tracking-tight">
          ₹{(summaryData?.todaySales ?? 0).toLocaleString('en-IN')}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-brand-100">
          <div>
            <span className="text-brand-300">This Month: </span>
            <span className="font-bold text-white">₹{(summaryData?.monthlySales ?? 0).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-brand-300">Pending: </span>
            <span className="font-bold text-amber-300">₹{(summaryData?.pendingPayments ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs active:scale-95 transition-all dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} shadow-xs`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Invoices Swipe Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Invoices</h3>
          <button
            onClick={() => navigate('/app/documents/invoice')}
            className="flex items-center text-xs font-bold text-brand-600 dark:text-brand-400"
          >
            View All <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
          </button>
        </div>

        {!summaryData?.recentInvoices?.length ? (
          <div className="py-6 text-center text-xs text-slate-400">No recent invoices recorded today.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {summaryData.recentInvoices.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate(`/app/documents/invoice/${inv.id}`)}
                className="flex items-center justify-between py-3 active:bg-slate-50 dark:active:bg-slate-800/50 rounded-lg px-1 transition"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{inv.customerName}</div>
                  <div className="text-xs text-slate-400">#{inv.number} • {inv.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    {inv.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (+ New Invoice) */}
      <button
        onClick={() => navigate('/app/documents/invoice/new')}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl hover:bg-brand-700 active:scale-95 transition-all md:hidden"
        title="Create New Invoice"
      >
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}
