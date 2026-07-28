import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Printer,
  Download,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { Button, Select } from '@/components/ui/primitives';
import { api, tokenStore } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { BusinessDoc } from '@/types';

const THEMES = [
  { value: 'modern', label: 'Modern ERP' },
  { value: 'gst', label: 'GST Tax Invoice' },
  { value: 'corporate', label: 'Corporate Dark' },
  { value: 'minimal', label: 'Minimal Clean' },
  { value: 'classic', label: 'Classic Tally' },
  { value: 'blue', label: 'Corporate Blue' },
  { value: 'dark', label: 'Executive Dark' },
  { value: 'professional', label: 'Professional' },
];

const PAPERS = [
  { value: 'A4', label: 'A4 Page' },
  { value: 'thermal-80', label: 'Thermal 80mm' },
  { value: 'thermal-58', label: 'Thermal 58mm' },
];

interface PdfViewerModalProps {
  open: boolean;
  onClose: () => void;
  docType: string;
  doc: BusinessDoc;
  initialTheme?: string;
  initialPaper?: string;
}

export function PdfViewerModal({
  open,
  onClose,
  docType,
  doc,
  initialTheme = 'modern',
  initialPaper = 'A4',
}: PdfViewerModalProps) {
  const [theme, setTheme] = useState(initialTheme || 'modern');
  const [paper, setPaper] = useState(initialPaper || 'A4');
  const [zoom, setZoom] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!open) return null;

  const apiBase = api.defaults.baseURL ?? '/api';
  const token = tokenStore.access;

  const previewUrl = `${apiBase}/pdf/${docType}/${doc._id}/preview?${new URLSearchParams({
    ...(theme ? { theme } : {}),
    paperSize: paper,
    ...(token ? { token } : {}),
    _t: String(Date.now()),
  })}`;

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
      } catch {
        window.print();
      }
    }
  };

  const handleDownload = () => {
    const downloadUrl = `${apiBase}/pdf/${docType}/${doc._id}/pdf?${new URLSearchParams({
      ...(theme ? { theme } : {}),
      paperSize: paper,
      ...(token ? { token } : {}),
      _t: String(Date.now()),
    })}`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${doc.number || 'Invoice'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${doc.number}.pdf`);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Tax Invoice #${doc.number}\nCustomer: ${doc.partyName}\nAmount: ${formatCurrency(doc.grandTotal)}\nThank you for doing business with us!`,
    );
    const rawPhone = doc.partyPhone?.replace(/\D/g, '');
    const phone = rawPhone ? (rawPhone.length === 10 ? `91${rawPhone}` : rawPhone) : '';
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 text-white shadow-lg">
        {/* Left Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            title="Close Preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-400 shrink-0" />
              <h2 className="font-bold text-sm text-white truncate">{doc.number}</h2>
              <span className="rounded bg-brand-500/20 px-2 py-0.5 text-[11px] font-semibold text-brand-300 uppercase tracking-wide">
                {doc.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">{doc.partyName}</p>
          </div>
        </div>

        {/* Center Selectors & Zoom */}
        <div className="flex items-center gap-2">
          <Select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="h-8 text-xs bg-slate-800 border-slate-700 text-white rounded-lg w-36"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value} className="bg-slate-900 text-white">
                {t.label}
              </option>
            ))}
          </Select>

          <Select
            value={paper}
            onChange={(e) => setPaper(e.target.value)}
            className="h-8 text-xs bg-slate-800 border-slate-700 text-white rounded-lg w-32"
          >
            {PAPERS.map((p) => (
              <option key={p.value} value={p.value} className="bg-slate-900 text-white">
                {p.label}
              </option>
            ))}
          </Select>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-300 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            className="bg-brand-600 hover:bg-brand-500 text-white shadow-md font-semibold text-xs h-8 px-3"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
          </Button>

          <Button
            variant="outline"
            onClick={handleDownload}
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 text-xs h-8 px-3"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download
          </Button>

          <Button
            variant="outline"
            onClick={handleWhatsApp}
            className="border-emerald-600/40 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 text-xs h-8 px-3"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Viewer Workspace Area */}
      <div className="relative flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/80">
        <div
          className="transition-transform duration-200 ease-out shadow-2xl rounded-lg overflow-hidden bg-white border border-slate-700"
          style={{
            width: paper.startsWith('thermal') ? '380px' : '860px',
            maxWidth: '96vw',
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          <iframe
            ref={iframeRef}
            src={previewUrl}
            title="Invoice Document Preview"
            className="w-full bg-white border-0"
            style={{
              height: paper.startsWith('thermal') ? '750px' : '1120px',
            }}
          />
        </div>
      </div>
    </div>
  );
}

