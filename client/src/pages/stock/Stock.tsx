import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Boxes, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, EmptyState } from '@/components/ui/feedback';
import { Badge, Button, Field, Input, Select } from '@/components/ui/primitives';
import { useList, useAction } from '@/hooks/useCrud';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, debounce } from '@/lib/utils';
import type { Product } from '@/types';

interface Movement {
  _id: string;
  productId: string;
  type: string;
  qty: number;
  rate: number;
  refType?: string;
  refNumber?: string;
  note?: string;
  balanceAfter: number;
  createdAt: string;
}

export default function Stock() {
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [adjustFor, setAdjustFor] = useState<Product | null>(null);
  const [adjQty, setAdjQty] = useState<number | ''>('');
  const [adjType, setAdjType] = useState('adjust');
  const [adjNote, setAdjNote] = useState('');

  const { data: products, isLoading } = useList<Product>('products', {
    page,
    limit: 20,
    search,
    itemType: 'product',
    lowStock: lowOnly ? 'true' : undefined,
  });

  const { data: movements, isLoading: movesLoading } = useQuery<{ data: Movement[]; total: number; page: number; totalPages: number }>({
    queryKey: ['inventory', 'movements', page],
    queryFn: async () => (await api.get('/inventory/movements', { params: { page, limit: 20 } })).data,
    enabled: tab === 'movements',
  });

  const { data: stockValue } = useQuery({
    queryKey: ['inventory', 'stock-value'],
    queryFn: async () => (await api.get('/inventory/stock-value')).data,
  });

  const adjust = useAction('inventory', { success: 'Stock updated', invalidate: ['products', 'inventory'] });

  const setSearchDebounced = useMemo(
    () =>
      debounce((v: string) => {
        setSearch(v);
        setPage(1);
      }, 300),
    [],
  );

  const stockColumns = useMemo<ColumnDef<Product, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Product',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-slate-400">{row.original.sku}</p>
          </div>
        ),
      },
      {
        id: 'current',
        header: 'In Stock',
        enableSorting: false,
        cell: ({ row }) => {
          const cur = row.original.stock?.current ?? 0;
          const min = row.original.stock?.minimum ?? 0;
          const low = min > 0 && cur <= min;
          return (
            <Badge tone={cur <= 0 ? 'red' : low ? 'amber' : 'green'}>
              {low && <AlertTriangle className="mr-1 h-3 w-3" />}
              {cur}
            </Badge>
          );
        },
      },
      {
        id: 'minimum',
        header: 'Min Level',
        enableSorting: false,
        cell: ({ row }) => row.original.stock?.minimum ?? 0,
      },
      {
        id: 'value',
        header: 'Stock Value',
        enableSorting: false,
        cell: ({ row }) =>
          formatCurrency((row.original.stock?.current ?? 0) * (row.original.purchasePrice ?? 0)),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => setAdjustFor(row.original)}>
            <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust
          </Button>
        ),
      },
    ],
    [],
  );

  const moveColumns = useMemo<ColumnDef<Movement, unknown>[]>(
    () => [
      {
        id: 'createdAt',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.createdAt, 'DD MMM YYYY HH:mm'),
      },
      {
        id: 'type',
        header: 'Type',
        enableSorting: false,
        cell: ({ row }) => {
          const t = row.original.type;
          return (
            <Badge tone={row.original.qty > 0 ? 'green' : 'red'}>
              {t} {row.original.qty > 0 ? '+' : ''}
              {row.original.qty}
            </Badge>
          );
        },
      },
      {
        id: 'ref',
        header: 'Reference',
        enableSorting: false,
        cell: ({ row }) => row.original.refNumber ?? row.original.refType ?? '—',
      },
      { id: 'balanceAfter', header: 'Balance After', enableSorting: false, cell: ({ row }) => row.original.balanceAfter },
      { id: 'note', header: 'Note', enableSorting: false, cell: ({ row }) => row.original.note ?? '—' },
    ],
    [],
  );

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Stock"
        subtitle={
          stockValue
            ? `${stockValue.items ?? 0} products · value ${formatCurrency(stockValue.value)}`
            : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-slate-200 p-0.5 dark:border-slate-700">
          {(['stock', 'movements'] as const).map((t) => (
            <button
              key={t}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                tab === t ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === 'stock' && (
          <>
            <Input
              placeholder="Search products…"
              className="w-full sm:max-w-xs"
              onChange={(e) => setSearchDebounced(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={lowOnly}
                onChange={(e) => {
                  setLowOnly(e.target.checked);
                  setPage(1);
                }}
              />
              Low stock only
            </label>
          </>
        )}
      </div>

      {tab === 'stock' ? (
        <DataTable
          data={products?.data ?? []}
          columns={stockColumns}
          loading={isLoading}
          page={products?.page}
          pages={products?.totalPages}
          total={products?.total}
          onPageChange={setPage}
          empty={<EmptyState icon={Boxes} title="No stock-tracked products" />}
        />
      ) : (
        <DataTable
          data={movements?.data ?? []}
          columns={moveColumns}
          loading={movesLoading}
          page={movements?.page}
          pages={movements?.totalPages}
          total={movements?.total}
          onPageChange={setPage}
          empty={<EmptyState icon={Boxes} title="No stock movements yet" />}
        />
      )}

      <Modal open={!!adjustFor} onClose={() => setAdjustFor(null)} title={`Adjust: ${adjustFor?.name}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Current stock: <strong>{adjustFor?.stock?.current ?? 0}</strong>
          </p>
          <Field label="Type">
            <Select value={adjType} onChange={(e) => setAdjType(e.target.value)}>
              <option value="in">Stock In (+)</option>
              <option value="out">Stock Out (−)</option>
              <option value="adjust">Adjustment (signed)</option>
              <option value="damage">Damage (−)</option>
            </Select>
          </Field>
          <Field label="Quantity">
            <Input
              type="number"
              step="any"
              value={adjQty}
              onChange={(e) => setAdjQty(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Field>
          <Field label="Note">
            <Input value={adjNote} onChange={(e) => setAdjNote(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAdjustFor(null)}>
              Cancel
            </Button>
            <Button
              loading={adjust.isPending}
              disabled={!adjQty}
              onClick={async () => {
                let qty = Number(adjQty);
                if (adjType === 'out' || adjType === 'damage') qty = -Math.abs(qty);
                if (adjType === 'in') qty = Math.abs(qty);
                await adjust.mutateAsync({
                  path: 'adjust',
                  body: { productId: adjustFor!._id, qty, type: adjType, note: adjNote || undefined },
                });
                setAdjustFor(null);
                setAdjQty('');
                setAdjNote('');
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
