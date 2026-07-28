import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Save,
  FileCheck,
  Sparkles,
  Camera,
  Mic,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Input, Select, Field, Textarea } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/feedback';
import { api, apiError } from '@/lib/api';
import { calcDocument, isInterState } from '@/lib/tax';
import { formatCurrency, cn } from '@/lib/utils';
import { DOC_TYPES } from '@/config/nav';
import type { BusinessDoc, CompanyProfile, Party, Product } from '@/types';
import { aiService } from '@/services/aiService';

interface LineState {
  key: number;
  productId?: string;
  name: string;
  hsn?: string;
  qty: number;
  unitName?: string;
  unitId?: string;
  price: number;
  taxInclusive?: boolean;
  discountType: 'percent' | 'flat';
  discountValue: number;
  taxRate: number;
  cessRate: number;
  stockHint?: number;
}

let lineKey = 1;
const newLine = (): LineState => ({
  key: lineKey++,
  name: '',
  qty: 1,
  price: 0,
  discountType: 'percent',
  discountValue: 0,
  taxRate: 0,
  cessRate: 0,
});

export default function DocumentForm({ docType }: { docType: string }) {
  const meta = DOC_TYPES[docType];
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const partyResource = meta.partyType === 'customer' ? 'customers' : 'suppliers';

  // ---------- data ----------
  const { data: company } = useQuery<CompanyProfile>({
    queryKey: ['company'],
    queryFn: async () => (await api.get('/company')).data,
  });
  const { data: nextNumber } = useQuery<{ number: string }>({
    queryKey: ['documents', docType, 'next-number'],
    queryFn: async () => (await api.get(`/documents/${docType}/next-number`)).data,
    enabled: !isEdit,
  });
  const { data: existing } = useQuery<BusinessDoc>({
    queryKey: [`documents/${docType}`, 'one', id],
    queryFn: async () => (await api.get(`/documents/${docType}/${id}`)).data,
    enabled: isEdit,
  });

  // ---------- header state ----------
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [dueDate, setDueDate] = useState('');
  const [party, setParty] = useState<Party | null>(null);
  const [partySearch, setPartySearch] = useState('');
  const [partyOpen, setPartyOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [salesPerson, setSalesPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  // ---------- lines ----------
  const [lines, setLines] = useState<LineState[]>([newLine()]);
  const [productSearch, setProductSearch] = useState('');
  const [productOpenFor, setProductOpenFor] = useState<number | null>(null);

  // ---------- charges / discount / payment ----------
  const [docDiscountType, setDocDiscountType] = useState<'percent' | 'flat'>('percent');
  const [docDiscountValue, setDocDiscountValue] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [packingCharge, setPackingCharge] = useState(0);
  const [otherCharge, setOtherCharge] = useState(0);
  const [payMode, setPayMode] = useState('cash');
  const [payAmount, setPayAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [aiScanLoading, setAiScanLoading] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiScanLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await aiService.scanReceipt(base64, file.type);

        if (result.vendorName && !party?.name) {
          setParty({ _id: '', partyType: meta.partyType, name: result.vendorName, gstin: result.vendorGstin });
        }
        if (result.items?.length > 0) {
          const scannedLines = result.items.map((i) => ({
            key: lineKey++,
            name: i.name,
            hsn: i.hsnCode || '9983',
            qty: i.qty || 1,
            price: i.rate || 100,
            discountType: 'percent' as const,
            discountValue: 0,
            taxRate: i.taxRate || 18,
            cessRate: 0,
          }));
          setLines((prev) => (prev.length === 1 && !prev[0].name ? scannedLines : [...prev, ...scannedLines]));
        }
        toast.success('✨ AI Receipt Scanned & Line Items Extracted!');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Failed to scan receipt image');
    } finally {
      setAiScanLoading(false);
    }
  };

  const handleParseVoice = async () => {
    if (!voiceTranscript.trim()) return;
    setVoiceLoading(true);
    try {
      const result = await aiService.parseVoice(voiceTranscript);
      if (result.items?.length > 0) {
        const voiceLines = result.items.map((i) => ({
          key: lineKey++,
          name: i.name,
          qty: i.qty || 1,
          price: i.rate || 100,
          discountType: 'percent' as const,
          discountValue: 0,
          taxRate: i.taxRate || 18,
          cessRate: 0,
        }));
        setLines((prev) => (prev.length === 1 && !prev[0].name ? voiceLines : [...prev, ...voiceLines]));
        toast.success(`✨ Added ${voiceLines.length} item(s) via AI Voice Order`);
      }
      setVoiceOpen(false);
      setVoiceTranscript('');
    } catch (err) {
      toast.error('Failed to parse voice order');
    } finally {
      setVoiceLoading(false);
    }
  };

  // hydrate on edit
  useEffect(() => {
    if (!existing) return;
    setDate(existing.date.slice(0, 10));
    setDueDate(existing.dueDate?.slice(0, 10) ?? '');
    setReferenceNumber(existing.referenceNumber ?? '');
    setSalesPerson(existing.salesPerson ?? '');
    setNotes(existing.notes ?? '');
    setTerms(existing.terms ?? '');
    setDocDiscountType(existing.docDiscountType ?? 'percent');
    setDocDiscountValue(existing.docDiscountValue ?? 0);
    setShippingCharge(existing.shippingCharge ?? 0);
    setPackingCharge(existing.packingCharge ?? 0);
    setOtherCharge(existing.otherCharge ?? 0);
    if (existing.partyId) {
      setParty({
        _id: existing.partyId,
        partyType: meta.partyType,
        name: existing.partyName ?? '',
        phone: existing.partyPhone,
        email: existing.partyEmail,
        gstin: existing.partyGstin,
        billingAddress: existing.billingAddress,
        shippingAddress: existing.shippingAddress,
      });
    }
    setLines(
      existing.items.map((i) => ({
        key: lineKey++,
        productId: i.productId,
        name: i.name,
        hsn: i.hsn,
        qty: i.qty,
        unitId: i.unitId,
        unitName: i.unitName,
        price: i.price,
        taxInclusive: i.taxInclusive,
        discountType: i.discountType ?? 'percent',
        discountValue: i.discountValue ?? 0,
        taxRate: i.taxRate ?? 0,
        cessRate: i.cessRate ?? 0,
      })),
    );
  }, [existing, meta.partyType]);

  // default terms from company
  useEffect(() => {
    if (!isEdit && company?.termsAndConditions && !terms) setTerms(company.termsAndConditions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, isEdit]);

  // ---------- party search ----------
  const { data: partyResults } = useQuery<{ data: Party[] }>({
    queryKey: [partyResource, 'combo', partySearch],
    queryFn: async () =>
      (await api.get(`/${partyResource}`, { params: { search: partySearch, limit: 8 } })).data,
    enabled: partyOpen,
  });

  // ---------- product search ----------
  const { data: productResults, isLoading: isProductsLoading } = useQuery<{ data: Product[] }>({
    queryKey: ['products', 'combo', productSearch],
    queryFn: async () =>
      (await api.get('/products', { params: { search: productSearch, limit: 12 } })).data,
    enabled: productOpenFor !== null,
  });

  // ---------- totals (live, mirrors server) ----------
  const interState = isInterState(company?.gstin, party?.gstin);
  const totals = useMemo(
    () =>
      calcDocument({
        lines: lines
          .filter((l) => l.name)
          .map((l) => ({
            qty: l.qty,
            price: l.price,
            discountType: l.discountType,
            discountValue: l.discountValue,
            taxRate: l.taxRate,
            cessRate: l.cessRate,
            taxInclusive: l.taxInclusive,
          })),
        interState,
        docDiscountType,
        docDiscountValue,
        shippingCharge,
        packingCharge,
        otherCharge,
        roundOffEnabled: company?.roundOffEnabled !== false,
        paidAmount: payAmount,
      }),
    [lines, interState, docDiscountType, docDiscountValue, shippingCharge, packingCharge, otherCharge, company, payAmount],
  );

  // ---------- line ops ----------
  const patchLine = (key: number, patch: Partial<LineState>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key: number) =>
    setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls));
  const addLine = () => setLines((ls) => [...ls, newLine()]);

  const pickProduct = (key: number, p: Product) => {
    patchLine(key, {
      productId: p._id,
      name: p.name,
      hsn: p.hsn,
      price: p.sellingPrice,
      taxRate: p.gstRate ?? 0,
      cessRate: p.cessRate ?? 0,
      taxInclusive: p.taxInclusive,
      stockHint: p.stock?.current,
    });
    setProductOpenFor(null);
    setProductSearch('');
  };

  // barcode scanner: Enter in the product search tries exact code lookup
  const tryBarcode = async (key: number, code: string) => {
    if (!code) return;
    try {
      const { data } = await api.get<Product | null>(`/products/by-code/${encodeURIComponent(code)}`);
      if (data?._id) {
        pickProduct(key, data);
        return true;
      }
    } catch {
      /* not a code — ignore */
    }
    return false;
  };

  // keyboard shortcut: Alt+S save
  const saveRef = useRef<() => void>(() => {});
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ---------- save ----------
  const save = async (asDraft: boolean) => {
    const items = lines.filter((l) => l.name && l.qty > 0);
    if (!asDraft && items.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    if (!asDraft && !party && meta.hasPayments) {
      toast.error(`Select a ${meta.partyLabel.toLowerCase()}`);
      return;
    }

    setSaving(true);
    try {
      const dto = {
        date,
        dueDate: dueDate || undefined,
        partyId: party?._id,
        partyName: party?.name,
        partyPhone: party?.phone,
        partyEmail: party?.email,
        partyGstin: party?.gstin,
        billingAddress: party?.billingAddress,
        shippingAddress: party?.shippingAddress,
        referenceNumber: referenceNumber || undefined,
        salesPerson: salesPerson || undefined,
        items: items.map((l) => ({
          productId: l.productId,
          name: l.name,
          hsn: l.hsn,
          qty: l.qty,
          unitId: l.unitId,
          unitName: l.unitName,
          price: l.price,
          taxInclusive: l.taxInclusive,
          discountType: l.discountType,
          discountValue: l.discountValue,
          taxRate: l.taxRate,
          cessRate: l.cessRate,
        })),
        docDiscountType,
        docDiscountValue,
        shippingCharge,
        packingCharge,
        otherCharge,
        payments:
          !asDraft && meta.hasPayments && payAmount > 0
            ? [{ mode: payMode, amount: Math.min(payAmount, totals.grandTotal) }]
            : undefined,
        notes: notes || undefined,
        terms: terms || undefined,
        isDraft: asDraft,
      };

      const saved = isEdit
        ? (await api.patch(`/documents/${docType}/${id}`, dto)).data
        : (await api.post(`/documents/${docType}`, dto)).data;

      qc.invalidateQueries({ queryKey: [`documents/${docType}`] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(asDraft ? 'Saved as draft' : `${meta.title} ${saved.number} saved`);
      navigate(`${meta.route}/${saved._id}`);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };
  saveRef.current = () => save(false);

  const locked = existing?.isLocked;

  return (
    <div className="p-4 sm:p-6">
      <button
        onClick={() => navigate(meta.route)}
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageHeader
          title={isEdit ? `Edit ${meta.title} ${existing?.number ?? ''}` : `New ${meta.title}`}
          subtitle={!isEdit ? `Number: ${nextNumber?.number ?? '…'} (auto)` : undefined}
        />

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* AI Receipt Scanner Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={aiScanLoading}
            className="border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 shadow-xs justify-center px-2.5 sm:px-3 py-1.5"
          >
            {aiScanLoading ? <Loader2 className="h-4 w-4 animate-spin text-purple-600 shrink-0" /> : <Camera className="h-4 w-4 text-purple-600 shrink-0" />}
            <span className="text-[11px] sm:text-xs font-bold truncate">✨ AI Scan Bill</span>
          </Button>

          {/* AI Voice Order */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setVoiceOpen(true)}
            className="border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 shadow-xs justify-center px-2.5 sm:px-3 py-1.5"
          >
            <Mic className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold truncate">🎙️ AI Voice</span>
          </Button>
        </div>
      </div>

      {locked && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10">
          This document is locked (fully paid). Unlock it from the view page to edit.
        </div>
      )}

      {/* Header section */}
      <div className="card mb-4 grid grid-cols-1 gap-3 p-3.5 sm:gap-4 sm:p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={meta.partyLabel} required>
          <div className="relative">
            <Input
              value={party ? party.name : partySearch}
              placeholder={`Search ${meta.partyLabel.toLowerCase()}…`}
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
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-soft dark:border-slate-700 dark:bg-slate-800">
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
                      <span className="text-xs text-slate-400">{p.phone}</span>
                    </button>
                  ))}
                  {(partyResults?.data ?? []).length === 0 && (
                    <p className="px-3 py-2 text-sm text-slate-400">No matches — add from {meta.partyLabel}s page</p>
                  )}
                </div>
              </>
            )}
          </div>
          {party?.gstin && <p className="mt-1 text-xs text-slate-400">GSTIN: {party.gstin}</p>}
        </Field>

        <Field label="Date" required>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        {meta.hasDueDate && (
          <Field label="Due Date">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        )}
        <Field label="Reference No.">
          <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
        </Field>
        <Field label="Sales Person">
          <Input value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} />
        </Field>
        {interState && (
          <div className="flex items-end pb-1 text-xs font-medium text-purple-600 dark:text-purple-400">
            Inter-state supply — IGST applies
          </div>
        )}
      </div>

      {/* Items List (Mobile Cards View + Desktop Table View) */}
      <div className="card mb-4">
        {/* Desktop Table View */}
        <div className={cn('hidden sm:block overflow-x-auto min-h-[300px]', productOpenFor !== null && 'pb-48')}>
          <table className="w-full min-w-[860px] text-xs sm:text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/60">
              <tr>
                <th className="w-8 px-3 py-2.5">#</th>
                <th className="min-w-[220px] px-3 py-2.5">Item</th>
                <th className="w-24 px-3 py-2.5">HSN</th>
                <th className="w-20 px-3 py-2.5">Qty</th>
                <th className="w-28 px-3 py-2.5">Price</th>
                <th className="w-28 px-3 py-2.5">Disc</th>
                <th className="w-20 px-3 py-2.5">GST %</th>
                <th className="w-28 px-3 py-2.5 text-right">Amount</th>
                <th className="w-10 px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lines.map((line, idx) => {
                const lt = totals.lines[lines.filter((l) => l.name).findIndex((l) => l.key === line.key)];
                return (
                  <tr key={line.key}>
                    <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <div className="relative">
                        <div className="flex items-center gap-1">
                          <Input
                            value={productOpenFor === line.key ? productSearch : line.name}
                            placeholder="Search / scan / type item name"
                            onFocus={() => {
                              setProductOpenFor(line.key);
                              setProductSearch(line.name || '');
                            }}
                            onChange={(e) => {
                              setProductSearch(e.target.value);
                              patchLine(line.key, { name: e.target.value, productId: undefined });
                              setProductOpenFor(line.key);
                            }}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const hit = await tryBarcode(line.key, productSearch);
                                if (!hit && idx === lines.length - 1) addLine();
                              }
                            }}
                          />
                          <Search className="h-4 w-4 shrink-0 text-slate-300" />
                        </div>
                        {productOpenFor === line.key && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setProductOpenFor(null)} />
                            <div className="absolute z-20 mt-1 max-h-60 w-full min-w-[300px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                              {isProductsLoading ? (
                                <div className="p-3 text-center text-xs text-slate-400">Loading saved products…</div>
                              ) : (productResults?.data ?? []).length > 0 ? (
                                (productResults?.data ?? []).map((p) => (
                                  <button
                                    key={p._id}
                                    type="button"
                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                    onClick={() => pickProduct(line.key, p)}
                                  >
                                    <div className="truncate pr-2">
                                      <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                                      {p.hsn && <div className="text-[10px] text-slate-400">HSN: {p.hsn}</div>}
                                    </div>
                                    <span className="ml-2 shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">
                                      {formatCurrency(p.sellingPrice)}
                                      {p.itemType === 'product' && ` · ${p.stock?.current ?? 0} in stock`}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-center text-xs text-slate-400">
                                  No saved products found{productSearch ? ` matching "${productSearch}"` : ''}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {line.productId && line.stockHint !== undefined && (
                        <p className={cn('mt-0.5 text-xs', line.stockHint <= 0 ? 'text-red-500' : 'text-slate-400')}>
                          {line.stockHint} in stock
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Input value={line.hsn ?? ''} onChange={(e) => patchLine(line.key, { hsn: e.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={line.qty}
                        onChange={(e) => patchLine(line.key, { qty: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.price}
                        onChange={(e) => patchLine(line.key, { price: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="rounded-r-none"
                          value={line.discountValue}
                          onChange={(e) => patchLine(line.key, { discountValue: Number(e.target.value) })}
                        />
                        <button
                          type="button"
                          className="rounded-r-xl border border-l-0 border-slate-300 px-2 text-xs dark:border-slate-700"
                          onClick={() =>
                            patchLine(line.key, {
                              discountType: line.discountType === 'percent' ? 'flat' : 'percent',
                            })
                          }
                        >
                          {line.discountType === 'percent' ? '%' : '₹'}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={line.taxRate}
                        onChange={(e) => patchLine(line.key, { taxRate: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {line.name ? formatCurrency(lt?.total ?? 0) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="rounded p-1 text-slate-300 hover:text-red-500"
                        onClick={() => removeLine(line.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (Only visible on sm:hidden) */}
        <div className={cn('block sm:hidden divide-y divide-slate-100 dark:divide-slate-800 p-3 space-y-3.5 min-h-[280px]', productOpenFor !== null && 'pb-48')}>
          {lines.map((line, idx) => {
            const lt = totals.lines[lines.filter((l) => l.name).findIndex((l) => l.key === line.key)];
            return (
              <div key={line.key} className="pt-3.5 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Item #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                      {line.name ? formatCurrency(lt?.total ?? 0) : '₹0'}
                    </span>
                    <button
                      className="rounded p-1 text-slate-400 hover:text-red-500"
                      onClick={() => removeLine(line.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Item Name Input */}
                <div className="relative">
                  <div className="flex items-center gap-1">
                    <Input
                      value={productOpenFor === line.key ? productSearch : line.name}
                      placeholder="Search / scan / type item name"
                      onFocus={() => {
                        setProductOpenFor(line.key);
                        setProductSearch(line.name || '');
                      }}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        patchLine(line.key, { name: e.target.value, productId: undefined });
                        setProductOpenFor(line.key);
                      }}
                    />
                    <Search className="h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                  {productOpenFor === line.key && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProductOpenFor(null)} />
                      <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                        {isProductsLoading ? (
                          <div className="p-3 text-center text-xs text-slate-400">Loading saved products…</div>
                        ) : (productResults?.data ?? []).length > 0 ? (
                          (productResults?.data ?? []).map((p) => (
                            <button
                              key={p._id}
                              type="button"
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                              onClick={() => pickProduct(line.key, p)}
                            >
                              <div className="truncate pr-2">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                                {p.hsn && <div className="text-[10px] text-slate-400">HSN: {p.hsn}</div>}
                              </div>
                              <span className="ml-2 shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">
                                {formatCurrency(p.sellingPrice)}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-400">
                            No saved products found{productSearch ? ` matching "${productSearch}"` : ''}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Item Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">Qty</label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={line.qty}
                      onChange={(e) => patchLine(line.key, { qty: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">Price (₹)</label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.price}
                      onChange={(e) => patchLine(line.key, { price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">HSN</label>
                    <Input value={line.hsn ?? ''} onChange={(e) => patchLine(line.key, { hsn: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">Disc</label>
                    <div className="flex">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="rounded-r-none px-1.5"
                        value={line.discountValue}
                        onChange={(e) => patchLine(line.key, { discountValue: Number(e.target.value) })}
                      />
                      <button
                        type="button"
                        className="rounded-r-xl border border-l-0 border-slate-300 px-1.5 text-xs dark:border-slate-700"
                        onClick={() =>
                          patchLine(line.key, {
                            discountType: line.discountType === 'percent' ? 'flat' : 'percent',
                          })
                        }
                      >
                        {line.discountType === 'percent' ? '%' : '₹'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">GST %</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={line.taxRate}
                      onChange={(e) => patchLine(line.key, { taxRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <Button variant="outline" onClick={addLine} className="w-full sm:w-auto justify-center">
            <Plus className="h-4 w-4" /> Add Row <span className="text-xs text-slate-400">(Enter)</span>
          </Button>
        </div>
      </div>

      {/* Footer: notes + totals */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card space-y-3 p-4">
            <Field label="Notes">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visible on the document" />
            </Field>
            <Field label="Terms & Conditions">
              <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} />
            </Field>
          </div>

          {meta.hasPayments && (
            <div className="card p-4">
              <h3 className="mb-3 font-semibold">Payment</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mode">
                  <Select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                    <option value="credit">Credit</option>
                  </Select>
                </Field>
                <Field label="Amount Received">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                  />
                </Field>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="text-xs text-brand-600 hover:underline" onClick={() => setPayAmount(totals.grandTotal)}>
                  Full amount
                </button>
                <button className="text-xs text-slate-400 hover:underline" onClick={() => setPayAmount(0)}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card h-fit p-4">
          <h3 className="mb-3 font-semibold">Summary</h3>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal (taxable)" value={formatCurrency(totals.subtotal)} />
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Discount</span>
              <div className="flex w-40 items-center">
                <Input
                  type="number"
                  min={0}
                  className="rounded-r-none py-1"
                  value={docDiscountValue}
                  onChange={(e) => setDocDiscountValue(Number(e.target.value))}
                />
                <button
                  className="rounded-r-xl border border-l-0 border-slate-300 px-2 py-1.5 text-xs dark:border-slate-700"
                  onClick={() => setDocDiscountType(docDiscountType === 'percent' ? 'flat' : 'percent')}
                >
                  {docDiscountType === 'percent' ? '%' : '₹'}
                </button>
              </div>
            </div>
            {interState ? (
              <Row label="IGST" value={formatCurrency(totals.igst)} />
            ) : (
              <>
                <Row label="CGST" value={formatCurrency(totals.cgst)} />
                <Row label="SGST" value={formatCurrency(totals.sgst)} />
              </>
            )}
            {totals.cess > 0 && <Row label="CESS" value={formatCurrency(totals.cess)} />}
            <ChargeRow label="Shipping" value={shippingCharge} onChange={setShippingCharge} />
            <ChargeRow label="Packing" value={packingCharge} onChange={setPackingCharge} />
            <ChargeRow label="Other" value={otherCharge} onChange={setOtherCharge} />
            <Row label="Round Off" value={formatCurrency(totals.roundOff)} />
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-bold dark:border-slate-700">
              <span>Grand Total</span>
              <span>{formatCurrency(totals.grandTotal)}</span>
            </div>
            {meta.hasPayments && payAmount > 0 && (
              <>
                <Row label="Paid" value={formatCurrency(totals.paidAmount)} />
                <Row label="Balance" value={formatCurrency(totals.balanceAmount)} strong />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-40 mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center justify-between sm:mr-auto">
          <span className="text-xs sm:text-sm text-slate-500">
            Total: <strong className="text-sm sm:text-base text-slate-800 dark:text-slate-100">{formatCurrency(totals.grandTotal)}</strong>
          </span>
          <kbd className="hidden rounded border border-slate-300 px-1.5 text-xs sm:inline dark:border-slate-600">Alt+S</kbd>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => save(true)} disabled={saving || locked} className="flex-1 sm:flex-none justify-center">
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button onClick={() => save(false)} loading={saving} disabled={locked} className="flex-1 sm:flex-none justify-center">
            <FileCheck className="h-4 w-4" /> Save {meta.title}
          </Button>
        </div>
      </div>

      {/* AI Voice Order Modal */}
      <Modal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        title="🎙️ AI Voice & Text Fast Billing"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Speak or type invoice items (e.g. <em>"2 bags Wheat Atta 10kg at 450, 5 bottles Mustard Oil at 160"</em>).
          </p>
          <Textarea
            rows={4}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            placeholder="Type or speak invoice items..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setVoiceOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleParseVoice}
              disabled={voiceLoading || !voiceTranscript.trim()}
              className="bg-brand-gradient text-white"
            >
              {voiceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>Extract & Add Items</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn('flex justify-between', strong && 'font-semibold')}>
      <span className="text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ChargeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <Input
        type="number"
        min={0}
        step="0.01"
        className="w-40 py-1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
