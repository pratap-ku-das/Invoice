import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Users,
  FileText,
  Search,
  Edit2,
  Trash2,
  Shield,
  Loader2,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api, tokenStore } from '@/lib/api';
import { Button, Input, Select, Field, Badge } from '@/components/ui/primitives';

interface CompanyAdminItem {
  id: string;
  _id: string;
  name: string;
  gstin?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  subscription?: {
    plan?: 'free' | 'basic' | 'pro';
    status?: 'active' | 'expired' | 'cancelled';
    expiresAt?: string;
  };
  usersCount: number;
  docsCount: number;
  owner?: {
    name: string;
    email: string;
  } | null;
}

interface AdminStats {
  totalCompanies: number;
  totalUsers: number;
  totalDocuments: number;
  plansCount: Record<string, number>;
}

export default function CompaniesManagement() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page] = useState(1);

  // Edit Modal State
  const [selectedCompany, setSelectedCompany] = useState<CompanyAdminItem | null>(null);
  const [editPlan, setEditPlan] = useState<'free' | 'basic' | 'pro'>('free');
  const [editStatus, setEditStatus] = useState<'active' | 'expired' | 'cancelled'>('active');

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<CompanyAdminItem | null>(null);

  // Fetch Platform Stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  // Fetch Companies List
  const { data: companiesData, isLoading: companiesLoading, refetch } = useQuery({
    queryKey: ['admin', 'companies', search, planFilter, statusFilter, page],
    queryFn: async () => {
      const res = await api.get('/admin/companies', {
        params: { search, plan: planFilter, status: statusFilter, page, limit: 15 },
      });
      return res.data;
    },
  });

  // Update Plan Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, plan, status }: { id: string; plan: string; status: string }) => {
      return (await api.patch(`/admin/companies/${id}`, { plan, status })).data;
    },
    onSuccess: () => {
      toast.success('Company subscription updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setSelectedCompany(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update company');
    },
  });

  // Delete Company Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return (await api.delete(`/admin/companies/${id}`)).data;
    },
    onSuccess: () => {
      toast.success('Company deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete company');
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (id: string) => {
      return (await api.post(`/admin/companies/${id}/impersonate`)).data;
    },
    onSuccess: (data) => {
      tokenStore.set(data.accessToken, data.refreshToken);
      localStorage.setItem('ims.user', JSON.stringify(data.user));
      toast.success(`Switched session to ${data.user.name}`);
      window.location.href = '/app';
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to switch company session');
    },
  });

  const openEditModal = (comp: CompanyAdminItem) => {
    setSelectedCompany(comp);
    setEditPlan(comp.subscription?.plan || 'free');
    setEditStatus(comp.subscription?.status || 'active');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    updateMutation.mutate({ id: selectedCompany.id, plan: editPlan, status: editStatus });
  };

  const planBadgeTone = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'purple';
      case 'basic':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const statusBadgeTone = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      default:
        return 'amber';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-brand-600 dark:text-brand-400" />
            Registered Companies Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View all registered businesses using your application, manage subscriptions, and oversee platform usage.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh List
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Companies
            </span>
            <div className="rounded-xl bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {statsLoading ? '...' : stats?.totalCompanies ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Users
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {statsLoading ? '...' : stats?.totalUsers ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Documents Created
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {statsLoading ? '...' : stats?.totalDocuments ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Plan Breakdown
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">Free: {stats?.plansCount?.free ?? 0}</span>
            <span>•</span>
            <span className="text-brand-600 dark:text-brand-400">Basic: {stats?.plansCount?.basic ?? 0}</span>
            <span>•</span>
            <span className="text-purple-600 dark:text-purple-400">Pro: {stats?.plansCount?.pro ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search company name, email, phone, GSTIN..."
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

      {/* Companies Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {companiesLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading registered companies...
          </div>
        ) : !companiesData?.data?.length ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            No registered companies match your search parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Company Name & GSTIN</th>
                  <th className="px-6 py-4">Owner / Contact</th>
                  <th className="px-6 py-4">Usage (Users/Docs)</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {companiesData.data.map((comp: CompanyAdminItem) => (
                  <tr key={comp.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      <div className="font-bold text-base">{comp.name}</div>
                      {comp.gstin && (
                        <div className="text-xs text-slate-500 font-mono">GSTIN: {comp.gstin}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div>{comp.owner?.name || comp.email || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{comp.phone || comp.owner?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-brand-500" />
                          {comp.usersCount} Users
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-purple-500" />
                          {comp.docsCount} Docs
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={planBadgeTone(comp.subscription?.plan || 'free')}>
                        {(comp.subscription?.plan || 'free').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={statusBadgeTone(comp.subscription?.status || 'active')}>
                        {(comp.subscription?.status || 'active').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => impersonateMutation.mutate(comp.id)}
                          loading={impersonateMutation.isPending}
                          className="h-8 px-2 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                          title="Login as Company (Impersonate)"
                        >
                          <LogIn className="h-3.5 w-3.5 mr-1" />
                          Login as Company
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => openEditModal(comp)}
                          className="h-8 w-8 p-0"
                          title="Manage Plan & Status"
                        >
                          <Edit2 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteTarget(comp)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                          title="Delete Company"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Plan Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Manage Company Subscription
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update subscription plan and status for <strong>{selectedCompany.name}</strong>.
            </p>

            <form onSubmit={handleUpdateSubmit} className="mt-6 space-y-4">
              <Field label="Subscription Plan">
                <Select value={editPlan} onChange={(e: any) => setEditPlan(e.target.value)}>
                  <option value="free">Free Plan</option>
                  <option value="basic">Basic Plan (₹499/mo)</option>
                  <option value="pro">Pro Plan (₹999/mo)</option>
                </Select>
              </Field>

              <Field label="Account Status">
                <Select value={editStatus} onChange={(e: any) => setEditStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Field>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setSelectedCompany(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Delete Company</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>?
              This will remove all associated users, invoices, stock records, and party ledgers.
            </p>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
