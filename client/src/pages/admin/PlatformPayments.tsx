import { useQuery } from '@tanstack/react-query';
import { DollarSign, ArrowUpRight, CheckCircle2, ShieldCheck, Loader2, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/primitives';

interface CompanySubscriptionItem {
  id: string;
  companyName: string;
  companyEmail: string;
  plan: string;
  planPrice: number;
  amountFormatted: string;
  status: string;
  expiresAt: string;
  date: string;
}

export default function PlatformPayments() {
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => (await api.get('/admin/payments')).data,
  });

  const companies: CompanySubscriptionItem[] = paymentsData?.data ?? [];
  const totalSaasRevenue: number = paymentsData?.totalSaasRevenue ?? 0;
  const paidSubscriptionsCount: number = paymentsData?.paidSubscriptionsCount ?? 0;
  const totalCompaniesCount: number = paymentsData?.totalCompaniesCount ?? 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            SaaS Subscription Billing & Company Payments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of tenant company paid subscription plans, recurring monthly revenue (MRR), and tier renewals.
          </p>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monthly Subscription MRR</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {isLoading ? '...' : formatCurrency(totalSaasRevenue)} / mo
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> Recurring subscription revenue across active companies
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Subscriptions</span>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-brand-600">
            {isLoading ? '...' : `${paidSubscriptionsCount} Paid Plans`}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Basic (₹499) & Pro (₹999) tiers</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Companies</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-purple-600">
            {isLoading ? '...' : `${totalCompaniesCount} Companies`}
          </div>
          <div className="mt-2 text-xs font-semibold text-purple-600">Active tenant accounts</div>
        </div>
      </div>

      {/* Company Subscriptions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Owner Email</th>
                <th className="px-6 py-4">Subscription Plan</th>
                <th className="px-6 py-4">Monthly Rate</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Renewal / Expiry</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Fetching company subscription payments...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No company accounts registered yet.
                  </td>
                </tr>
              ) : (
                companies.map((comp) => (
                  <tr key={comp.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{comp.companyName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-brand-600">{comp.companyEmail}</td>
                    <td className="px-6 py-4">
                      <Badge tone={comp.plan.includes('PRO') ? 'purple' : comp.plan.includes('BASIC') ? 'blue' : 'slate'}>
                        {comp.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-slate-100">
                      {comp.amountFormatted} / mo
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={comp.status === 'active' ? 'green' : 'amber'}>
                        {comp.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{comp.expiresAt}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{comp.date}</td>
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
