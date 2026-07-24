import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button } from '@/components/ui/primitives';
import { EmptyState } from '@/components/ui/feedback';
import { api } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

interface Notif {
  _id: string;
  type: string;
  title: string;
  body?: string;
  level: 'info' | 'warning' | 'critical';
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function Notifications() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isFetching, refetch } = useQuery<Notif[]>({
    queryKey: ['notifications', 'list'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const scan = async () => {
    await api.post('/notifications/scan');
    await refetch();
    invalidate();
  };

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    invalidate();
  };

  const open = async (n: Notif) => {
    if (!n.read) await api.patch(`/notifications/${n._id}/read`);
    invalidate();
    if (n.link) navigate(n.link);
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Notifications"
        subtitle="Payment dues, low stock and system alerts"
        actions={
          <>
            <Button variant="outline" onClick={scan} loading={isFetching}>
              <RefreshCw className="h-4 w-4" /> Re-scan
            </Button>
            <Button variant="outline" onClick={markAll}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          </>
        }
      />

      {(data ?? []).length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title="All clear"
            description="No alerts. Run a re-scan to check for payment dues and low stock."
          />
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {(data ?? []).map((n) => (
            <button
              key={n._id}
              className={cn(
                'flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50',
                !n.read && 'bg-brand-50/50 dark:bg-brand-500/5',
              )}
              onClick={() => open(n)}
            >
              <span
                className={cn(
                  'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                  n.level === 'critical' ? 'bg-red-500' : n.level === 'warning' ? 'bg-amber-500' : 'bg-brand-500',
                  n.read && 'opacity-30',
                )}
              />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</p>
                {n.body && <p className="text-xs text-slate-400">{n.body}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge tone={n.type === 'low-stock' ? 'red' : n.type === 'payment-due' ? 'amber' : 'blue'}>
                  {n.type}
                </Badge>
                <span className="text-xs text-slate-400">{formatDate(n.createdAt, 'DD MMM HH:mm')}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
