import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  IndianRupee,
  Clock,
  Users,
  Factory,
  Package,
  Boxes,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/primitives';
import { Skeleton } from '@/components/ui/feedback';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function Trend({ delta }: { delta: number }) {
  if (!Number.isFinite(delta) || delta === 0) return null;
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(delta).toFixed(0)}%
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  to,
  delta,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'brand' | 'green' | 'amber' | 'red' | 'purple';
  to?: string;
  delta?: number;
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  }[tone];

  const inner = (
    <div className="stat-card h-full transition hover:shadow-soft">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          {delta !== undefined && <Trend delta={delta} />}
        </div>
        <p className="mt-0.5 truncate text-lg font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function Dashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
  });
  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'sales-overview'],
    queryFn: async () => (await api.get('/dashboard/sales-overview')).data,
  });
  const { data: topProducts } = useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: async () => (await api.get('/dashboard/top-products')).data,
  });
  const { data: payStatus } = useQuery({
    queryKey: ['dashboard', 'payment-status'],
    queryFn: async () => (await api.get('/dashboard/payment-status')).data,
  });
  const { data: recent } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: async () => (await api.get('/dashboard/recent')).data,
  });

  // Month-over-month sales delta from the last two points of the overview series
  const salesDelta = (() => {
    const s: Array<{ sales?: number }> = overview ?? [];
    if (s.length < 2) return undefined;
    const prev = s[s.length - 2]?.sales ?? 0;
    const cur = s[s.length - 1]?.sales ?? 0;
    if (!prev) return cur > 0 ? 100 : undefined;
    return ((cur - prev) / prev) * 100;
  })();

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Dashboard"
        subtitle="Your business at a glance"
        actions={
          <Link to="/app/sales/invoices/new" className="btn-primary">
            <Plus className="h-4 w-4" /> New Invoice
          </Link>
        }
      />

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Today's Sales" value={formatCurrency(summary?.todaySales)} icon={IndianRupee} tone="brand" />
          <StatCard label="Monthly Sales" value={formatCurrency(summary?.monthlySales)} icon={TrendingUp} tone="green" delta={salesDelta} />
          <StatCard label="Today's Profit" value={formatCurrency(summary?.todayProfit)} icon={ArrowUpRight} tone="green" />
          <StatCard
            label={`Pending Payments (${summary?.pendingInvoiceCount ?? 0})`}
            value={formatCurrency(summary?.pendingPayments)}
            icon={Clock}
            tone="amber"
            to="/app/sales/invoices?status=unpaid"
          />
          <StatCard label="Outstanding (Receivable)" value={formatCurrency(summary?.outstandingReceivable)} icon={Wallet} tone="red" />
          <StatCard label="Customers" value={formatNumber(summary?.totalCustomers)} icon={Users} to="/app/customers" />
          <StatCard label="Suppliers" value={formatNumber(summary?.totalSuppliers)} icon={Factory} to="/app/suppliers" />
          <StatCard label="Products" value={formatNumber(summary?.totalProducts)} icon={Package} to="/app/products" />
          <StatCard label="Stock Value" value={formatCurrency(summary?.stockValue)} icon={Boxes} tone="purple" to="/app/stock" />
          <StatCard
            label="Low Stock Items"
            value={formatNumber(summary?.lowStockItems)}
            icon={AlertTriangle}
            tone={summary?.lowStockItems ? 'red' : 'green'}
            to="/app/stock?lowStock=true"
          />
        </div>
      )}

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Sales vs Purchase (12 months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={overview ?? []}>
              <defs>
                <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPurchase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="sales" stroke="#6366f1" fill="url(#gSales)" strokeWidth={2} name="Sales" />
              <Area type="monotone" dataKey="purchase" stroke="#f59e0b" fill="url(#gPurchase)" strokeWidth={2} name="Purchase" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 font-semibold">Payment Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={payStatus ?? []}
                dataKey="amount"
                nameKey="status"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {(payStatus ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 font-semibold">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={overview ?? []}>
              <defs>
                <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#gProfit)" strokeWidth={2} name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts ?? []} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis type="category" dataKey="name" fontSize={11} width={120} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Recent Invoices</h3>
            <Link to="/app/sales/invoices" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(recent?.invoices ?? []).map((inv: Record<string, unknown>) => (
              <Link
                key={String(inv._id)}
                to={`/app/sales/invoices/${inv._id}`}
                className="flex items-center justify-between gap-2 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{String(inv.number)}</p>
                  <p className="truncate text-xs text-slate-400">
                    {String(inv.partyName ?? '')} · {formatDate(inv.date as string)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatCurrency(inv.grandTotal as number)}</span>
                  <Badge tone={inv.status === 'paid' ? 'green' : inv.status === 'partial' ? 'amber' : 'gray'}>
                    {String(inv.status)}
                  </Badge>
                </div>
              </Link>
            ))}
            {(recent?.invoices ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No invoices yet</p>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Recent Payments</h3>
            <Link to="/app/payments" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(recent?.payments ?? []).map((p: Record<string, unknown>) => (
              <div key={String(p._id)} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{String(p.partyName ?? p.number)}</p>
                  <p className="truncate text-xs text-slate-400">
                    {formatDate(p.date as string)} · {String(p.mode)}
                  </p>
                </div>
                <span className={`font-semibold ${p.type === 'in' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {p.type === 'in' ? '+' : '-'}
                  {formatCurrency(p.amount as number)}
                </span>
              </div>
            ))}
            {(recent?.payments ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No payments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
