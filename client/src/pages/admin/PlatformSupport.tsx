import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquare, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { Badge, Button } from '@/components/ui/primitives';

interface AdminTicket {
  _id: string;
  ticketId: string;
  companyName: string;
  createdByName: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  message: string;
  adminResponse?: string;
  createdAt: string;
}

export default function PlatformSupport() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [adminReply, setAdminReply] = useState('');

  const { data: tickets = [], isLoading, refetch } = useQuery<AdminTicket[]>({
    queryKey: ['support', 'admin-tickets'],
    queryFn: async () => (await api.get('/support/admin/tickets')).data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminResponse }: { id: string; status: string; adminResponse?: string }) => {
      return (await api.patch(`/support/admin/tickets/${id}/status`, { status, adminResponse })).data;
    },
    onSuccess: () => {
      toast.success('Ticket updated successfully!');
      setSelectedTicket(null);
      setAdminReply('');
      queryClient.invalidateQueries({ queryKey: ['support'] });
    },
    onError: (err) => {
      toast.error(apiError(err));
    },
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    updateStatusMutation.mutate({
      id: selectedTicket._id,
      status: selectedTicket.status === 'open' ? 'in-progress' : selectedTicket.status,
      adminResponse: adminReply.trim(),
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Support Tickets & Inquiries
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer support tickets submitted by registered companies across the platform.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2 text-xs py-1.5 px-3">
          <RefreshCw className="h-4 w-4" /> Refresh Tickets
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading platform support tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <MessageSquare className="mx-auto h-10 w-10 text-slate-400 mb-2" />
          <p className="font-bold">No Support Tickets Yet</p>
          <p className="text-xs">When registered companies submit support queries, they will appear here in real-time.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Subject & Message</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map((tkt) => (
                <tr key={tkt._id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono font-bold text-brand-600">{tkt.ticketId}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{tkt.companyName}</p>
                    <p className="text-xs text-slate-400">By: {tkt.createdByName}</p>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{tkt.subject}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{tkt.message}</p>
                    {tkt.adminResponse && (
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        ✓ Responded: {tkt.adminResponse}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={tkt.priority === 'high' ? 'red' : tkt.priority === 'medium' ? 'amber' : 'gray'}>
                      {tkt.priority.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={tkt.status}
                      onChange={(e) => handleUpdateStatus(tkt._id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold focus:outline-hidden dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="open">OPEN</option>
                      <option value="in-progress">IN-PROGRESS</option>
                      <option value="resolved">RESOLVED</option>
                      <option value="closed">CLOSED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {tkt.createdAt ? new Date(tkt.createdAt).toLocaleDateString('en-IN') : ''}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      className="text-xs px-2.5 py-1"
                      onClick={() => {
                        setSelectedTicket(tkt);
                        setAdminReply(tkt.adminResponse || '');
                      }}
                    >
                      Reply
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Respond to Ticket: {selectedTicket.ticketId}
                </h3>
                <p className="text-xs text-slate-500">From {selectedTicket.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50 space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">Subject: {selectedTicket.subject}</p>
              <p className="text-slate-600 dark:text-slate-400">{selectedTicket.message}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Super Admin Response
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter response or resolution instructions for the company..."
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-brand-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateStatusMutation.isPending} className="bg-brand-600 hover:bg-brand-700 text-white">
                  <Send className="mr-1.5 h-4 w-4" /> Submit Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
