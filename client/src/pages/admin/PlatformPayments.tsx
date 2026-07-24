import { DollarSign, ArrowUpRight, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button, Badge } from '@/components/ui/primitives';

const MOCK_TRANSACTIONS = [
  { id: 'TXN-9021', company: 'Sharma Electronics', plan: 'Pro Plan', amount: '₹999', gateway: 'Razorpay', status: 'paid', date: '2026-07-24' },
  { id: 'TXN-9020', company: 'Patel Supermarket', plan: 'Basic Plan', amount: '₹499', gateway: 'Stripe', status: 'paid', date: '2026-07-23' },
  { id: 'TXN-9019', company: 'Verma Enterprises', plan: 'Pro Plan', amount: '₹999', gateway: 'Razorpay', status: 'pending', date: '2026-07-22' },
  { id: 'TXN-9018', company: 'Gupta Traders', plan: 'Basic Plan', amount: '₹499', gateway: 'UPI Direct', status: 'paid', date: '2026-07-21' },
];

export default function PlatformPayments() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            SaaS Revenue & Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor incoming platform subscription payments, payout histories, and gateway logs.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Revenue CSV
        </Button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total SaaS Revenue</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">₹1,48,500</div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> +18.4% this month
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Successful Transactions</span>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-brand-600">312 Paid</div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Auto-renewals active</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Connected Gateways</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">Razorpay & Stripe</div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">Webhooks active & healthy</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Subscription Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Gateway</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_TRANSACTIONS.map((txn) => (
                <tr key={txn.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono font-bold text-brand-600">{txn.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{txn.company}</td>
                  <td className="px-6 py-4 text-xs font-semibold">{txn.plan}</td>
                  <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-slate-100">{txn.amount}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">{txn.gateway}</td>
                  <td className="px-6 py-4">
                    <Badge tone={txn.status === 'paid' ? 'green' : 'amber'}>
                      {txn.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
