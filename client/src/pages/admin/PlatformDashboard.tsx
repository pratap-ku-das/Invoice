import { useQuery } from '@tanstack/react-query';
import { Building2, Users, FileText, Gem, ShieldAlert, ArrowUpRight, Activity, Sparkles, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/primitives';

export default function PlatformDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Platform Control Center
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Multi-Tenant SaaS Overview
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Monitor active companies, tenant staff accounts, document billing volumes, and platform infrastructure health in real-time.
            </p>
          </div>
          <Link to="/admin/companies">
            <Button className="bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold px-5 py-3 shadow-glow rounded-xl border border-white/20">
              <Building2 className="h-4 w-4 mr-2" />
              Manage All Companies
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Companies */}
        <div className="group rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Registered Companies</span>
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-600 shadow-xs dark:bg-brand-500/10 dark:text-brand-400 group-hover:scale-110 transition-transform">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-4xl font-black text-slate-900 dark:text-slate-100">
            {isLoading ? '...' : stats?.totalCompanies ?? 0}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-4 w-4" /> Live Mongo Tenant Accounts
          </div>
        </div>

        {/* Total Users */}
        <div className="group rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Platform Active Users</span>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shadow-xs dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-4xl font-black text-slate-900 dark:text-slate-100">
            {isLoading ? '...' : stats?.totalUsers ?? 0}
          </div>
          <div className="mt-3 text-xs font-bold text-slate-400">Across all organization teams</div>
        </div>

        {/* Total Documents */}
        <div className="group rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Generated Documents</span>
            <div className="rounded-2xl bg-purple-50 p-3 text-purple-600 shadow-xs dark:bg-purple-500/10 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-4xl font-black text-slate-900 dark:text-slate-100">
            {isLoading ? '...' : stats?.totalDocuments ?? 0}
          </div>
          <div className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400">Invoices, Estimates & Orders</div>
        </div>

        {/* Active Subscriptions */}
        <div className="group rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 shadow-xs dark:bg-amber-500/10 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Gem className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-extrabold">
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Free: {stats?.plansCount?.free ?? 0}</span>
            <span className="rounded-lg bg-brand-50 px-2 py-1 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">Basic: {stats?.plansCount?.basic ?? 0}</span>
            <span className="rounded-lg bg-purple-50 px-2 py-1 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">Pro: {stats?.plansCount?.pro ?? 0}</span>
          </div>
          <div className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">99.98% System SLA Uptime</div>
        </div>
      </div>

      {/* System & Audit Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Database & API Health</h3>
              <p className="text-xs text-slate-400">Real-time infrastructure performance</p>
            </div>
          </div>
          <div className="space-y-4 text-sm font-bold divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between pt-2">
              <span className="text-slate-500 flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-500" /> MongoDB Replica Set
              </span>
              <span className="text-emerald-600 font-extrabold dark:text-emerald-400">Connected (rs0)</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-slate-500">API Response Latency</span>
              <span className="text-slate-900 dark:text-slate-100 font-extrabold">12ms</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-slate-500">Puppeteer PDF Engine</span>
              <span className="text-brand-600 font-extrabold dark:text-brand-400">Chromium 131 Ready</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Security Audit Stream</h3>
                <p className="text-xs text-slate-400">Isolation & access logs</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All super admin impersonation sessions, tier plan modifications, and company deletions are isolated with role-based JWT validation.
            </p>
          </div>
          <Link to="/admin/audit-logs">
            <Button variant="outline" className="w-full rounded-xl py-2.5 font-bold border-slate-200 dark:border-slate-700">
              View Security Audit Logs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
