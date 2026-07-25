import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Package, Search, Users, Factory, Wallet } from 'lucide-react';
import { Modal } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { debounce, formatCurrency } from '@/lib/utils';

interface Hit {
  id: string;
  label: string;
  sub?: string;
  to: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const setQueryDebounced = useMemo(() => debounce(setQuery, 300), []);
  useEffect(() => setQueryDebounced(term), [term, setQueryDebounced]);
  useEffect(() => {
    if (!open) {
      setTerm('');
      setQuery('');
    }
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ['global-search', query],
    enabled: open && query.length >= 2,
    queryFn: async () => {
      const params = { search: query, limit: 5 };
      const [invoices, customers, suppliers, products, payments] = await Promise.all([
        api.get('/documents/invoice', { params }),
        api.get('/customers', { params }),
        api.get('/suppliers', { params }),
        api.get('/products', { params }),
        api.get('/payments', { params }),
      ]);

      const hits: Hit[] = [];
      for (const d of invoices.data.data ?? []) {
        hits.push({
          id: d._id,
          label: `${d.number} · ${d.partyName ?? ''}`,
          sub: formatCurrency(d.grandTotal),
          to: `/app/sales/invoices/${d._id}`,
          group: 'Invoices',
          icon: FileText,
        });
      }
      for (const c of customers.data.data ?? []) {
        hits.push({ id: c._id, label: c.name, sub: c.phone, to: `/app/customers/${c._id}`, group: 'Customers', icon: Users });
      }
      for (const s of suppliers.data.data ?? []) {
        hits.push({ id: s._id, label: s.name, sub: s.phone, to: `/app/suppliers/${s._id}`, group: 'Suppliers', icon: Factory });
      }
      for (const p of products.data.data ?? []) {
        hits.push({
          id: p._id,
          label: p.name,
          sub: p.sku,
          to: `/app/products?edit=${p._id}`,
          group: 'Products',
          icon: Package,
        });
      }
      for (const p of payments.data.data ?? []) {
        hits.push({
          id: p._id,
          label: `${p.number} · ${p.partyName ?? ''}`,
          sub: formatCurrency(p.amount),
          to: '/app/payments',
          group: 'Payments',
          icon: Wallet,
        });
      }
      return hits;
    },
  });

  const groups = useMemo(() => {
    const m = new Map<string, Hit[]>();
    for (const h of data ?? []) {
      if (!m.has(h.group)) m.set(h.group, []);
      m.get(h.group)!.push(h);
    }
    return [...m.entries()];
  }, [data]);

  return (
    <Modal open={open} onClose={onClose} title="Global Search" size="lg">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          autoFocus
          className="input pl-9"
          placeholder="Search invoices, customers, products, payments…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>
      <div className="mt-3 max-h-80 space-y-4 overflow-y-auto">
        {isFetching && <p className="p-2 text-sm text-slate-400">Searching…</p>}
        {!isFetching && query.length >= 2 && (data?.length ?? 0) === 0 && (
          <p className="p-2 text-sm text-slate-400">No results for “{query}”</p>
        )}
        {groups.map(([group, hits]) => (
          <div key={group}>
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {group}
            </p>
            {hits.map((h) => (
              <button
                key={`${h.group}-${h.id}`}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => {
                  onClose();
                  navigate(h.to);
                }}
              >
                <h.icon className="h-4 w-4 text-slate-400" />
                <span className="flex-1 truncate">{h.label}</span>
                {h.sub && <span className="text-xs text-slate-400">{h.sub}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}
