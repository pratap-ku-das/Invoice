import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/primitives';
import { Skeleton } from '@/components/ui/feedback';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Party } from '@/types';

export default function PartyDetail({ partyType }: { partyType: 'customer' | 'supplier' }) {
  const { id } = useParams<{ id: string }>();
  const resource = partyType === 'customer' ? 'customers' : 'suppliers';

  const { data: party, isLoading } = useQuery<Party>({
    queryKey: [resource, 'one', id],
    queryFn: async () => (await api.get(`/${resource}/${id}`)).data,
    enabled: !!id,
  });

  const { data: ledger } = useQuery({
    queryKey: ['ledger', id],
    queryFn: async () => (await api.get(`/reports/ledger/${id}`)).data,
    enabled: !!id,
  });

  if (isLoading || !party) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const balance = party.currentBalance ?? 0;

  return (
    <div className="p-4 sm:p-6">
      <Link
        to={`/${resource}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {resource}
      </Link>
      <PageHeader
        title={party.name}
        subtitle={party.gstin ? `GSTIN: ${party.gstin}` : undefined}
        actions={
          <Badge tone={balance > 0 ? 'amber' : 'green'}>
            {partyType === 'customer' ? 'Receivable' : 'Payable'}: {formatCurrency(Math.abs(balance))}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-3 p-4">
          <h3 className="font-semibold">Contact</h3>
          {party.phone && (
            <p className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-slate-400" /> {party.phone}
            </p>
          )}
          {party.email && (
            <p className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-slate-400" /> {party.email}
            </p>
          )}
          {party.billingAddress?.line1 && (
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              {[party.billingAddress.line1, party.billingAddress.city, party.billingAddress.state, party.billingAddress.pincode]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-400">Credit Limit</p>
              <p className="font-medium">{formatCurrency(party.creditLimit)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Credit Days</p>
              <p className="font-medium">{party.creditDays ?? 0} days</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Opening Balance</p>
              <p className="font-medium">{formatCurrency(party.openingBalance)}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Ledger</h3>
            <span className="text-sm text-slate-500">
              Closing: <strong>{formatCurrency(ledger?.closingBalance)}</strong>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Number</th>
                  <th className="px-2 py-2 text-right">Debit</th>
                  <th className="px-2 py-2 text-right">Credit</th>
                  <th className="px-2 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(ledger?.entries ?? []).map((e: Record<string, unknown>, i: number) => (
                  <tr key={i}>
                    <td className="px-2 py-2">{formatDate(e.date as string)}</td>
                    <td className="px-2 py-2 capitalize">{String(e.type).replace(/-/g, ' ')}</td>
                    <td className="px-2 py-2">{String(e.number)}</td>
                    <td className="px-2 py-2 text-right">{e.debit ? formatCurrency(e.debit as number) : '—'}</td>
                    <td className="px-2 py-2 text-right">{e.credit ? formatCurrency(e.credit as number) : '—'}</td>
                    <td className="px-2 py-2 text-right font-medium">{formatCurrency(e.balance as number)}</td>
                  </tr>
                ))}
                {(ledger?.entries ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
