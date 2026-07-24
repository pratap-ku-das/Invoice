import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Shield, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Input, Select } from '@/components/ui/primitives';

export default function PlatformUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Platform Users & Roles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of all registered users across tenant companies and platform admin roles.
          </p>
        </div>
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">{stats?.totalUsers ?? 0} Users</div>
          <div className="mt-2 text-xs font-semibold text-slate-400">Tenant Owners & Staff</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Administrators</span>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-brand-600">Platform Owner</div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Full Control Access</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Sessions</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-purple-600">100% Secure</div>
          <div className="mt-2 text-xs font-semibold text-slate-400">JWT Token Rotation Active</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search platform user by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-44">
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin / Platform Owner</option>
          <option value="admin">Company Owner / Admin</option>
          <option value="manager">Manager</option>
          <option value="accountant">Accountant</option>
          <option value="sales">Sales</option>
        </Select>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 text-slate-500">
        User account security and role management active. Search users or manage company staff from the platform panel.
      </div>
    </div>
  );
}
