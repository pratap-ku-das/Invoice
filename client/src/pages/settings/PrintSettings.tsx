import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Field, Input, Select } from '@/components/ui/primitives';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { CompanyProfile } from '@/types';

const THEMES = ['modern', 'professional', 'gst', 'minimal', 'corporate', 'blue', 'dark', 'classic'];

export default function PrintSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: company } = useQuery<CompanyProfile>({
    queryKey: ['company'],
    queryFn: async () => (await api.get('/company')).data,
  });

  const [form, setForm] = useState({
    theme: 'modern',
    paperSize: 'A4',
    orientation: 'portrait',
    marginMm: 10,
    autoPrint: false,
    showLogo: true,
    showSignature: true,
    showBankDetails: true,
    showUpiQr: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (company?.printSettings) {
      setForm((f) => ({ ...f, ...company.printSettings } as typeof f));
    }
  }, [company]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/company', { printSettings: form });
      qc.invalidateQueries({ queryKey: ['company'] });
      toast.success('Print settings saved');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Print Settings" subtitle="Default template, paper size and print behavior" />

      <div className="max-w-2xl space-y-4">
        <div className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          <Field label="Default Theme">
            <Select
              value={form.theme}
              onChange={(e) => setForm({ ...form, theme: e.target.value })}
              disabled={!isAdmin}
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Paper Size">
            <Select
              value={form.paperSize}
              onChange={(e) => setForm({ ...form, paperSize: e.target.value })}
              disabled={!isAdmin}
            >
              <option value="A4">A4</option>
              <option value="thermal-80">Thermal 80mm</option>
              <option value="thermal-58">Thermal 58mm</option>
            </Select>
          </Field>
          <Field label="Orientation">
            <Select
              value={form.orientation}
              onChange={(e) => setForm({ ...form, orientation: e.target.value })}
              disabled={!isAdmin}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </Select>
          </Field>
          <Field label="Margin (mm)">
            <Input
              type="number"
              min={0}
              max={40}
              value={form.marginMm}
              onChange={(e) => setForm({ ...form, marginMm: Number(e.target.value) })}
              disabled={!isAdmin}
            />
          </Field>
        </div>

        <div className="card space-y-3 p-4">
          <h3 className="font-semibold">Visibility</h3>
          {(
            [
              ['showLogo', 'Show company logo'],
              ['showSignature', 'Show signature block'],
              ['showBankDetails', 'Show bank details'],
              ['showUpiQr', 'Show UPI payment QR'],
              ['autoPrint', 'Auto-open print dialog after saving an invoice'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={!!form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                disabled={!isAdmin}
              />
              {label}
            </label>
          ))}
        </div>

        {isAdmin && (
          <Button onClick={save} loading={saving}>
            <Save className="h-4 w-4" /> Save Print Settings
          </Button>
        )}
      </div>
    </div>
  );
}
