import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input, Select } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';

function useRange() {
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
  return { from, to, setFrom, setTo };
}

export default function Reports() {
  const { from, to, setFrom, setTo } = useRange();
  const [granularity, setGranularity] = useState<'day' | 'month' | 'year'>('day');

  const params = { from, to };
  const { data: sales } = useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: async () => (await api.get('/reports/sales', { params })).data,
  });
  const { data: purchase } = useQuery({
    queryKey: ['reports', 'purchase', params],
    queryFn: async () => (await api.get('/reports/purchase', { params })).data,
  });
  const { data: profit } = useQuery({
    queryKey: ['reports', 'profit', params],
    queryFn: async () => (await api.get('/reports/profit', { params })).data,
  });
  const { data: series } = useQuery({
    queryKey: ['reports', 'series', params, granularity],
    queryFn: async () =>
      (await api.get('/reports/sales-series', { params: { ...params, granularity } })).data,
  });
  const { data: topCustomers } = useQuery({
    queryKey: ['reports', 'top-customers', params],
    queryFn: async () => (await api.get('/reports/top-customers', { params })).data,
  });

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Reports" subtitle="Sales, purchase and profit analysis" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input type="date" className="w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-slate-400">→</span>
        <Input type="date" className="w-40" value={to} onChange={(e) => setTo(e.target.value)} />
        <Select
          className="w-32"
          value={granularity}
          onChange={(e) => setGranularity(e.target.value as 'day' | 'month' | 'year')}
        >
          <option value="day">Daily</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </Select>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Sales" value={formatCurrency(sales?.total)} sub={`${formatNumber(sales?.count)} invoices`} />
        <Tile label="Purchases" value={formatCurrency(purchase?.total)} sub={`${formatNumber(purchase?.count)} bills`} />
        <Tile label="Gross Profit" value={formatCurrency(profit?.grossProfit)} sub={`Expenses ${formatCurrency(profit?.expenses)}`} />
        <Tile
          label="Net Profit"
          value={formatCurrency(profit?.netProfit)}
          highlight={(profit?.netProfit ?? 0) >= 0 ? 'green' : 'red'}
        />
        <Tile label="Tax Collected" value={formatCurrency(sales?.tax)} />
        <Tile label="Received" value={formatCurrency(sales?.received)} />
        <Tile label="Sales Outstanding" value={formatCurrency(sales?.outstanding)} highlight="amber" />
        <Tile label="Purchase Outstanding" value={formatCurrency(purchase?.outstanding)} highlight="amber" />
      </div>

      {/* Series chart */}
      <div className="card mt-4 p-4">
        <h3 className="mb-3 font-semibold">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={series ?? []}>
            <XAxis dataKey="period" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="total" name="Sales" fill="#3563ff" radius={[6, 6, 0, 0]} />
            <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top customers */}
      <div className="card mt-4 p-4">
        <h3 className="mb-3 font-semibold">Top Customers</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Customer</th>
              <th className="px-2 py-2 text-right">Invoices</th>
              <th className="px-2 py-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {(topCustomers ?? []).map((c: Record<string, unknown>, i: number) => (
              <tr key={i}>
                <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                <td className="px-2 py-2 font-medium">{String(c.name ?? 'Walk-in')}</td>
                <td className="px-2 py-2 text-right">{formatNumber(c.count as number)}</td>
                <td className="px-2 py-2 text-right font-semibold">{formatCurrency(c.total as number)}</td>
              </tr>
            ))}
            {(topCustomers ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No data in range
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: 'green' | 'red' | 'amber';
}) {
  const color =
    highlight === 'green'
      ? 'text-emerald-600'
      : highlight === 'red'
        ? 'text-red-500'
        : highlight === 'amber'
          ? 'text-amber-600'
          : '';
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
