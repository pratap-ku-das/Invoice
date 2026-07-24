import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal, EmptyState } from '@/components/ui/feedback';
import { Button, Input, Field } from '@/components/ui/primitives';
import { useList, useCreate, useUpdate, useRemove } from '@/hooks/useCrud';
import type { Category } from '@/types';

export default function Categories() {
  const [modal, setModal] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const { data, isLoading } = useList<Category>('categories', { limit: 200 });
  const create = useCreate('categories', { success: 'Category created' });
  const update = useUpdate('categories', { success: 'Saved' });
  const remove = useRemove('categories');

  const { register, handleSubmit, reset } = useForm<{ name: string; description?: string }>();

  const onSubmit = async (f: { name: string; description?: string }) => {
    if (!f.name.trim()) return;
    if (modal.editing) await update.mutateAsync({ id: modal.editing._id, dto: f });
    else await create.mutateAsync(f);
    setModal({ open: false });
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Categories"
        subtitle={`${data?.total ?? 0} categories`}
        actions={
          <Button
            onClick={() => {
              reset({ name: '', description: '' });
              setModal({ open: true });
            }}
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      {isLoading ? null : (data?.data?.length ?? 0) === 0 ? (
        <div className="card">
          <EmptyState icon={Tags} title="No categories" description="Organize your products with categories." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((c) => (
            <div key={c._id} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{c.name}</p>
                {c.description && <p className="text-xs text-slate-400">{c.description}</p>}
              </div>
              <div className="flex gap-1">
                <button
                  className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600"
                  onClick={() => {
                    reset({ name: c.name, description: c.description ?? '' });
                    setModal({ open: true, editing: c });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="rounded-lg p-1.5 text-slate-400 hover:text-red-600"
                  onClick={() => remove.mutate(c._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.editing ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" required>
            <Input {...register('name', { required: true })} autoFocus />
          </Field>
          <Field label="Description">
            <Input {...register('description')} />
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
