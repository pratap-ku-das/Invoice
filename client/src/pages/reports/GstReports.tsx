import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';

export default function GstReports() {
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [tab, setTab] = useState<'summary' | 'hsn' | 'gstr1'>('summary');

  const params = { from, to };
  const { data: summary } = useQuery({
    queryKey: ['gst', 'summary', params],
    queryFn: async () => (await api.get('/reports/gst/summary', { params })).data,
  });
  const { data: hsn } = useQuery({
    queryKey: ['gst', 'hsn', params],
    queryFn: async () => (await api.get('/reports/gst/hsn', { params })).data,
    enabled: tab === 'hsn',
  });
  const { data: gstr1 } = useQuery({
    queryKey: ['gst', 'gstr1', params],
    queryFn: async () => (await api.get('/reports/gst/gstr1', { params })).data,
    enabled: tab === 'gstr1',
  });

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="GST Reports" subtitle="Output vs input tax, HSN summary, GSTR-1 data" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-slate-200 p-0.5 dark:border-slate-700">
          {(
            [
              ['summary', 'Summary'],
              ['hsn', 'HSN Summary'],
              ['gstr1', 'GSTR-1'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                tab === key ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <Input type="date" className="w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-slate-400">→</span>
        <Input type="date" className="w-40" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {tab === 'summary' && summary && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="card p-4">
              <p className="text-xs font-medium text-slate-400">Output Tax (Sales)</p>
              <p className="text-xl font-bold">{formatCurrency(summary.outputTax)}</p>
              <p className="mt-1 text-xs text-slate-400">
                CGST {formatCurrency(summary.output?.cgst)} · SGST {formatCurrency(summary.output?.sgst)} · IGST{' '}
                {formatCurrency(summary.output?.igst)}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium text-slate-400">Input Tax (Purchases)</p>
              <p className="text-xl font-bold">{formatCurrency(summary.inputTax)}</p>
              <p className="mt-1 text-xs text-slate-400">
                CGST {formatCurrency(summary.input?.cgst)} · SGST {formatCurrency(summary.input?.sgst)} · IGST{' '}
                {formatCurrency(summary.input?.igst)}
              </p>
            </div>
            <div className="card border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
              <p className="text-xs font-medium text-brand-600">Net GST Payable</p>
              <p className="text-xl font-bold text-brand-700 dark:text-brand-300">
                {formatCurrency(summary.netPayable)}
              </p>
              <p className="mt-1 text-xs text-slate-400">Output − Input credit</p>
            </div>
          </div>
          <div className="card mt-4 p-4">
            <h3 className="mb-2 font-semibold">Taxable Values</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p className="text-slate-500">
                Sales taxable: <strong>{formatCurrency(summary.output?.taxable)}</strong>
              </p>
              <p className="text-slate-500">
                Purchase taxable: <strong>{formatCurrency(summary.input?.taxable)}</strong>
              </p>
            </div>
          </div>
        </>
      )}

      {tab === 'hsn' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/60">
              <tr>
                <th className="px-4 py-3">HSN</th>
                <th className="px-4 py-3 text-right">Rate %</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Taxable</th>
                <th className="px-4 py-3 text-right">CGST</th>
                <th className="px-4 py-3 text-right">SGST</th>
                <th className="px-4 py-3 text-right">IGST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(hsn ?? []).map((r: Record<string, unknown>, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 font-medium">{String(r.hsn ?? '—')}</td>
                  <td className="px-4 py-2.5 text-right">{String(r.rate ?? 0)}%</td>
                  <td className="px-4 py-2.5 text-right">{formatNumber(r.qty as number)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(r.taxable as number)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(r.cgst as number)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(r.sgst as number)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(r.igst as number)}</td>
                </tr>
              ))}
              {(hsn ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No HSN data in range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'gstr1' && gstr1 && (
        <div className="space-y-4">
          {(['b2b', 'b2c'] as const).map((seg) => (
            <div key={seg} className="card overflow-x-auto">
              <div className="flex items-center justify-between border-b border-slate-100 p-3 dark:border-slate-800">
                <h3 className="font-semibold uppercase">{seg}</h3>
                <p className="text-sm text-slate-500">
                  {gstr1[seg]?.count ?? 0} invoices · taxable {formatCurrency(gstr1[seg]?.taxable)} · total{' '}
                  {formatCurrency(gstr1[seg]?.total)}
                </p>
              </div>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-2">Invoice</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Party</th>
                    {seg === 'b2b' && <th className="px-4 py-2">GSTIN</th>}
                    <th className="px-4 py-2 text-right">Taxable</th>
                    <th className="px-4 py-2 text-right">Tax</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(gstr1[seg]?.invoices ?? []).map((inv: Record<string, unknown>) => (
                    <tr key={String(inv._id)}>
                      <td className="px-4 py-2 font-medium">{String(inv.number)}</td>
                      <td className="px-4 py-2">{formatDate(inv.date as string)}</td>
                      <td className="px-4 py-2">{String(inv.partyName ?? '—')}</td>
                      {seg === 'b2b' && <td className="px-4 py-2">{String(inv.partyGstin ?? '')}</td>}
                      <td className="px-4 py-2 text-right">{formatCurrency(inv.subtotal as number)}</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(
                          ((inv.cgst as number) ?? 0) + ((inv.sgst as number) ?? 0) + ((inv.igst as number) ?? 0),
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">{formatCurrency(inv.grandTotal as number)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
