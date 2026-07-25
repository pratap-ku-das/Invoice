import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  target: string;
  ip: string;
  date: string;
}

export default function PlatformAuditLogs() {
  const { data: logs, isLoading } = useQuery<AuditLogItem[]>({
    queryKey: ['admin', 'audit-logs'],
    queryFn: async () => (await api.get('/admin/audit-logs')).data,
  });

  const auditLogs = logs ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Platform Activity & Audit Logs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live activity audit stream generated from real database events, user registrations, and company operations.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
            <tr>
              <th className="px-6 py-4">Log ID</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Target Entity</th>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
                  Loading real system audit logs...
                </td>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  No activity logs recorded yet.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400">{log.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{log.action}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-brand-600">{log.user}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{log.target}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ip}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{log.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
