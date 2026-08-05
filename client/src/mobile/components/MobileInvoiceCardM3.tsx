import { useNavigate } from 'react-router-dom';
import { Share2, FileText } from 'lucide-react';
import { printDocument } from '@/platform/printerBridge';

interface MobileInvoiceCardM3Props {
  invoice: {
    _id: string;
    number: string;
    partyName: string;
    totalAmount: number;
    status: string;
    date: string;
    pdfUrl?: string;
  };
}

export function MobileInvoiceCardM3({ invoice }: MobileInvoiceCardM3Props) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'unpaid':
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    printDocument(invoice.pdfUrl || `/api/documents/${invoice._id}/pdf`);
  };

  return (
    <div
      onClick={() => navigate(`/app/documents/invoice/${invoice._id}`)}
      className="group relative flex flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 active:scale-98"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">#{invoice.number}</div>
            <div className="text-[10px] text-slate-400">{invoice.date}</div>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${getStatusColor(
            invoice.status,
          )}`}
        >
          {invoice.status}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Customer</div>
          <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[170px]">
            {invoice.partyName || 'Cash Sale'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Amount</div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">
              ₹{(invoice.totalAmount || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={handleShare}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 active:scale-90"
            title="Share / Print PDF"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
