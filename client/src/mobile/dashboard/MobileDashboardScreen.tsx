import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Scan,
  AlertTriangle,
  FileText,
  Users,
  Package,
} from 'lucide-react';
import { MobileQuickActionBottomSheet } from '../components/MobileQuickActionBottomSheet';

interface MobileDashboardScreenProps {
  summaryData?: {
    todaySales?: number;
    monthlySales?: number;
    pendingPayments?: number;
    youWillGet?: number;
    youWillPay?: number;
    lowStockCount?: number;
    recentInvoices?: Array<{
      _id: string;
      number: string;
      partyName: string;
      totalAmount: number;
      status: string;
      date: string;
    }>;
  };
}

export function MobileDashboardScreen({ summaryData }: MobileDashboardScreenProps) {
  const navigate = useNavigate();
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Revenue & Today's Collection Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-200">Today's Revenue</span>
          <div className="rounded-xl bg-white/10 p-2 backdrop-blur-xs">
            <TrendingUp className="h-4 w-4 text-emerald-300" />
          </div>
        </div>

        <div className="mt-2 text-3xl font-black tracking-tight">
          ₹{(summaryData?.todaySales ?? 0).toLocaleString('en-IN')}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
          <div>
            <span className="text-brand-300">This Month: </span>
            <span className="font-extrabold text-white">₹{(summaryData?.monthlySales ?? 0).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-brand-300">Pending: </span>
            <span className="font-extrabold text-amber-300">₹{(summaryData?.pendingPayments ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Khatabook / Vyapar Style Money In / Money Out Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* You'll Get */}
        <div
          onClick={() => navigate('/app/parties?filter=receivable')}
          className="flex flex-col gap-1 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 shadow-xs dark:border-emerald-950/40 dark:bg-emerald-950/30 active:scale-98 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300">You'll Get</span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-emerald-800 dark:text-emerald-200">
            ₹{(summaryData?.youWillGet ?? summaryData?.pendingPayments ?? 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* You'll Pay */}
        <div
          onClick={() => navigate('/app/parties?filter=payable')}
          className="flex flex-col gap-1 rounded-2xl border border-red-100 bg-red-50/60 p-3.5 shadow-xs dark:border-red-950/40 dark:bg-red-950/30 active:scale-98 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-red-700 dark:text-red-300">You'll Pay</span>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-lg font-black text-red-800 dark:text-red-200">
            ₹{(summaryData?.youWillPay ?? 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Stock Warning Banner */}
      {(summaryData?.lowStockCount ?? 0) > 0 && (
        <div
          onClick={() => navigate('/app/products?filter=low_stock')}
          className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900 shadow-xs dark:border-amber-950/50 dark:bg-amber-950/40 dark:text-amber-200 active:scale-98 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-black">{summaryData?.lowStockCount} Products Low on Stock</div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400">Tap to restock items</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      )}

      {/* Quick Action Grid */}
      <div>
        <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => navigate('/app/documents/invoice/new')}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs active:scale-95 transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">+ Invoice</span>
          </button>

          <button
            onClick={() => navigate('/app/parties/new?type=customer')}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs active:scale-95 transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">+ Customer</span>
          </button>

          <button
            onClick={() => navigate('/app/products/new')}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs active:scale-95 transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">+ Product</span>
          </button>

          <button
            onClick={() => navigate('/app/barcode')}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs active:scale-95 transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
              <Scan className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">Scan</span>
          </button>
        </div>
      </div>

      {/* Recent Invoices Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Recent Invoices</h3>
          <button
            onClick={() => navigate('/app/documents/invoice')}
            className="flex items-center text-xs font-bold text-brand-600 dark:text-brand-400"
          >
            View All <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
          </button>
        </div>

        {!summaryData?.recentInvoices?.length ? (
          <div className="py-6 text-center text-xs text-slate-400">No invoices generated today yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {summaryData.recentInvoices.slice(0, 5).map((inv) => (
              <div
                key={inv._id}
                onClick={() => navigate(`/app/documents/invoice/${inv._id}`)}
                className="flex items-center justify-between py-3 active:bg-slate-50 dark:active:bg-slate-800/50 rounded-lg px-1 transition"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{inv.partyName || 'Cash Sale'}</div>
                  <div className="text-[10px] text-slate-400">#{inv.number} • {inv.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                    ₹{(inv.totalAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Material Design 3 Floating Action Button (FAB) */}
      <button
        onClick={() => setBottomSheetOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-2xl hover:bg-brand-700 active:scale-95 transition-all md:hidden"
        title="Open Quick Actions"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Material 3 Bottom Sheet Modal */}
      <MobileQuickActionBottomSheet open={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)} />
    </div>
  );
}
