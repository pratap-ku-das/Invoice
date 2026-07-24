import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Wallet, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, EmptyState } from '@/components/ui/feedback';
import { Badge, Button, Field, Input, Select } from '@/components/ui/primitives';
import { useList, useCreate, useRemove } from '@/hooks/useCrud';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, debounce } from '@/lib/utils';
import type { Party, PaymentRecord } from '@/types';

export default function Payments() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<PaymentRecord | null>(null);

  // form state
  const [ptype, setPtype] = useState<'in' | 'out'>('in');
  const [party, setParty] = useState<Party | null>(null);
  const [partySearch, setPartySearch] = useState('');
  const [partyOpen, setPartyOpen] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [mode, setMode] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  const { data, isLoading } = useList<PaymentRecord>('payments', {
    page,
    limit: 20,
    search,
    type: typeFilter || undefined,
  });
  const create = useCreate('payments', { success: 'Payment recorded' });
  const remove = useRemove('payments', { success: 'Payment deleted & rolled back' });

  const partyResource = ptype === 'in' ? 'customers' : 'suppliers';
  const { data: partyResults } = useQuery<{ data: Party[] }>({
    queryKey: [partyResource, 'combo', partySearch],
    queryFn: async () =>
      (await api.get(`/${partyResource}`, { params: { search: partySearch, limit: 8 } })).data,
    enabled: partyOpen,
  });

  const setSearchDebounced = useMemo(
    () =>
      debounce((v: string) => {
        setSearch(v);
        setPage(1);
      }, 300),
    [],
  );

  const submit = async () => {
    if (!party || !amount) return;
    await create.mutateAsync({
      type: ptype,
      partyId: party._id,
      amount,
      mode,
      date,
      reference: reference || undefined,
      note: note || undefined,
      autoAllocate: true,
    });
    setModal(false);
    setParty(null);
    setAmount('');
    setReference('');
    setNote('');
  };

  const columns = useMemo<ColumnDef<PaymentRecord, unknown>[]>(
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
      { id: 'partyName', header: 'Party', cell: ({ row }) => row.original.partyName ?? '—' },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) =>
          row.original.type === 'in' ? <Badge tone="green">Received</Badge> : <Badge tone="red">Paid</Badge>,
        enableSorting: false,
      },
      {
        id: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <strong className={row.original.type === 'in' ? 'text-emerald-600' : 'text-red-500'}>
            {row.original.type === 'in' ? '+' : '-'}
            {formatCurrency(row.original.amount)}
          </strong>
        ),
      },
      {
        id: 'mode',
        header: 'Mode',
        cell: ({ row }) => <span className="capitalize">{row.original.mode}</span>,
        enableSorting: false,
      },
      {
        id: 'allocations',
        header: 'Against',
        enableSorting: false,
        cell: ({ row }) => {
          const allocs = row.original.allocations ?? [];
          if (allocs.length === 0) return <Badge tone="blue">Advance</Badge>;
          return (
            <span className="text-xs text-slate-500">
              {allocs.map((a) => a.documentNumber).filter(Boolean).join(', ')}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            onClick={() => setConfirmDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Payments"
        subtitle={
          data?.summary
            ? `Received ${formatCurrency(data.summary.received)} · Paid ${formatCurrency(data.summary.paid)}`
            : undefined
        }
        actions={
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search number, party, reference…"
          className="w-full sm:max-w-xs"
          onChange={(e) => setSearchDebounced(e.target.value)}
        />
        <Select className="w-36" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All</option>
          <option value="in">Received</option>
          <option value="out">Paid</option>
        </Select>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        page={data?.page}
        pages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={<EmptyState icon={Wallet} title="No payments yet" description="Record customer receipts and supplier payments here." />}
      />

      <Modal open={modal} onClose={() => setModal(false)} title="Record Payment" size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Direction">
            <Select
              value={ptype}
              onChange={(e) => {
                setPtype(e.target.value as 'in' | 'out');
                setParty(null);
              }}
            >
              <option value="in">Receive from Customer</option>
              <option value="out">Pay to Supplier</option>
            </Select>
          </Field>
          <Field label={ptype === 'in' ? 'Customer' : 'Supplier'} required>
            <div className="relative">
              <Input
                value={party ? party.name : partySearch}
                placeholder="Search…"
                onFocus={() => setPartyOpen(true)}
                onChange={(e) => {
                  setParty(null);
                  setPartySearch(e.target.value);
                  setPartyOpen(true);
                }}
              />
              {partyOpen && !party && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPartyOpen(false)} />
                  <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                    {(partyResults?.data ?? []).map((p) => (
                      <button
                        key={p._id}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => {
                          setParty(p);
                          setPartyOpen(false);
                          setPartySearch('');
                        }}
                      >
                        <span>{p.name}</span>
                        <span className="text-xs text-slate-400">
                          {formatCurrency(Math.abs(p.currentBalance ?? 0))} due
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Field>
          <Field label="Amount" required>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Field>
          <Field label="Mode">
            <Select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Reference (cheque no / UTR)">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Note">
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>
          <p className="text-xs text-slate-400 sm:col-span-2">
            The amount is auto-allocated to the oldest open {ptype === 'in' ? 'invoices' : 'bills'} (FIFO).
            Any remainder is kept as an advance.
          </p>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="outline" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button loading={create.isPending} onClick={submit} disabled={!party || !amount}>
              Save Payment
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete payment?" size="sm">
        <p className="text-sm text-slate-500">
          Delete <strong>{confirmDelete?.number}</strong>? Allocations to documents and party balances will
          be rolled back.
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
