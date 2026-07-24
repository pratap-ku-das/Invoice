import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Printer, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Field, Input } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { useList } from '@/hooks/useCrud';
import type { Product } from '@/types';

export default function Barcode() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [preview, setPreview] = useState('');
  const [qrText, setQrText] = useState('');

  const { data: products } = useList<Product>('products', { search, limit: 20 });

  const { data: qr } = useQuery<{ dataUrl: string }>({
    queryKey: ['qr', qrText],
    queryFn: async () => (await api.get('/pdf/qr', { params: { text: qrText } })).data,
    enabled: qrText.length > 0,
  });

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = { ...s };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });

  const setCopies = (id: string, copies: number) =>
    setSelected((s) => ({ ...s, [id]: Math.max(1, copies) }));

  const printLabels = async () => {
    const ids = Object.keys(selected);
    if (ids.length === 0) return;
    const maxCopies = Math.max(...Object.values(selected));
    const { data } = await api.post(
      '/pdf/labels',
      { productIds: ids.flatMap((id) => Array(selected[id]).fill(id)).slice(0, 200), copies: 1 },
      { responseType: 'text' },
    );
    void maxCopies;
    setPreview(data as string);
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Barcode & Labels" subtitle="Generate barcodes, QR codes and printable label sheets" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Label sheet builder */}
        <div className="card p-4">
          <h3 className="mb-3 font-semibold">Label Sheet</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search products with barcode/SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {(products?.data ?? [])
              .filter((p) => p.barcode || p.sku)
              .map((p) => (
                <div
                  key={p._id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                    selected[p._id]
                      ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    checked={!!selected[p._id]}
                    onChange={() => toggle(p._id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.barcode ?? p.sku}</p>
                  </div>
                  {selected[p._id] && (
                    <Input
                      type="number"
                      min={1}
                      className="w-20 py-1"
                      value={selected[p._id]}
                      onChange={(e) => setCopies(p._id, Number(e.target.value))}
                      title="Copies"
                    />
                  )}
                </div>
              ))}
          </div>
          <Button className="mt-3" onClick={printLabels} disabled={Object.keys(selected).length === 0}>
            <Printer className="h-4 w-4" /> Generate Sheet
          </Button>
        </div>

        {/* QR generator */}
        <div className="card p-4">
          <h3 className="mb-3 font-semibold">QR Code Generator</h3>
          <Field label="Text / URL / UPI string">
            <Input
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              placeholder="upi://pay?pa=yourupi@bank or any text"
            />
          </Field>
          {qr?.dataUrl && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <img src={qr.dataUrl} alt="QR" className="h-40 w-40 rounded-xl border border-slate-200 dark:border-slate-700" />
              <a href={qr.dataUrl} download="qrcode.png" className="btn-outline text-xs">
                Download PNG
              </a>
            </div>
          )}
          {!qrText && (
            <div className="mt-4 flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
              <QrCode className="h-24 w-24" />
              <p className="text-sm">Type above to generate</p>
            </div>
          )}
        </div>
      </div>

      {/* Label sheet preview */}
      {preview && (
        <div className="card mt-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-3 dark:border-slate-800">
            <h3 className="font-semibold">Label Sheet Preview</h3>
            <Button
              variant="outline"
              onClick={() => {
                const w = window.open('', '_blank');
                if (w) {
                  w.document.write(preview);
                  w.document.close();
                  w.print();
                }
              }}
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
          <iframe srcDoc={preview} title="Labels" className="h-96 w-full bg-white" />
        </div>
      )}
    </div>
  );
}
