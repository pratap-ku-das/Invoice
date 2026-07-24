import { Badge } from '@/components/ui/primitives';

const MOCK_TICKETS = [
  { id: 'TKT-101', company: 'Sharma Traders', subject: 'GSTIN tax calculation query on thermal print', priority: 'high', status: 'open', date: '2026-07-24' },
  { id: 'TKT-102', company: 'Patel Electronics', subject: 'Requesting custom invoice sequence prefix setup', priority: 'medium', status: 'in-progress', date: '2026-07-23' },
  { id: 'TKT-103', company: 'Verma Supermarket', subject: 'Barcode printer alignment verification', priority: 'low', status: 'resolved', date: '2026-07-20' },
];

export default function PlatformSupport() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Support Tickets & Inquiries
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer support tickets, business inquiries, and platform feedback.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
            <tr>
              <th className="px-6 py-4">Ticket ID</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {MOCK_TICKETS.map((tkt) => (
              <tr key={tkt.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <td className="px-6 py-4 font-mono font-bold text-brand-600">{tkt.id}</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{tkt.company}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{tkt.subject}</td>
                <td className="px-6 py-4">
                  <Badge tone={tkt.priority === 'high' ? 'red' : tkt.priority === 'medium' ? 'amber' : 'gray'}>
                    {tkt.priority.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge tone={tkt.status === 'open' ? 'purple' : tkt.status === 'in-progress' ? 'blue' : 'green'}>
                    {tkt.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{tkt.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
