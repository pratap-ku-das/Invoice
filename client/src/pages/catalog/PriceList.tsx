import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/primitives';
import { useList } from '@/hooks/useCrud';
import { formatCurrency, debounce } from '@/lib/utils';
import type { Product } from '@/types';

/** Read-only price list view of the product catalog — printable */
export default function PriceList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useList<Product>('products', { page, limit: 50, search });

  const setSearchDebounced = useMemo(
    () =>
      debounce((v: string) => {
        setSearch(v);
        setPage(1);
      }, 300),
    [],
  );

  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => [
      { id: 'name', header: 'Product', cell: ({ row }) => row.original.name },
      { id: 'sku', header: 'SKU', cell: ({ row }) => row.original.sku ?? '—', enableSorting: false },
      {
        id: 'purchasePrice',
        header: 'Purchase',
        cell: ({ row }) => formatCurrency(row.original.purchasePrice),
      },
      {
        id: 'sellingPrice',
        header: 'Selling',
        cell: ({ row }) => <strong>{formatCurrency(row.original.sellingPrice)}</strong>,
      },
      { id: 'mrp', header: 'MRP', cell: ({ row }) => formatCurrency(row.original.mrp) },
      {
        id: 'gstRate',
        header: 'GST',
        cell: ({ row }) => `${row.original.gstRate ?? 0}%`,
        enableSorting: false,
      },
    ],
    [],
  );

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Price List"
        subtitle="Current selling prices across the catalog"
        actions={
          <button className="btn-outline" onClick={() => window.print()}>
            Print
          </button>
        }
      />
      <div className="mb-4">
        <Input
          placeholder="Search products…"
          className="max-w-md"
          onChange={(e) => setSearchDebounced(e.target.value)}
        />
      </div>
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        page={data?.page}
        pages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
      />
    </div>
  );
}
