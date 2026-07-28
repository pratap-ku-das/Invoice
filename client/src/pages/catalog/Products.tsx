import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Package, Wand2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, EmptyState } from '@/components/ui/feedback';
import { Button, Input, Field, Select, Textarea, Badge } from '@/components/ui/primitives';
import { useList, useCreate, useUpdate, useRemove } from '@/hooks/useCrud';
import { api } from '@/lib/api';
import { formatCurrency, debounce } from '@/lib/utils';
import type { Product, Category, Unit } from '@/types';
import { aiService } from '@/services/aiService';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  hsn: z.string().optional(),
  itemType: z.enum(['product', 'service']),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  unitId: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  mrp: z.coerce.number().min(0).default(0),
  gstRate: z.coerce.number().min(0).max(100).default(0),
  cessRate: z.coerce.number().min(0).max(100).default(0),
  taxInclusive: z.boolean().default(false),
  openingStock: z.coerce.number().min(0).default(0),
  minimumStock: z.coerce.number().min(0).default(0),
  description: z.string().optional(),
});
type ProductForm = z.infer<typeof productSchema>;

const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28];

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing?: Product }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [aiHsnLoading, setAiHsnLoading] = useState(false);

  const { data, isLoading } = useList<Product>('products', { page, limit: 20, search });
  const { data: categories } = useList<Category>('categories', { limit: 100 });
  const { data: units } = useList<Unit>('units', { limit: 100 });

  const create = useCreate('products', { success: 'Product created' });
  const update = useUpdate('products', { success: 'Saved' });
  const remove = useRemove('products');

  const setSearchDebounced = useMemo(
    () =>
      debounce((v: string) => {
        setSearch(v);
        setPage(1);
      }, 300),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { itemType: 'product', gstRate: 0 },
  });

  const itemType = watch('itemType');
  const nameValue = watch('name');

  const openCreate = () => {
    reset({ itemType: 'product', gstRate: 0, purchasePrice: 0, sellingPrice: 0, mrp: 0, openingStock: 0, minimumStock: 0, taxInclusive: false, cessRate: 0 });
    setModal({ open: true });
  };
  const openEdit = (p: Product) => {
    reset({
      name: p.name,
      sku: p.sku ?? '',
      barcode: p.barcode ?? '',
      hsn: p.hsn ?? '',
      itemType: p.itemType,
      categoryId: p.categoryId ?? '',
      brand: p.brand ?? '',
      unitId: p.unitId ?? '',
      purchasePrice: p.purchasePrice ?? 0,
      sellingPrice: p.sellingPrice ?? 0,
      mrp: p.mrp ?? 0,
      gstRate: p.gstRate ?? 0,
      cessRate: p.cessRate ?? 0,
      taxInclusive: p.taxInclusive ?? false,
      openingStock: p.stock?.opening ?? 0,
      minimumStock: p.stock?.minimum ?? 0,
      description: p.description ?? '',
    });
    setModal({ open: true, editing: p });
  };

  const handleAiSuggestHsn = async () => {
    if (!nameValue?.trim()) {
      toast.error('Please enter Product Name first');
      return;
    }
    setAiHsnLoading(true);
    try {
      const res = await aiService.suggestHsn(nameValue);
      setValue('hsn', res.hsnCode);
      setValue('gstRate', res.gstRate);
      toast.success(`✨ AI predicted HSN ${res.hsnCode} (${res.gstRate}% GST)`);
    } catch (err) {
      toast.error('Failed to get AI recommendation');
    } finally {
      setAiHsnLoading(false);
    }
  };

  const generateSku = async () => {
    if (!nameValue) return;
    const { data } = await api.get<{ sku: string }>('/products/generate-sku', {
      params: { name: nameValue },
    });
    setValue('sku', data.sku);
  };

  const onSubmit = async (f: ProductForm) => {
    const dto = {
      name: f.name,
      sku: f.sku || undefined,
      barcode: f.barcode || undefined,
      hsn: f.hsn || undefined,
      itemType: f.itemType,
      categoryId: f.categoryId || undefined,
      brand: f.brand || undefined,
      unitId: f.unitId || undefined,
      purchasePrice: f.purchasePrice,
      sellingPrice: f.sellingPrice,
      mrp: f.mrp,
      gstRate: f.gstRate,
      cessRate: f.cessRate,
      taxInclusive: f.taxInclusive,
      stock: { opening: f.openingStock, minimum: f.minimumStock },
      description: f.description || undefined,
    };
    if (modal.editing) {
      await update.mutateAsync({ id: modal.editing._id, dto });
    } else {
      await create.mutateAsync(dto);
    }
    setModal({ open: false });
  };

  const unitName = (id?: string) => units?.data?.find((u) => u._id === id)?.shortName ?? '';

  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Product',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-slate-400">
              {[row.original.sku, row.original.hsn && `HSN ${row.original.hsn}`].filter(Boolean).join(' · ')}
            </p>
          </div>
        ),
      },
      {
        id: 'sellingPrice',
        header: 'Sell Price',
        cell: ({ row }) => formatCurrency(row.original.sellingPrice),
      },
      {
        id: 'gstRate',
        header: 'GST',
        cell: ({ row }) => `${row.original.gstRate ?? 0}%`,
        enableSorting: false,
      },
      {
        id: 'stock',
        header: 'Stock',
        enableSorting: false,
        cell: ({ row }) => {
          if (row.original.itemType === 'service') return <Badge tone="blue">Service</Badge>;
          const cur = row.original.stock?.current ?? 0;
          const min = row.original.stock?.minimum ?? 0;
          const low = min > 0 && cur <= min;
          return (
            <Badge tone={cur <= 0 ? 'red' : low ? 'amber' : 'green'}>
              {cur} {unitName(row.original.unitId)}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <button
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
              onClick={() => openEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
              onClick={() => setConfirmDelete(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [units?.data],
  );

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Products"
        subtitle={`${data?.total ?? 0} items in catalog`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Search by name, SKU, barcode, HSN…"
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
        empty={
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add products or services to start creating invoices."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            }
          />
        }
      />

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.editing ? 'Edit Product' : 'New Product'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Field label="Name" error={errors.name?.message} required>
              <Input {...register('name')} autoFocus />
            </Field>
          </div>
          <Field label="Type">
            <Select {...register('itemType')}>
              <option value="product">Product</option>
              <option value="service">Service</option>
            </Select>
          </Field>

          <Field label="SKU">
            <div className="flex gap-2">
              <Input {...register('sku')} />
              <Button type="button" variant="outline" onClick={generateSku} title="Auto-generate">
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
          </Field>
          <Field label="Barcode">
            <Input {...register('barcode')} />
          </Field>
          <Field label="HSN Code">
            <div className="flex gap-2">
              <Input {...register('hsn')} placeholder="e.g. 6205" />
              <Button
                type="button"
                variant="outline"
                onClick={handleAiSuggestHsn}
                disabled={aiHsnLoading}
                className="whitespace-nowrap border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-50 shrink-0"
                title="AI Predict HSN & Tax"
              >
                <Sparkles className="h-4 w-4 text-brand-500 animate-pulse" />
                <span className="text-xs font-semibold">AI Predict</span>
              </Button>
            </div>
          </Field>

          <Field label="Category">
            <Select {...register('categoryId')}>
              <option value="">— None —</option>
              {categories?.data?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Brand">
            <Input {...register('brand')} />
          </Field>
          <Field label="Unit">
            <Select {...register('unitId')}>
              <option value="">— None —</option>
              {units?.data?.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.shortName})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Purchase Price">
            <Input type="number" step="0.01" {...register('purchasePrice')} />
          </Field>
          <Field label="Selling Price" error={errors.sellingPrice?.message}>
            <Input type="number" step="0.01" {...register('sellingPrice')} />
          </Field>
          <Field label="MRP">
            <Input type="number" step="0.01" {...register('mrp')} />
          </Field>

          <Field label="GST Rate %">
            <Select {...register('gstRate')}>
              {GST_RATES.map((r) => (
                <option key={r} value={r}>
                  {r}%
                </option>
              ))}
            </Select>
          </Field>
          <Field label="CESS %">
            <Input type="number" step="0.01" {...register('cessRate')} />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded" {...register('taxInclusive')} />
            Price includes tax
          </label>

          {itemType === 'product' && (
            <>
              <Field label="Opening Stock">
                <Input
                  type="number"
                  step="0.01"
                  disabled={!!modal.editing}
                  {...register('openingStock')}
                />
              </Field>
              <Field label="Minimum Stock (alert)">
                <Input type="number" step="0.01" {...register('minimumStock')} />
              </Field>
            </>
          )}

          <div className="sm:col-span-3">
            <Field label="Description">
              <Textarea {...register('description')} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 sm:col-span-3">
            <Button type="button" variant="outline" onClick={() => setModal({ open: false })}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {modal.editing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete?" size="sm">
        <p className="text-sm text-slate-500">
          Delete <strong>{confirmDelete?.name}</strong>? It will be moved to the recycle bin.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={async () => {
              await remove.mutateAsync(confirmDelete!._id);
              setConfirmDelete(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
