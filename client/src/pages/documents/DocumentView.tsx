import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Pencil,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ArrowRightLeft,
  Lock,
  Unlock,
  History,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Select } from '@/components/ui/primitives';
import { Skeleton, Modal } from '@/components/ui/feedback';
import { api, apiError, tokenStore } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DOC_TYPES } from '@/config/nav';
import type { BusinessDoc } from '@/types';

const THEMES = ['modern', 'professional', 'gst', 'minimal', 'corporate', 'blue', 'dark', 'classic'];
const PAPERS = [
  { value: 'A4', label: 'A4' },
  { value: 'thermal-80', label: 'Thermal 80mm' },
  { value: 'thermal-58', label: 'Thermal 58mm' },
];

export default function DocumentView({ docType }: { docType: string }) {
  const meta = DOC_TYPES[docType];
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [theme, setTheme] = useState('');
  const [paper, setPaper] = useState('A4');
  const [payOpen, setPayOpen] = useState(false);
  const [payMode, setPayMode] = useState('cash');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const resource = `documents/${docType}`;
  const { data: doc, isLoading } = useQuery<BusinessDoc & { versionHistory?: { at: string; byName?: string; snapshot: Record<string, unknown> }[] }>({
    queryKey: [resource, 'one', id],
    queryFn: async () => (await api.get(`/${resource}/${id}`)).data,
    enabled: !!id,
  });

  const apiBase = api.defaults.baseURL ?? '/api';
  const token = tokenStore.access;
  const targetId = doc?._id ?? id;

  const previewUrl = `${apiBase}/pdf/${docType}/${targetId}/preview?${new URLSearchParams({
    ...(theme ? { theme } : {}),
    paperSize: paper,
    ...(token ? { token } : {}),
  })}`;
  const pdfUrl = `${apiBase}/pdf/${docType}/${targetId}/pdf?${new URLSearchParams({
    ...(theme ? { theme } : {}),
    paperSize: paper,
    ...(token ? { token } : {}),
  })}`;

  const act = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
      qc.invalidateQueries({ queryKey: [resource] });
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
      setPayOpen(false);
    }
  };

  if (isLoading || !doc) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[70vh] rounded-2xl" />
      </div>
    );
  }

  const canPay =
    meta.hasPayments && doc.balanceAmount > 0 && !['cancelled', 'draft'].includes(doc.status);

  return (
    <div className="p-4 sm:p-6">
      <Link to={meta.route} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to {meta.titlePlural.toLowerCase()}
      </Link>

      <PageHeader
        title={`${meta.title} ${doc.number}`}
        subtitle={`${doc.partyName ?? ''} · ${formatDate(doc.date)}`}
        actions={
          <>
            <Badge
              tone={
                doc.status === 'paid' || doc.status === 'delivered' || doc.status === 'accepted'
                  ? 'green'
                  : doc.status === 'cancelled' || doc.status === 'rejected'
                    ? 'red'
                    : doc.status === 'partial'
                      ? 'blue'
                      : 'amber'
              }
            >
              {doc.status}
            </Badge>
            {doc.isLocked && (
              <Badge tone="purple">
                <Lock className="mr-1 h-3 w-3" /> Locked
              </Badge>
            )}
          </>
        }
      />

      {/* Action bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {!doc.isLocked && doc.status !== 'cancelled' && (
          <Button variant="outline" onClick={() => navigate(`${meta.route}/${targetId}/edit`)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => {
            const w = window.open(previewUrl, '_blank');
            if (w) w.onload = () => w.print();
          }}
        >
          <Printer className="h-4 w-4" /> Print
        </Button>
        <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn-outline">
          <Download className="h-4 w-4" /> PDF
        </a>
        <Button
          variant="outline"
          onClick={() => {
            const msg = encodeURIComponent(
              `${meta.title} ${doc.number}\nAmount: ${formatCurrency(doc.grandTotal)}\nThank you!`,
            );
            const phone = doc.partyPhone?.replace(/\D/g, '');
            window.open(`https://wa.me/${phone ? `91${phone.slice(-10)}` : ''}?text=${msg}`, '_blank');
          }}
        >
          <Share2 className="h-4 w-4" /> WhatsApp
        </Button>
        {canPay && (
          <Button
            onClick={() => {
              setPayAmount(doc.balanceAmount);
              setPayOpen(true);
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Record Payment
          </Button>
        )}
        {meta.convertsTo && !doc.convertedTo && doc.status !== 'cancelled' && (
          <Button
            variant="outline"
            loading={busy}
            onClick={() => act(() => api.post(`/${resource}/${id}/convert`), 'Converted')}
          >
            <ArrowRightLeft className="h-4 w-4" /> {meta.convertsTo.label}
          </Button>
        )}
        {doc.isLocked && (
          <Button
            variant="ghost"
            loading={busy}
            onClick={() => act(() => api.post(`/${resource}/${id}/lock`, { locked: false }), 'Unlocked')}
          >
            <Unlock className="h-4 w-4" /> Unlock
          </Button>
        )}
        {(doc.versionHistory?.length ?? 0) > 0 && (
          <Button variant="ghost" onClick={() => setHistoryOpen(true)}>
            <History className="h-4 w-4" /> History ({doc.versionHistory!.length})
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-36">
            <option value="">Default theme</option>
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
          <Select value={paper} onChange={(e) => setPaper(e.target.value)} className="w-36">
            {PAPERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Grand Total" value={formatCurrency(doc.grandTotal)} />
        <SummaryTile label="Paid" value={formatCurrency(doc.paidAmount)} />
        <SummaryTile label="Balance" value={formatCurrency(doc.balanceAmount)} highlight={doc.balanceAmount > 0} />
        <SummaryTile label="Tax" value={formatCurrency(doc.taxTotal)} />
      </div>

      {/* Live preview */}
      <div className="rounded-xl bg-slate-100/90 p-4 sm:p-8 flex justify-center border border-slate-200 shadow-inner">
        <div className="w-full max-w-[900px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
          <iframe
            key={previewUrl}
            src={previewUrl}
            title="Document preview"
            className="h-[82vh] w-full bg-white border-0"
          />
        </div>
      </div>

      {/* Payment modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Mode</label>
            <Select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </Select>
          </div>
          <div>
            <label className="label">Amount (balance: {formatCurrency(doc.balanceAmount)})</label>
            <input
              type="number"
              min={0}
              max={doc.balanceAmount}
              step="0.01"
              className="input"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={busy}
              onClick={() =>
                act(
                  () =>
                    api.post(`/${resource}/${id}/payments`, {
                      mode: payMode,
                      amount: payAmount === '' ? undefined : payAmount,
                    }),
                  'Payment recorded',
                )
              }
            >
              Save Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Version history */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Version History" size="lg">
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {(doc.versionHistory ?? [])
            .slice()
            .reverse()
            .map((v, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{v.byName ?? 'Unknown user'}</span>
                  <span>{formatDate(v.at, 'DD MMM YYYY HH:mm')}</span>
                </div>
                <p>
                  Total was <strong>{formatCurrency((v.snapshot as { grandTotal?: number }).grandTotal)}</strong> ·
                  status <Badge tone="gray">{String((v.snapshot as { status?: string }).status)}</Badge> ·{' '}
                  {((v.snapshot as { items?: unknown[] }).items ?? []).length} items
                </p>
              </div>
            ))}
        </div>
      </Modal>
    </div>
  );
}

function SummaryTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-red-500' : ''}`}>{value}</p>
    </div>
  );
}
