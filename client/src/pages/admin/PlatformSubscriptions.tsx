import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gem, ShieldCheck, Search, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Input, Select, Badge } from '@/components/ui/primitives';

export default function PlatformSubscriptions() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: companiesData, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'subscriptions', search, planFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      if (statusFilter) params.set('status', statusFilter);
      return (await api.get(`/admin/companies?${params.toString()}`)).data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Subscription & Plan Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage active company tier plans, recurring renewals, billing status, and trial expirations.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh List
        </Button>
      </div>

      {/* Plan Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Free Tier Accounts</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800">
              <Gem className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">₹0 / mo</div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Includes 1 User, 1 Branch, 50MB</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Tier Plan</span>
            <div className="rounded-xl bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-brand-600">₹499 / mo</div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Includes 3 Users, 2 Branches, 1GB</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pro Tier Plan</span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-500/10">
              <Gem className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-purple-600">₹999 / mo</div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Includes 10 Users, 5 Branches, 5GB</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise Custom</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10">
              <Gem className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600">₹1,999 / mo</div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Unlimited Users & Custom Storage</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search company name, email, plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="w-36">
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
          </Select>

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Plan Tier</th>
                <th className="px-6 py-4">Billing Cycle</th>
                <th className="px-6 py-4">Subscription Status</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Loading subscriptions...</td>
                </tr>
              ) : !companiesData?.data?.length ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No subscriptions found matching filter criteria.</td>
                </tr>
              ) : (
                companiesData.data.map((comp: any) => (
                  <tr key={comp.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                      {comp.name}
                      <div className="text-xs font-normal text-slate-400">{comp.email || comp.phone || 'No contact'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={comp.subscription?.plan === 'pro' ? 'purple' : comp.subscription?.plan === 'basic' ? 'blue' : 'gray'}>
                        {(comp.subscription?.plan || 'free').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">Monthly Auto-Renew</td>
                    <td className="px-6 py-4">
                      <Badge tone={comp.subscription?.status === 'active' ? 'green' : 'red'}>
                        {(comp.subscription?.status || 'active').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </td>
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
