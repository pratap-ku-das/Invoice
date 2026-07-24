import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Receipt, Trash2, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, EmptyState } from '@/components/ui/feedback';
import { Badge, Button, Field, Input, Select } from '@/components/ui/primitives';
import { useList, useCreate, useUpdate, useRemove } from '@/hooks/useCrud';
import { formatCurrency, formatDate, debounce } from '@/lib/utils';
import type { ExpenseRecord, Category } from '@/types';

interface ExpenseForm {
  categoryId: string;
  amount: number | '';
  taxRate: number;
  date: string;
  paymentMode: string;
  reference: string;
  note: string;
  isRecurring: boolean;
  recurringFrequency: string;
}

const emptyForm = (): ExpenseForm => ({
  categoryId: '',
  amount: '',
  taxRate: 0,
  date: new Date().toISOString().slice(0, 10),
  paymentMode: 'cash',
  reference: '',
  note: '',
  isRecurring: false,
  recurringFrequency: 'monthly',
});

export default function Expenses() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing?: ExpenseRecord }>({ open: false });
  const [form, setForm] = useState<ExpenseForm>(emptyForm());
  const [catModal, setCatModal] = useState(false);
  const [newCat, setNewCat] = useState('');

  const { data, isLoading } = useList<ExpenseRecord>('expenses', { page, limit: 20, search });
  const { data: categories } = useList<Category>('expense-categories', { limit: 100 });
  const create = useCreate('expenses', { success: 'Expense saved' });
  const update = useUpdate('expenses', { success: 'Saved' });
  const remove = useRemove('expenses');
  const createCat = useCreate('expense-categories', { success: 'Category added' });

  const setSearchDebounced = useMemo(
    () =>
      debounce((v: string) => {
        setSearch(v);
        setPage(1);
      }, 300),
    [],
  );

  const patch = (p: Partial<ExpenseForm>) => setForm((f) => ({ ...f, ...p }));

  const openCreate = () => {
    setForm(emptyForm());
    setModal({ open: true });
  };
  const openEdit = (e: ExpenseRecord) => {
    setForm({
      categoryId: e.categoryId ?? '',
      amount: e.amount,
      taxRate: e.taxRate ?? 0,
      date: e.date.slice(0, 10),
      paymentMode: e.paymentMode,
      reference: e.reference ?? '',
      note: e.note ?? '',
      isRecurring: e.isRecurring ?? false,
      recurringFrequency: e.recurringFrequency ?? 'monthly',
    });
    setModal({ open: true, editing: e });
  };

  const submit = async () => {
    if (!form.amount) return;
    const dto = {
      categoryId: form.categoryId || undefined,
      amount: form.amount,
      taxRate: form.taxRate,
      date: form.date,
      paymentMode: form.paymentMode,
      reference: form.reference || undefined,
      note: form.note || undefined,
      isRecurring: form.isRecurring,
      recurringFrequency: form.isRecurring ? form.recurringFrequency : undefined,
    };
    if (modal.editing) await update.mutateAsync({ id: modal.editing._id, dto });
    else await create.mutateAsync(dto);
    setModal({ open: false });
  };

  const columns = useMemo<ColumnDef<ExpenseRecord, unknown>[]>(
    () => [
      {
        id: 'number',
        header: 'Number',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.number}</p>
            <p className="text-xs text-slate-400">{formatDate(row.original.date)}</p>
          </div>
        ),
      },
      {
        id: 'categoryName',
        header: 'Category',
        cell: ({ row }) => row.original.categoryName ?? '—',
        enableSorting: false,
      },
      { id: 'total', header: 'Amount', cell: ({ row }) => <strong>{formatCurrency(row.original.total)}</strong> },
      {
        id: 'paymentMode',
        header: 'Mode',
        cell: ({ row }) => <span className="capitalize">{row.original.paymentMode}</span>,
        enableSorting: false,
      },
      {
        id: 'recurring',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isRecurring ? <Badge tone="blue">{row.original.recurringFrequency}</Badge> : null,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <button
              className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600"
              onClick={() => openEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="rounded-lg p-1.5 text-slate-400 hover:text-red-600"
              onClick={() => remove.mutate(row.original._id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Expenses"
        subtitle={data?.summary ? `Total ${formatCurrency(data.summary.total)}` : undefined}
        actions={
          <>
            <Button variant="outline" onClick={() => setCatModal(true)}>
              Categories
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Search expenses…"
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
        empty={<EmptyState icon={Receipt} title="No expenses recorded" />}
      />

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.editing ? 'Edit Expense' : 'New Expense'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select value={form.categoryId} onChange={(e) => patch({ categoryId: e.target.value })}>
              <option value="">— None —</option>
              {categories?.data?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount" required>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(e) => patch({ amount: e.target.value === '' ? '' : Number(e.target.value) })}
            />
          </Field>
          <Field label="GST %">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.taxRate}
              onChange={(e) => patch({ taxRate: Number(e.target.value) })}
            />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => patch({ date: e.target.value })} />
          </Field>
          <Field label="Payment Mode">
            <Select value={form.paymentMode} onChange={(e) => patch({ paymentMode: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </Select>
          </Field>
          <Field label="Reference">
            <Input value={form.reference} onChange={(e) => patch({ reference: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Note">
              <Input value={form.note} onChange={(e) => patch({ note: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded"
              checked={form.isRecurring}
              onChange={(e) => patch({ isRecurring: e.target.checked })}
            />
            Recurring expense
          </label>
          {form.isRecurring && (
            <Field label="Frequency">
              <Select
                value={form.recurringFrequency}
                onChange={(e) => patch({ recurringFrequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </Field>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="outline" onClick={() => setModal({ open: false })}>
              Cancel
            </Button>
            <Button loading={create.isPending || update.isPending} onClick={submit} disabled={!form.amount}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={catModal} onClose={() => setCatModal(false)} title="Expense Categories" size="sm">
        <div className="mb-3 flex gap-2">
          <Input placeholder="New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
          <Button
            loading={createCat.isPending}
            onClick={async () => {
              if (!newCat.trim()) return;
              await createCat.mutateAsync({ name: newCat.trim() });
              setNewCat('');
            }}
          >
            Add
          </Button>
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {categories?.data?.map((c) => (
            <p key={c._id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
              {c.name}
            </p>
          ))}
        </div>
      </Modal>
    </div>
  );
}
