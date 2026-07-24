import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
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
    <div className="p-4 sm:p-6">
      <PageHeader title="Settings" subtitle="Company profile, numbering and team" />

      <div className="mb-4 flex rounded-xl border border-slate-200 p-0.5 dark:border-slate-700 w-fit">
        {(
          [
            ['company', 'Company'],
            ['numbering', 'Numbering'],
            ['users', 'Users & Roles'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              tab === key ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'company' && (
        <div className="max-w-3xl space-y-4">
          <div className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <h3 className="font-semibold sm:col-span-2">Business Details</h3>
            <Field label="Company Name" required>
              <Input value={String(form.name ?? '')} onChange={set('name')} disabled={!isAdmin} />
            </Field>
            <Field label="GSTIN">
              <Input value={String(form.gstin ?? '')} onChange={set('gstin')} disabled={!isAdmin} />
            </Field>
            <Field label="PAN">
              <Input value={String(form.pan ?? '')} onChange={set('pan')} disabled={!isAdmin} />
            </Field>
            <Field label="Phone">
              <Input value={String(form.phone ?? '')} onChange={set('phone')} disabled={!isAdmin} />
            </Field>
            <Field label="Email">
              <Input value={String(form.email ?? '')} onChange={set('email')} disabled={!isAdmin} />
            </Field>
            <Field label="Website">
              <Input value={String(form.website ?? '')} onChange={set('website')} disabled={!isAdmin} />
            </Field>
            <Field label="Brand Color (PDF accent)">
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-xl border border-slate-300 dark:border-slate-700"
                value={String(form.brandColor ?? '#4f46e5')}
                onChange={(e) => setForm((f) => ({ ...f, brandColor: e.target.value }))}
                disabled={!isAdmin}
              />
            </Field>
          </div>

          <div className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <h3 className="font-semibold sm:col-span-2">Address</h3>
            <div className="sm:col-span-2">
              <Field label="Address Line">
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

          <div className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <h3 className="font-semibold sm:col-span-2">Bank & UPI (shown on invoices)</h3>
            <Field label="Account Holder">
              <Input value={String(form.accountName ?? '')} onChange={set('accountName')} disabled={!isAdmin} />
            </Field>
            <Field label="Account Number">
              <Input value={String(form.accountNumber ?? '')} onChange={set('accountNumber')} disabled={!isAdmin} />
            </Field>
            <Field label="Bank Name">
              <Input value={String(form.bankName ?? '')} onChange={set('bankName')} disabled={!isAdmin} />
            </Field>
            <Field label="IFSC">
              <Input value={String(form.ifsc ?? '')} onChange={set('ifsc')} disabled={!isAdmin} />
            </Field>
            <Field label="UPI ID (payment QR)">
              <Input value={String(form.upiId ?? '')} onChange={set('upiId')} placeholder="business@upi" disabled={!isAdmin} />
            </Field>
          </div>

          <div className="card space-y-4 p-4">
            <h3 className="font-semibold">Invoice Behavior</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={!!form.roundOffEnabled}
                onChange={(e) => setForm((f) => ({ ...f, roundOffEnabled: e.target.checked }))}
                disabled={!isAdmin}
              />
              Round off grand total to nearest rupee
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={!!form.negativeStockAllowed}
                onChange={(e) => setForm((f) => ({ ...f, negativeStockAllowed: e.target.checked }))}
                disabled={!isAdmin}
              />
              Allow negative stock (sell more than available)
            </label>
            <Field label="Default Terms & Conditions">
              <Textarea
                value={String(form.termsAndConditions ?? '')}
                onChange={set('termsAndConditions')}
                disabled={!isAdmin}
              />
            </Field>
          </div>

          {isAdmin && (
            <Button onClick={saveCompany} loading={saving}>
              <Save className="h-4 w-4" /> Save Settings
            </Button>
          )}
        </div>
      )}

      {tab === 'numbering' && (
        <div className="max-w-2xl space-y-3">
          <p className="text-sm text-slate-500">
            Customize the prefix, next number and zero-padding for each document series.
          </p>
          {(sequences ?? []).length === 0 && (
            <p className="card p-4 text-sm text-slate-400">
              Series appear here after the first document of each type is created.
            </p>
          )}
          {(sequences ?? []).map((s) => (
            <SequenceEditor key={s._id} seq={s} onSave={saveSequence} disabled={!isAdmin} />
          ))}
        </div>
      )}

      {tab === 'users' &&
        (isAdmin ? (
          <div className="max-w-3xl">
            <div className="mb-3 flex justify-end">
              <Button onClick={() => setUserModal(true)}>
                <Plus className="h-4 w-4" /> Add User
              </Button>
            </div>
            <div className="card divide-y divide-slate-100 dark:divide-slate-800">
              {(users ?? []).map((u) => (
                <div key={u._id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <Select
                    className="w-36"
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
                      className="rounded-lg p-1.5 text-slate-400 hover:text-red-600"
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
              ))}
            </div>
          </div>
        ) : (
          <p className="card max-w-md p-6 text-sm text-slate-500">
            Only admins can manage users. Ask your administrator for access.
          </p>
        ))}

      <Modal open={userModal} onClose={() => setUserModal(false)} title="Add User" size="sm">
        <div className="space-y-4">
          <Field label="Name" required>
            <Input value={uForm.name} onChange={(e) => setUForm({ ...uForm, name: e.target.value })} />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={uForm.email} onChange={(e) => setUForm({ ...uForm, email: e.target.value })} />
          </Field>
          <Field label="Password (min 8 chars)" required>
            <Input
              type="password"
              value={uForm.password}
              onChange={(e) => setUForm({ ...uForm, password: e.target.value })}
            />
          </Field>
          <Field label="Role">
            <Select value={uForm.role} onChange={(e) => setUForm({ ...uForm, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
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
  const [padding, setPadding] = useState(seq.padding);

  return (
    <div className="card flex flex-wrap items-end gap-3 p-4">
      <div className="w-32">
        <p className="label capitalize">{seq.docType.replace(/-/g, ' ')}</p>
        <p className="text-xs text-slate-400">Last used: {seq.counter}</p>
      </div>
      <Field label="Prefix">
        <Input className="w-24" value={prefix} onChange={(e) => setPrefix(e.target.value)} disabled={disabled} />
      </Field>
      <Field label="Next #">
        <Input
          type="number"
          min={seq.counter + 1}
          className="w-24"
          value={next}
          onChange={(e) => setNext(Number(e.target.value))}
          disabled={disabled}
        />
      </Field>
      <Field label="Padding">
        <Input
          type="number"
          min={0}
          max={8}
          className="w-20"
          value={padding}
          onChange={(e) => setPadding(Number(e.target.value))}
          disabled={disabled}
        />
      </Field>
      {!disabled && (
        <Button variant="outline" onClick={() => onSave(seq.docType, prefix, next, padding)}>
          <Save className="h-4 w-4" /> Save
        </Button>
      )}
    </div>
  );
}
