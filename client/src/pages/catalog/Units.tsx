import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Ruler } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal, EmptyState } from '@/components/ui/feedback';
import { Button, Input, Field } from '@/components/ui/primitives';
import { useList, useCreate, useUpdate, useRemove } from '@/hooks/useCrud';
import type { Unit } from '@/types';

export default function Units() {
  const [modal, setModal] = useState<{ open: boolean; editing?: Unit }>({ open: false });
  const { data, isLoading } = useList<Unit>('units', { limit: 200 });
  const create = useCreate('units', { success: 'Unit created' });
  const update = useUpdate('units', { success: 'Saved' });
  const remove = useRemove('units');

  const { register, handleSubmit, reset } = useForm<{ name: string; shortName: string }>();

  const onSubmit = async (f: { name: string; shortName: string }) => {
    if (modal.editing) await update.mutateAsync({ id: modal.editing._id, dto: f });
    else await create.mutateAsync(f);
    setModal({ open: false });
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Units"
        subtitle="Measurement units for your products"
        actions={
          <Button
            onClick={() => {
              reset({ name: '', shortName: '' });
              setModal({ open: true });
            }}
          >
            <Plus className="h-4 w-4" /> Add Unit
          </Button>
        }
      />

      {isLoading ? null : (data?.data?.length ?? 0) === 0 ? (
        <div className="card">
          <EmptyState icon={Ruler} title="No units" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data?.data?.map((u) => (
            <div key={u._id} className="card flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-slate-400">{u.shortName}</p>
              </div>
              <div className="flex gap-0.5">
                <button
                  className="rounded p-1 text-slate-400 hover:text-brand-600"
                  onClick={() => {
                    reset({ name: u.name, shortName: u.shortName });
                    setModal({ open: true, editing: u });
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  className="rounded p-1 text-slate-400 hover:text-red-600"
                  onClick={() => remove.mutate(u._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.editing ? 'Edit Unit' : 'New Unit'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" required>
            <Input {...register('name', { required: true })} placeholder="Kilograms" autoFocus />
          </Field>
          <Field label="Short Name" required>
            <Input {...register('shortName', { required: true })} placeholder="KG" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModal({ open: false })}>
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
