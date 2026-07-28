import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, EmptyState } from '@/components/ui/feedback';
import { Button, Input, Field, Textarea, Badge } from '@/components/ui/primitives';
import { useList, useCreate, useUpdate, useRemove } from '@/hooks/useCrud';
import { formatCurrency, debounce } from '@/lib/utils';
import type { Party } from '@/types';

const partySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  creditDays: z.coerce.number().min(0).optional(),
  openingBalance: z.coerce.number().optional(),
  billingLine1: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingPincode: z.string().optional(),
  notes: z.string().optional(),
});
type PartyForm = z.infer<typeof partySchema>;

function toDto(f: PartyForm) {
  return {
    name: f.name,
    phone: f.phone || undefined,
    email: f.email || undefined,
    gstin: f.gstin || undefined,
    pan: f.pan || undefined,
    creditLimit: f.creditLimit,
    creditDays: f.creditDays,
    openingBalance: f.openingBalance,
    billingAddress: {
      line1: f.billingLine1,
      city: f.billingCity,
      state: f.billingState,
      pincode: f.billingPincode,
    },
    notes: f.notes || undefined,
  };
}

export function PartyList({ partyType }: { partyType: 'customer' | 'supplier' }) {
  const resource = partyType === 'customer' ? 'customers' : 'suppliers';
  const title = partyType === 'customer' ? 'Customers' : 'Suppliers';
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing?: Party }>({ open: false });
  const [confirmDelete, setConfirmDelete] = useState<Party | null>(null);

  const { data, isLoading } = useList<Party>(resource, { page, limit: 20, search });
  const create = useCreate(resource, { success: `${title.slice(0, -1)} created` });
  const update = useUpdate(resource, { success: 'Saved' });
  const remove = useRemove(resource);

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
    formState: { errors },
  } = useForm<PartyForm>({ resolver: zodResolver(partySchema) });

  const openCreate = () => {
    reset({});
    setModal({ open: true });
  };
  const openEdit = (p: Party) => {
    reset({
      name: p.name,
      phone: p.phone ?? '',
      email: p.email ?? '',
      gstin: p.gstin ?? '',
      pan: p.pan ?? '',
      creditLimit: p.creditLimit ?? 0,
      creditDays: p.creditDays ?? 0,
      openingBalance: p.openingBalance ?? 0,
      billingLine1: p.billingAddress?.line1 ?? '',
      billingCity: p.billingAddress?.city ?? '',
      billingState: p.billingAddress?.state ?? '',
      billingPincode: p.billingAddress?.pincode ?? '',
      notes: p.notes ?? '',
    });
    setModal({ open: true, editing: p });
  };

  const onSubmit = async (f: PartyForm) => {
    if (modal.editing) {
      await update.mutateAsync({ id: modal.editing._id, dto: toDto(f) });
    } else {
      await create.mutateAsync(toDto(f));
    }
    setModal({ open: false });
  };

  const columns = useMemo<ColumnDef<Party, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            {row.original.gstin && <p className="text-xs text-slate-400">{row.original.gstin}</p>}
          </div>
        ),
      },
      { id: 'phone', header: 'Phone', cell: ({ row }) => row.original.phone ?? '—', enableSorting: false },
      { id: 'email', header: 'Email', cell: ({ row }) => row.original.email ?? '—', enableSorting: false },
      {
        id: 'currentBalance',
        header: partyType === 'customer' ? 'Receivable' : 'Payable',
        cell: ({ row }) => {
          const bal = row.original.currentBalance ?? 0;
          return (
            <Badge tone={bal > 0 ? (partyType === 'customer' ? 'amber' : 'red') : 'green'}>
              {formatCurrency(Math.abs(bal))}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
    [partyType],
  );

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={title}
        subtitle={`${data?.total ?? 0} ${title.toLowerCase()}`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add {title.slice(0, -1)}
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder={`Search ${title.toLowerCase()} by name, phone, GSTIN…`}
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
        onRowClick={(p) => navigate(`/app/${resource}/${p._id}`)}
        empty={
          <EmptyState
            icon={Users}
            title={`No ${title.toLowerCase()} yet`}
            description="Add your first one to start billing."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add {title.slice(0, -1)}
              </Button>
            }
          />
        }
      />

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.editing ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message} required>
            <Input {...register('name')} autoFocus />
          </Field>
          <Field label="Phone">
            <Input {...register('phone')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </Field>
          <Field label="GSTIN">
            <Input {...register('gstin')} placeholder="22AAAAA0000A1Z5" />
          </Field>
          <Field label="PAN">
            <Input {...register('pan')} />
          </Field>
          <Field label="Opening Balance">
            <Input type="number" step="0.01" {...register('openingBalance')} />
          </Field>
          <Field label="Credit Limit">
            <Input type="number" step="0.01" {...register('creditLimit')} />
          </Field>
          <Field label="Credit Days">
            <Input type="number" {...register('creditDays')} />
          </Field>
          <div className="sm:col-span-2">
            <p className="label">Billing Address</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Address line" {...register('billingLine1')} />
              <Input placeholder="City" {...register('billingCity')} />
              <Input placeholder="State" {...register('billingState')} />
              <Input placeholder="Pincode" {...register('billingPincode')} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea {...register('notes')} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setModal({ open: false })}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {modal.editing ? 'Save Changes' : 'Create'}
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
