import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export function MobileGstScreen() {
  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-slate-100">GST Tax Compliance</h1>
        <p className="text-xs text-slate-400">Automated CGST, SGST, and IGST tax summary</p>
      </div>

      {/* Tax Summary Cards */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-5 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">GST Collected This Month</span>
          <ShieldCheck className="h-5 w-5 text-emerald-200" />
        </div>
        <div className="text-3xl font-black">₹0.00</div>
        <div className="flex items-center justify-between text-xs text-emerald-100 border-t border-white/10 pt-3">
          <div>CGST + SGST: <span className="font-bold">₹0.00</span></div>
          <div>IGST: <span className="font-bold">₹0.00</span></div>
        </div>
      </div>

      {/* Filing Deadlines */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-brand-600" /> Upcoming Return Filing Deadlines
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">GSTR-1 (Outward Supplies)</div>
              <div className="text-[10px] text-slate-400">Monthly Return</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-brand-600">11th of every month</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Auto-Generated
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">GSTR-3B (Summary Return)</div>
              <div className="text-[10px] text-slate-400">Tax Liability Filing</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-brand-600">20th of every month</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Ready to Export
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
