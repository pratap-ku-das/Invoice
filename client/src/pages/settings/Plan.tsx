import { useQuery } from '@tanstack/react-query';
import { Gem, Check, Mail, Phone, Infinity as InfinityIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/primitives';
import { Skeleton } from '@/components/ui/feedback';
import { formatDate } from '@/lib/utils';
import type { PlanInfo } from '@/types';

const PLAN_CATALOG = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['50 invoices / month', '2 team members', '1 company', 'GST invoicing & PDF'],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '₹499',
    period: 'per month',
    features: ['500 invoices / month', '5 team members', '3 companies', 'All templates & reports'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹1,499',
    period: 'per month',
    features: ['Unlimited invoices', 'Unlimited members', 'Unlimited companies', 'Priority support'],
  },
];

function limitLabel(n: number) {
  return n < 0 ? 'Unlimited' : n.toLocaleString('en-IN');
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit < 0;
  const pct = unlimited ? 0 : Math.min(100, limit === 0 ? 100 : (used / limit) * 100);
  const danger = !unlimited && pct >= 90;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-medium tabular-nums">
          {used.toLocaleString('en-IN')}
          <span className="text-slate-400"> / </span>
          {unlimited ? (
            <InfinityIcon className="inline h-3.5 w-3.5" />
          ) : (
            limitLabel(limit)
          )}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${
            danger ? 'bg-red-500' : 'bg-brand-gradient'
          }`}
          style={{ width: `${unlimited ? 6 : Math.max(pct, 3)}%` }}
        />
      </div>
    </div>
  );
}

export default function Plan() {
  const { data, isLoading } = useQuery<PlanInfo>({
    queryKey: ['subscription'],
    queryFn: async () => (await api.get('/subscription')).data,
  });

  const active = data?.status === 'active';

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Plan & Billing" subtitle="Manage your subscription and usage" />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Current plan + usage */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-1">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                  <Gem className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Current plan
                  </p>
                  <p className="text-xl font-bold">{data?.planName ?? 'Free'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge tone={active ? 'green' : 'red'}>{data?.status ?? 'active'}</Badge>
                {data?.expiresAt && (
                  <span className="text-sm text-slate-500">
                    {active ? 'Renews' : 'Expired'} {formatDate(data.expiresAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="card p-5 lg:col-span-2">
              <h3 className="mb-4 font-semibold">This month's usage</h3>
              <div className="space-y-4">
                <UsageMeter
                  label="Invoices"
                  used={data?.usage.invoicesThisMonth ?? 0}
                  limit={data?.limits.maxInvoicesPerMonth ?? 0}
                />
                <UsageMeter
                  label="Team members"
                  used={data?.usage.users ?? 0}
                  limit={data?.limits.maxUsers ?? 0}
                />
                <UsageMeter
                  label="Companies owned"
                  used={data?.usage.companiesOwned ?? 0}
                  limit={data?.limits.maxCompanies ?? 0}
                />
              </div>
            </div>
          </div>

          {/* Plan catalog */}
          <h3 className="mb-3 mt-8 text-lg font-semibold tracking-tight">Available plans</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PLAN_CATALOG.map((p) => {
              const current = p.id === data?.plan;
              return (
                <div
                  key={p.id}
                  className={`card p-5 ${current ? 'ring-2 ring-brand-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold">{p.name}</h4>
                    {current && <Badge tone="blue">Current</Badge>}
                  </div>
                  <p className="mt-2">
                    <span className="text-2xl font-bold">{p.price}</span>{' '}
                    <span className="text-sm text-slate-400">{p.period}</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Upgrade contact */}
          <div className="card mt-6 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold">Need a higher plan?</h3>
              <p className="text-sm text-slate-500">
                Plans are activated manually during onboarding. Reach out to upgrade.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="mailto:sales@invoiceapp.example" className="btn-outline">
                <Mail className="h-4 w-4" /> sales@invoiceapp.example
              </a>
              <a href="tel:+919000000000" className="btn-primary">
                <Phone className="h-4 w-4" /> Contact sales
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
