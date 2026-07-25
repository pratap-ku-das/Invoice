import { useQuery } from '@tanstack/react-query';
import { DollarSign, ArrowUpRight, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/primitives';

interface PaymentItem {
  id: string;
  number: string;
  companyName: string;
  partyName: string;
  amount: number;
  mode: string;
  type: string;
  status: string;
  date: string;
}

export default function PlatformPayments() {
  const { data: paymentsData, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => (await api.get('/admin/payments')).data,
  });

  const transactions: PaymentItem[] = paymentsData?.data ?? [];
  const totalRevenue: number = paymentsData?.totalRevenue ?? 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            SaaS Revenue & Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live database transactions and document invoice revenues across tenant companies.
          </p>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total System Revenue</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {isLoading ? '...' : formatCurrency(totalRevenue)}
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> Calculated from live invoices & payments
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions</span>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-brand-600">
            {isLoading ? '...' : `${transactions.length} Recorded`}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Payments & Voucher Receipts</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gateway Systems</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">UPI, Bank Transfer & Cash</div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">Multi-channel payment tracking</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Ref Number</th>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Party Name</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Mode</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Fetching real payment transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No payment transactions recorded yet. Real receipts created in ERP will automatically display here!
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono font-bold text-brand-600">{txn.number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{txn.companyName}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{txn.partyName}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(txn.amount)}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{txn.mode}</td>
                    <td className="px-6 py-4">
                      <Badge tone={txn.type === 'Received' ? 'green' : 'amber'}>
                        {txn.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{txn.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
