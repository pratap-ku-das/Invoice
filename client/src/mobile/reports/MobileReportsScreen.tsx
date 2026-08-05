import { TrendingUp, DollarSign, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MobileReportsScreen() {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: 'GST Sales & Tax Report',
      subtitle: 'GSTR-1, GSTR-3B tax calculations',
      icon: FileSpreadsheet,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
      path: '/app/gst-reports',
    },
    {
      title: 'Revenue & Profitability',
      subtitle: 'Monthly sales and cashflow analysis',
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300',
      path: '/app/reports/sales',
    },
    {
      title: 'Expense Breakdown',
      subtitle: 'Category-wise business expenses',
      icon: DollarSign,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
      path: '/app/expenses',
    },
  ];

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-slate-100">Reports & Analytics</h1>
        <p className="text-xs text-slate-400">Business performance metrics & GST filings</p>
      </div>

      <div className="space-y-3">
        {reportCards.map((r, idx) => {
          const Icon = r.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(r.path)}
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 active:scale-98 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${r.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{r.title}</h3>
                  <p className="text-xs text-slate-400">{r.subtitle}</p>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
