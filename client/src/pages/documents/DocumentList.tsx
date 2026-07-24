import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  FileText,
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Printer,
  Download,
  Share2,
  Ban,
  Trash2,
  CheckCircle2,
  ArrowRightLeft,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, EmptyState } from '@/components/ui/feedback';
import { Button, Input, Select, Badge } from '@/components/ui/primitives';
import { useList } from '@/hooks/useCrud';
import { api, apiError } from '@/lib/api';
import { formatCurrency, formatDate, debounce, cn } from '@/lib/utils';
import { DOC_TYPES } from '@/config/nav';
import type { BusinessDoc } from '@/types';

const STATUS_TONE: Record<string, 'gray' | 'green' | 'red' | 'amber' | 'blue' | 'purple'> = {
  draft: 'gray',
  unpaid: 'amber',
  partial: 'blue',
  paid: 'green',
  cancelled: 'red',
  pending: 'amber',
  accepted: 'green',
  rejected: 'red',
  expired: 'gray',
  converted: 'purple',
  delivered: 'green',
};

export default function DocumentList({ docType }: { docType: string }) {
  const meta = DOC_TYPES[docType];
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: 'cancel' | 'delete'; doc: BusinessDoc } | null>(null);
  const [busy, setBusy] = useState(false);

  const resource = `documents/${docType}`;
  const { data, isLoading } = useList<BusinessDoc>(resource, {
    page,
    limit: 20,
    search,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const setSearchDebounced = useMemo(
    () =>
      debounce((v: string) => {
        setSearch(v);
        setPage(1);
      }, 300),
    [],
  );

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [resource] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const act = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
      invalidate();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
      setMenuFor(null);
      setConfirm(null);
    }
  };

  const openPdf = (doc: BusinessDoc) =>
    window.open(`/api/pdf/${docType}/${doc._id}/pdf`, '_blank');
  const openPrint = (doc: BusinessDoc) => {
    const w = window.open(`/api/pdf/${docType}/${doc._id}/preview`, '_blank');
    w?.addEventListener('load', () => w.print());
  };
  const shareWhatsApp = (doc: BusinessDoc) => {
    const msg = encodeURIComponent(
      `${meta.title} ${doc.number}\nAmount: ₹${doc.grandTotal}\nThank you for your business!`,
    );
    const phone = doc.partyPhone?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone ? `91${phone.slice(-10)}` : ''}?text=${msg}`, '_blank');
  };

  const columns = useMemo<ColumnDef<BusinessDoc, unknown>[]>(
    () => [
      {
        id: 'number',
        header: 'Number',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-brand-600">{row.original.number}</p>
            <p className="text-xs text-slate-400">{formatDate(row.original.date)}</p>
          </div>
        ),
      },
      {
        id: 'partyName',
        header: meta.partyLabel,
        cell: ({ row }) => row.original.partyName ?? '—',
      },
      {
        id: 'grandTotal',
        header: 'Amount',
        cell: ({ row }) => <strong>{formatCurrency(row.original.grandTotal)}</strong>,
      },
      ...(meta.hasPayments
        ? [
            {
              id: 'balanceAmount',
              header: 'Balance',
              cell: ({ row }: { row: { original: BusinessDoc } }) =>
                row.original.balanceAmount > 0 ? (
                  <span className="text-red-500">{formatCurrency(row.original.balanceAmount)}</span>
                ) : (
                  <span className="text-emerald-600">—</span>
                ),
            } as ColumnDef<BusinessDoc, unknown>,
          ]
        : []),
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge tone={STATUS_TONE[row.original.status] ?? 'gray'}>{row.original.status}</Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const doc = row.original;
          const open = menuFor === doc._id;
          return (
            <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
              <button
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMenuFor(open ? null : doc._id)}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                  <div className="absolute right-0 top-8 z-20 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-soft dark:border-slate-700 dark:bg-slate-800">
                    <MenuItem icon={Eye} label="View" onClick={() => navigate(`${meta.route}/${doc._id}`)} />
                    {!doc.isLocked && doc.status !== 'cancelled' && (
                      <MenuItem icon={Pencil} label="Edit" onClick={() => navigate(`${meta.route}/${doc._id}/edit`)} />
                    )}
                    <MenuItem
                      icon={Copy}
                      label="Duplicate"
                      onClick={() =>
                        act(
                          () => api.post(`/${resource}/${doc._id}/duplicate`),
                          'Duplicated as draft',
                        )
                      }
                    />
                    <MenuItem icon={Printer} label="Print" onClick={() => openPrint(doc)} />
                    <MenuItem icon={Download} label="Download PDF" onClick={() => openPdf(doc)} />
                    <MenuItem icon={Share2} label="Share WhatsApp" onClick={() => shareWhatsApp(doc)} />
                    {meta.hasPayments && doc.balanceAmount > 0 && doc.status !== 'cancelled' && doc.status !== 'draft' && (
                      <MenuItem
                        icon={CheckCircle2}
                        label="Mark Paid"
                        onClick={() =>
                          act(
                            () => api.post(`/${resource}/${doc._id}/payments`, { mode: 'cash' }),
                            'Marked as paid',
                          )
                        }
                      />
                    )}
                    {meta.convertsTo && !doc.convertedTo && doc.status !== 'cancelled' && (
                      <MenuItem
                        icon={ArrowRightLeft}
                        label={meta.convertsTo.label}
                        onClick={() =>
                          act(() => api.post(`/${resource}/${doc._id}/convert`), 'Converted')
                        }
                      />
                    )}
                    {doc.status !== 'cancelled' && doc.status !== 'draft' && (
                      <MenuItem
                        icon={Ban}
                        label="Cancel"
                        danger
                        onClick={() => {
                          setMenuFor(null);
                          setConfirm({ action: 'cancel', doc });
                        }}
                      />
                    )}
                    <MenuItem
                      icon={Trash2}
                      label="Delete"
                      danger
                      onClick={() => {
                        setMenuFor(null);
                        setConfirm({ action: 'delete', doc });
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [menuFor, meta, resource],
  );

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={meta.titlePlural}
        subtitle={
          data?.summary
            ? `Total ${formatCurrency(data.summary.grandTotal)} · Outstanding ${formatCurrency(data.summary.balanceAmount)}`
            : undefined
        }
        actions={
          <Link to={`${meta.route}/new`} className="btn-primary">
            <Plus className="h-4 w-4" /> New {meta.title}
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search number, party, reference…"
          className="w-full sm:max-w-xs"
          onChange={(e) => setSearchDebounced(e.target.value)}
        />
        <Select
          className="w-36"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {meta.statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Input type="date" className="w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" className="w-40" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        page={data?.page}
        pages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        onRowClick={(doc) => navigate(`${meta.route}/${doc._id}`)}
        empty={
          <EmptyState
            icon={FileText}
            title={`No ${meta.titlePlural.toLowerCase()} yet`}
            description={`Create your first ${meta.title.toLowerCase()} to get started.`}
            action={
              <Link to={`${meta.route}/new`} className="btn-primary">
                <Plus className="h-4 w-4" /> New {meta.title}
              </Link>
            }
          />
        }
      />

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'cancel' ? `Cancel ${meta.title}?` : `Delete ${meta.title}?`}
        size="sm"
      >
        <p className="text-sm text-slate-500">
          {confirm?.action === 'cancel'
            ? `Cancel ${confirm?.doc.number}? Stock and balances will be reversed.`
            : `Delete ${confirm?.doc.number}? It will move to the recycle bin and its effects will be reversed.`}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            loading={busy}
            onClick={() =>
              confirm?.action === 'cancel'
                ? act(() => api.post(`/${resource}/${confirm.doc._id}/cancel`), 'Cancelled')
                : act(() => api.delete(`/${resource}/${confirm!.doc._id}`), 'Deleted')
            }
          >
            {confirm?.action === 'cancel' ? 'Cancel it' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700',
        danger && 'text-red-600 dark:text-red-400',
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
