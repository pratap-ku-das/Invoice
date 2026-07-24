import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import type { ListQuery, Paginated } from '@/types';

/** Generic list + CRUD hooks for any REST resource following the server conventions */
export function useList<T>(resource: string, query: ListQuery = {}) {
  return useQuery<Paginated<T>>({
    queryKey: [resource, 'list', query],
    queryFn: async () => (await api.get(`/${resource}`, { params: query })).data,
    placeholderData: keepPreviousData,
  });
}

export function useOne<T>(resource: string, id?: string) {
  return useQuery<T>({
    queryKey: [resource, 'one', id],
    queryFn: async () => (await api.get(`/${resource}/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreate<T>(resource: string, opts: { success?: string } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Partial<T> | Record<string, unknown>) =>
      (await api.post(`/${resource}`, dto)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      if (opts.success) toast.success(opts.success);
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdate<T>(resource: string, opts: { success?: string } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<T> | Record<string, unknown> }) =>
      (await api.patch(`/${resource}/${id}`, dto)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      if (opts.success) toast.success(opts.success);
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useRemove(resource: string, opts: { success?: string } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/${resource}/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success(opts.success ?? 'Deleted');
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useAction(
  resource: string,
  opts: { success?: string; invalidate?: string[] } = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ path, body }: { path: string; body?: unknown }) =>
      (await api.post(`/${resource}/${path}`, body ?? {})).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      for (const key of opts.invalidate ?? []) qc.invalidateQueries({ queryKey: [key] });
      if (opts.success) toast.success(opts.success);
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
