import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Save,
  Plus,
  Trash2,
  Building2,
  Landmark,
  FileSpreadsheet,
  Users as UsersIcon,
  Sliders,
  Upload,
  FilePenLine,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Field, Input, Select, Textarea } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/feedback';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { CompanyProfile } from '@/types';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface SequenceRow {
  _id: string;
  docType: string;
  prefix: string;
  counter: number;
  padding: number;
}

const ROLES = ['admin', 'manager', 'sales', 'accountant', 'cashier', 'viewer'];

export default function Settings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState<'company' | 'numbering' | 'users'>('company');

  // ---- company form ----
  const { data: company } = useQuery<CompanyProfile>({
    queryKey: ['company'],
    queryFn: async () => (await api.get('/company')).data,
  });
  const [form, setForm] = useState<Record<string, string | boolean | number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name ?? '',
      logo: company.logo ?? '',
      signature: company.signature ?? '',
      gstin: company.gstin ?? '',
      pan: company.pan ?? '',
      phone: company.phone ?? '',
      email: company.email ?? '',
      website: company.website ?? '',
      upiId: company.upiId ?? '',
      line1: company.address?.line1 ?? '',
      city: company.address?.city ?? '',
      state: company.address?.state ?? '',
      pincode: company.address?.pincode ?? '',
      accountName: company.bank?.accountName ?? '',
      accountNumber: company.bank?.accountNumber ?? '',
      bankName: company.bank?.bankName ?? '',
      ifsc: company.bank?.ifsc ?? '',
      termsAndConditions: company.termsAndConditions ?? '',
      roundOffEnabled: company.roundOffEnabled ?? true,
      negativeStockAllowed: company.negativeStockAllowed ?? false,
      brandColor: company.brandColor ?? '#4f46e5',
    });
  }, [company]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveCompany = async () => {
    setSaving(true);
    try {
      await api.patch('/company', {
        name: form.name,
        logo: form.logo !== undefined ? form.logo : undefined,
        signature: form.signature !== undefined ? form.signature : undefined,
        gstin: form.gstin || undefined,
        pan: form.pan || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        upiId: form.upiId || undefined,
        brandColor: form.brandColor || undefined,
        address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
        bank: {
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          bankName: form.bankName,
          ifsc: form.ifsc,
        },
        termsAndConditions: form.termsAndConditions,
        roundOffEnabled: form.roundOffEnabled,
        negativeStockAllowed: form.negativeStockAllowed,
      });
      qc.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company settings saved');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  // ---- numbering ----
  const { data: sequences } = useQuery<SequenceRow[]>({
    queryKey: ['company', 'sequences'],
    queryFn: async () => (await api.get('/company/sequences')).data,
    enabled: tab === 'numbering',
  });

  const saveSequence = async (docType: string, prefix: string, nextNumber: number, padding: number) => {
    try {
      await api.patch(`/company/sequences/${docType}`, { prefix, nextNumber, padding });
      qc.invalidateQueries({ queryKey: ['company', 'sequences'] });
      toast.success(`${docType} numbering updated`);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  // ---- users ----
  const { data: users } = useQuery<UserRow[]>({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
    enabled: tab === 'users' && isAdmin,
  });
  const [userModal, setUserModal] = useState(false);
  const [uForm, setUForm] = useState({ name: '', email: '', password: '', role: 'sales' });

  const createUser = async () => {
    try {
      await api.post('/users', uForm);
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
      setUserModal(false);
      setUForm({ name: '', email: '', password: '', role: 'sales' });
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4">
      {/* Page Header */}
      <PageHeader title="Settings" subtitle="Company profile, numbering and team" />

      {/* Navigation Tabs Pill Bar */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900 w-full sm:w-fit">
        {(
          [
            ['company', 'Company Profile', Building2],
            ['numbering', 'Numbering', FileSpreadsheet],
            ['users', 'Users & Roles', UsersIcon],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            className={`flex items-center gap-1.5 shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              tab === key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            onClick={() => setTab(key)}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Company Settings */}
      {tab === 'company' && (
        <div className="max-w-3xl space-y-4">
          {/* User Profile Summary Card */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-600/10 via-slate-900 to-slate-900 p-4 text-white">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient font-black text-lg text-white shadow-md">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm text-slate-100 truncate">{user?.name}</h2>
                <Badge tone="indigo">{user?.role}</Badge>
              </div>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="card grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-400 sm:col-span-2 flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> Business Details
            </h3>

            {/* Company / Retailer Logo Uploader */}
            <div className="sm:col-span-2 flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-800 overflow-hidden shadow-xs">
                {form.logo ? (
                  <img src={String(form.logo)} alt="Company Logo" className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Registered Business Logo</label>
                <p className="text-[11px] text-slate-400">Upload your retailer/store logo (PNG, JPG, SVG) to print on your invoices & receipts.</p>
                {isAdmin && (
                  <div className="flex items-center gap-2 pt-1">
                    <label className="btn-outline text-xs cursor-pointer py-1 px-2.5 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 font-semibold hover:bg-slate-50">
                      <Upload className="h-3.5 w-3.5 mr-1 inline" /> Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const maxDim = 400;
                              let width = img.width;
                              let height = img.height;
                              if (width > maxDim || height > maxDim) {
                                if (width > height) {
                                  height = Math.round((height * maxDim) / width);
                                  width = maxDim;
                                } else {
                                  width = Math.round((width * maxDim) / height);
                                  height = maxDim;
                                }
                              }
                              const canvas = document.createElement('canvas');
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                ctx.drawImage(img, 0, 0, width, height);
                                setForm((f) => ({ ...f, logo: canvas.toDataURL('image/png') }));
                              } else {
                                setForm((f) => ({ ...f, logo: event.target?.result as string }));
                              }
                              toast.success('New logo selected! Click "Save Company Settings" to apply.');
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {form.logo && (
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:underline font-semibold"
                        onClick={() => setForm((f) => ({ ...f, logo: '' }))}
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Authorized Signature Uploader */}
            <div className="sm:col-span-2 flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="relative flex h-16 w-36 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-800 overflow-hidden shadow-xs">
                {form.signature ? (
                  <img src={String(form.signature)} alt="Authorized Signature" className="h-full w-full object-contain" />
                ) : (
                  <FilePenLine className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Authorized Signature / Stamp</label>
                <p className="text-[11px] text-slate-400">Upload a digital signature or stamp image (PNG/JPG) to display above 'Authorized Signatory'.</p>
                {isAdmin && (
                  <div className="flex items-center gap-2 pt-1">
                    <label className="btn-outline text-xs cursor-pointer py-1 px-2.5 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 font-semibold hover:bg-slate-50">
                      <Upload className="h-3.5 w-3.5 mr-1 inline" /> Upload Signature
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const maxW = 500;
                              const maxH = 200;
                              let width = img.width;
                              let height = img.height;
                              if (width > maxW || height > maxH) {
                                const ratio = Math.min(maxW / width, maxH / height);
                                width = Math.round(width * ratio);
                                height = Math.round(height * ratio);
                              }
                              const canvas = document.createElement('canvas');
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                ctx.drawImage(img, 0, 0, width, height);
                                setForm((f) => ({ ...f, signature: canvas.toDataURL('image/png') }));
                              } else {
                                setForm((f) => ({ ...f, signature: event.target?.result as string }));
                              }
                              toast.success('Signature image selected! Click "Save Company Settings" to apply.');
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {form.signature && (
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:underline font-semibold"
                        onClick={() => setForm((f) => ({ ...f, signature: '' }))}
                      >
                        Remove Signature
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Field label="Company Name" required>
              <Input value={String(form.name ?? '')} onChange={set('name')} disabled={!isAdmin} />
            </Field>
            <Field label="GSTIN">
              <Input value={String(form.gstin ?? '')} onChange={set('gstin')} disabled={!isAdmin} placeholder="27AAAAA0000A1Z5" />
            </Field>
            <Field label="PAN">
              <Input value={String(form.pan ?? '')} onChange={set('pan')} disabled={!isAdmin} placeholder="ABCDE1234F" />
            </Field>
            <Field label="Phone">
              <Input value={String(form.phone ?? '')} onChange={set('phone')} disabled={!isAdmin} placeholder="+91 9876543210" />
            </Field>
            <Field label="Email">
              <Input value={String(form.email ?? '')} onChange={set('email')} disabled={!isAdmin} />
            </Field>
            <Field label="Website">
              <Input value={String(form.website ?? '')} onChange={set('website')} disabled={!isAdmin} placeholder="https://example.com" />
            </Field>
            <Field label="Brand Accent Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 cursor-pointer rounded-xl border border-slate-300 dark:border-slate-700"
                  value={String(form.brandColor ?? '#4f46e5')}
                  onChange={(e) => setForm((f) => ({ ...f, brandColor: e.target.value }))}
                  disabled={!isAdmin}
                />
                <span className="text-xs font-mono text-slate-400">{String(form.brandColor ?? '#4f46e5')}</span>
              </div>
            </Field>
          </div>

          <div className="card grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 sm:col-span-2 flex items-center gap-1.5">
              <Landmark className="h-4 w-4" /> Bank Account & UPI Details
            </h3>
            <Field label="Account Holder">
              <Input value={String(form.accountName ?? '')} onChange={set('accountName')} disabled={!isAdmin} />
            </Field>
            <Field label="Account Number">
              <Input value={String(form.accountNumber ?? '')} onChange={set('accountNumber')} disabled={!isAdmin} />
            </Field>
            <Field label="Bank Name">
              <Input value={String(form.bankName ?? '')} onChange={set('bankName')} disabled={!isAdmin} />
            </Field>
            <Field label="IFSC Code">
              <Input value={String(form.ifsc ?? '')} onChange={set('ifsc')} disabled={!isAdmin} />
            </Field>
            <Field label="UPI ID (for Payment QR)">
              <Input value={String(form.upiId ?? '')} onChange={set('upiId')} placeholder="name@upi" disabled={!isAdmin} />
            </Field>
          </div>

          <div className="card grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 sm:col-span-2">Address Details</h3>
            <div className="sm:col-span-2">
              <Field label="Street / Building Address">
                <Input value={String(form.line1 ?? '')} onChange={set('line1')} disabled={!isAdmin} />
              </Field>
            </div>
            <Field label="City">
              <Input value={String(form.city ?? '')} onChange={set('city')} disabled={!isAdmin} />
            </Field>
            <Field label="State">
              <Input value={String(form.state ?? '')} onChange={set('state')} disabled={!isAdmin} />
            </Field>
            <Field label="Pincode">
              <Input value={String(form.pincode ?? '')} onChange={set('pincode')} disabled={!isAdmin} />
            </Field>
          </div>

          <div className="card space-y-3.5 p-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sliders className="h-4 w-4" /> Invoice Behavior
            </h3>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
                checked={!!form.roundOffEnabled}
                onChange={(e) => setForm((f) => ({ ...f, roundOffEnabled: e.target.checked }))}
                disabled={!isAdmin}
              />
              Round off grand total to nearest rupee
            </label>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500"
                checked={!!form.negativeStockAllowed}
                onChange={(e) => setForm((f) => ({ ...f, negativeStockAllowed: e.target.checked }))}
                disabled={!isAdmin}
              />
              Allow negative stock (sell items with 0 balance)
            </label>
            <Field label="Default Terms & Conditions">
              <Textarea
                rows={3}
                value={String(form.termsAndConditions ?? '')}
                onChange={set('termsAndConditions')}
                disabled={!isAdmin}
                placeholder="1. Goods once sold will not be taken back. 2. Interest @ 18% p.a. on overdue payments."
              />
            </Field>
          </div>

          {isAdmin && (
            <div className="pt-2">
              <Button onClick={saveCompany} loading={saving} className="w-full sm:w-auto">
                <Save className="h-4 w-4" /> Save Company Settings
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Numbering Series */}
      {tab === 'numbering' && (
        <div className="max-w-2xl space-y-3">
          <p className="text-xs text-slate-400">
            Customize document prefixes, auto-counter numbers and padding for invoice & bill series.
          </p>
          {(sequences ?? []).length === 0 && (
            <div className="card p-4 text-xs text-slate-400 text-center">
              Series appear here automatically after creating your first invoice or bill.
            </div>
          )}
          {(sequences ?? []).map((s) => (
            <SequenceEditor key={s._id} seq={s} onSave={saveSequence} disabled={!isAdmin} />
          ))}
        </div>
      )}

      {/* Tab: Team & Users */}
      {tab === 'users' &&
        (isAdmin ? (
          <div className="max-w-3xl space-y-3">
            <div className="flex justify-end">
              <Button onClick={() => setUserModal(true)} className="px-3 py-1.5 text-xs">
                <Plus className="h-4 w-4" /> Add User
              </Button>
            </div>
            <div className="card divide-y divide-slate-100 dark:divide-slate-800">
              {(users ?? []).map((u) => (
                <div key={u._id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 font-bold text-xs text-brand-400">
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-200">{u.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      className="w-28 text-xs py-1"
                      value={u.role}
                      disabled={u._id === user?.id}
                      onChange={async (e) => {
                        await api.patch(`/users/${u._id}`, { role: e.target.value });
                        qc.invalidateQueries({ queryKey: ['users'] });
                        toast.success('Role updated');
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                    <Badge tone={u.isActive ? 'green' : 'red'}>{u.isActive ? 'active' : 'disabled'}</Badge>
                    {u._id !== user?.id && (
                      <button
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-800"
                        onClick={async () => {
                          await api.delete(`/users/${u._id}`);
                          qc.invalidateQueries({ queryKey: ['users'] });
                          toast.success('User removed');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card max-w-md p-5 text-xs text-slate-400">
            Only administrators can add or modify user roles.
          </div>
        ))}

      {/* Modal: Create User */}
      <Modal open={userModal} onClose={() => setUserModal(false)} title="Add User" size="sm">
        <div className="space-y-3.5">
          <Field label="Full Name" required>
            <Input value={uForm.name} onChange={(e) => setUForm({ ...uForm, name: e.target.value })} placeholder="John Doe" />
          </Field>
          <Field label="Email Address" required>
            <Input type="email" value={uForm.email} onChange={(e) => setUForm({ ...uForm, email: e.target.value })} placeholder="john@company.com" />
          </Field>
          <Field label="Password (min 8 characters)" required>
            <Input
              type="password"
              value={uForm.password}
              onChange={(e) => setUForm({ ...uForm, password: e.target.value })}
            />
          </Field>
          <Field label="User Role">
            <Select value={uForm.role} onChange={(e) => setUForm({ ...uForm, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setUserModal(false)}>
              Cancel
            </Button>
            <Button onClick={createUser} disabled={!uForm.name || !uForm.email || uForm.password.length < 8}>
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SequenceEditor({
  seq,
  onSave,
  disabled,
}: {
  seq: { docType: string; prefix: string; counter: number; padding: number };
  onSave: (docType: string, prefix: string, nextNumber: number, padding: number) => void;
  disabled: boolean;
}) {
  const [prefix, setPrefix] = useState(seq.prefix);
  const [next, setNext] = useState(seq.counter + 1);

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-3.5">
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-200 capitalize">{seq.docType.replace(/-/g, ' ')}</p>
        <p className="text-[10px] text-slate-400">Last used: {seq.counter}</p>
      </div>

      <div className="flex items-center gap-2">
        <Field label="Prefix">
          <Input className="w-20 text-xs py-1" value={prefix} onChange={(e) => setPrefix(e.target.value)} disabled={disabled} />
        </Field>
        <Field label="Next #">
          <Input
            type="number"
            min={seq.counter + 1}
            className="w-20 text-xs py-1"
            value={next}
            onChange={(e) => setNext(Number(e.target.value))}
            disabled={disabled}
          />
        </Field>
        {!disabled && (
          <Button variant="outline" className="px-2.5 py-1 text-xs" onClick={() => onSave(seq.docType, prefix, next, seq.padding)}>
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        )}
      </div>
    </div>
  );
}
