import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Shield, UserCheck, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Input, Select, Badge } from '@/components/ui/primitives';

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  companyName: string;
  createdAt: string;
  isActive: boolean;
}

export default function PlatformUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter],
    queryFn: async () => {
      const res = await api.get('/admin/users', {
        params: { search, role: roleFilter, limit: 50 },
      });
      return res.data;
    },
  });

  const users: UserItem[] = usersData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Platform Users & Roles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live database records of all registered users across tenant companies and admin roles.
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
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">{stats?.totalUsers ?? users.length} Users</div>
          <div className="mt-2 text-xs font-semibold text-slate-400">Tenant Owners & Staff</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Administrators</span>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-brand-600">
            {users.filter((u) => u.role === 'super_admin' || u.role === 'platform_owner').length || 1} Admins
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">Full Control Access</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Accounts</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-purple-600">
            {users.filter((u) => u.isActive).length || users.length} Active
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400">JWT Authentication Active</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search live users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-48">
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin / Platform Owner</option>
          <option value="admin">Company Owner / Admin</option>
          <option value="manager">Manager</option>
          <option value="accountant">Accountant</option>
          <option value="sales">Sales</option>
        </Select>
      </div>

      {/* Real Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Assigned Company</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Fetching real users from database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No users match search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{u.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-brand-600">{u.email}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{u.companyName}</td>
                    <td className="px-6 py-4">
                      <Badge tone={u.role === 'super_admin' ? 'purple' : u.role === 'admin' ? 'blue' : 'slate'}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={u.isActive ? 'green' : 'red'}>
                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{u.createdAt}</td>
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
