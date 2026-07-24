const MOCK_AUDIT_LOGS = [
  { id: 'LOG-8801', action: 'Company Subscription Updated', user: 'Platform Owner', target: 'Sharma Electronics', ip: '127.0.0.1', date: '2026-07-24 15:40:12' },
  { id: 'LOG-8802', action: 'Company Impersonation Session', user: 'Platform Owner', target: 'Patel Traders', ip: '127.0.0.1', date: '2026-07-24 15:35:00' },
  { id: 'LOG-8803', action: 'Onboarding Completed', user: 'Rajesh Kumar', target: 'PaperBolt Enterprises', ip: '192.168.1.4', date: '2026-07-24 14:10:22' },
  { id: 'LOG-8804', action: 'Platform Admin Login', user: 'Super Admin', target: 'Platform Control Panel', ip: '127.0.0.1', date: '2026-07-24 10:00:00' },
];

export default function PlatformAuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Platform Activity & Audit Logs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Security audit stream for all administrative actions, company impersonations, and access logs.
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
            {MOCK_AUDIT_LOGS.map((log) => (
              <tr key={log.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <td className="px-6 py-4 font-mono font-bold text-slate-400">{log.id}</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{log.action}</td>
                <td className="px-6 py-4 text-xs font-semibold text-brand-600">{log.user}</td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{log.target}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ip}</td>
                <td className="px-6 py-4 text-xs text-slate-400">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
