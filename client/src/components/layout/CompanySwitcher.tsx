import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Modal } from '@/components/ui/feedback';
import { Button, Field, Input } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { CompanySummary } from '@/types';

const createSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  gstin: z.string().optional(),
  phone: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

function CreateCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createCompany } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const submit = handleSubmit(async (values) => {
    setBusy(true);
    try {
      await createCompany(values);
      toast.success(`${values.name} created`);
      reset();
      onClose();
      navigate('/');
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="Create new company" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Company name" required error={errors.name?.message}>
          <Input placeholder="e.g. Sharma Electronics" {...register('name')} />
        </Field>
        <Field label="GSTIN" error={errors.gstin?.message}>
          <Input placeholder="Optional" {...register('gstin')} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input placeholder="Optional" {...register('phone')} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Create & switch
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function CompanySwitcher() {
  const { user, switchCompany } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: companies } = useQuery<CompanySummary[]>({
    queryKey: ['auth', 'companies'],
    queryFn: async () => (await api.get('/auth/companies')).data,
    enabled: !!user,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = companies?.find((c) => c.companyId === user?.companyId);

  const pick = async (c: CompanySummary) => {
    setOpen(false);
    if (c.companyId === user?.companyId) return;
    setSwitching(true);
    try {
      await switchCompany(c.companyId);
      toast.success(`Switched to ${c.name}`);
      navigate('/');
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={switching}
        className="flex max-w-[200px] items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 px-2.5 py-1.5 text-xs font-bold shadow-xs transition hover:bg-slate-100 sm:max-w-[240px] dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-xs border border-slate-200 dark:border-slate-800">
          {current?.logo ? (
            <img src={current.logo} alt={current.name} className="h-full w-full object-contain p-0.5" />
          ) : (
            <span className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400">
              {current?.name?.[0]?.toUpperCase() ?? 'C'}
            </span>
          )}
        </div>
        <span className="truncate text-slate-800 dark:text-slate-200">{current?.name ?? 'My Company'}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="card absolute left-0 top-full z-50 mt-2 w-64 p-1.5 shadow-soft"
          >
            <div className="section-label !pt-1">Companies</div>
            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {(companies ?? []).map((c) => (
                <button key={c.companyId} className="menu-item" onClick={() => pick(c)}>
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      c.companyId === user?.companyId
                        ? 'bg-brand-gradient text-white'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                    )}
                  >
                    {c.name[0]?.toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-left">
                    {c.name}
                    <span className="block text-[10px] capitalize text-slate-400">
                      {c.role} · {c.plan}
                    </span>
                  </span>
                  {c.companyId === user?.companyId && (
                    <Check className="h-4 w-4 shrink-0 text-brand-500" />
                  )}
                </button>
              ))}
            </div>
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            <button
              className="menu-item"
              onClick={() => {
                setOpen(false);
                setCreating(true);
              }}
            >
              <Plus className="h-4 w-4" /> New company…
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateCompanyModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
