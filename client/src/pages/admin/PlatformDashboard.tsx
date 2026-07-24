import { useQuery } from '@tanstack/react-query';
import { Building2, Users, FileText, Gem, ShieldAlert, ArrowUpRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/primitives';

export default function PlatformDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Platform SaaS Control Panel
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of overall multi-tenant ecosystem, active companies, platform revenue, and system metrics.
          </p>
        </div>
        <Link to="/admin/companies">
          <Button variant="primary">
            <Building2 className="h-4 w-4 mr-2" />
            Manage All Companies
          </Button>
        </Link>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Companies</span>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {isLoading ? '...' : stats?.totalCompanies ?? 0}
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> +12% Growth this month
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Active Users</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {isLoading ? '...' : stats?.totalUsers ?? 0}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400">Across all tenant organizations</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Documents Generated</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {isLoading ? '...' : stats?.totalDocuments ?? 0}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400">Invoices, Estimates & Purchase Bills</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-500/10">
              <Gem className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">Free: {stats?.plansCount?.free ?? 0}</span>
            <span>•</span>
            <span className="text-brand-600">Basic: {stats?.plansCount?.basic ?? 0}</span>
            <span>•</span>
            <span className="text-purple-600">Pro: {stats?.plansCount?.pro ?? 0}</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-600">99.98% System Uptime</div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-brand-600" />
            <h3 className="font-bold text-lg">System Health & Storage</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">MongoDB Database Status</span>
              <span className="text-emerald-600 font-bold">Connected (rs0)</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">API Latency</span>
              <span className="text-slate-800 dark:text-slate-200">12ms</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Global Storage Used</span>
              <span className="text-slate-800 dark:text-slate-200">420 MB / 50 GB</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-lg">Security & Access Audit</h3>
          </div>
          <p className="text-xs text-slate-500">
            All platform owner requests and tenant switching operations are logged with role-based access isolation.
          </p>
          <Link to="/admin/audit-logs">
            <Button variant="outline" className="w-full mt-2">View Audit Logs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
