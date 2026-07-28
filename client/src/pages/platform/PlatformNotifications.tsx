import { useState, useEffect } from 'react';
import { Send, Bell, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/layout/PageHeader';

export function PlatformNotifications() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<'transaction' | 'marketing' | 'reminder' | 'security' | 'update'>('transaction');
  const [targetType, setTargetType] = useState<'all' | 'company' | 'subscription' | 'role' | 'user'>('all');
  const [targetId, setTargetId] = useState('');
  const [actionUrl, setActionUrl] = useState('/app/dashboard');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/admin/logs');
      setLogs(res.data || []);
    } catch {
      toast.error('Failed loading notification logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter notification title and message body');
      return;
    }

    setSending(true);
    try {
      await api.post('/notifications/send-broadcast', {
        title,
        body,
        category,
        targetType,
        targetId: targetId.trim(),
        actionUrl,
      });

      toast.success('Push broadcast sent successfully!');
      setTitle('');
      setBody('');
      fetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed sending push broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="FCM Push Notification Center"
        subtitle="Broadcast targeted notifications & mobile alerts across Android, Desktop, and Web users"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Sender Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Send Push Broadcast</h2>
              <p className="text-xs text-slate-500">Target registered devices directly</p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notification Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Special Offer: 20% Off Pro Plan"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Message Body *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter notification message text..."
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="transaction">Transaction</option>
                  <option value="marketing">Marketing</option>
                  <option value="reminder">Reminder</option>
                  <option value="security">Security</option>
                  <option value="update">App Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Registered Devices</option>
                  <option value="company">Specific Company ID</option>
                  <option value="user">Specific User ID</option>
                </select>
              </div>
            </div>

            {targetType !== 'all' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target ID (Company / User ID)
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="Enter MongoDB ID"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Action Click URL
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/app/dashboard"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Send Broadcast Push</span>
            </button>
          </form>
        </div>

        {/* Delivery Logs & History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-brand-500" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Broadcast History & Metrics</h2>
            </div>
            <button
              onClick={fetchLogs}
              className="p-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">TITLE / MESSAGE</th>
                  <th className="pb-3">CATEGORY</th>
                  <th className="pb-3">TARGET</th>
                  <th className="pb-3 text-center">DELIVERED</th>
                  <th className="pb-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No broadcast notifications sent yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 pr-2">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{log.title}</div>
                        <div className="text-slate-500 line-clamp-1">{log.body}</div>
                      </td>
                      <td className="py-3">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3 capitalize text-slate-600 dark:text-slate-400">
                        {log.targetType}
                      </td>
                      <td className="py-3 text-center font-bold text-emerald-600">
                        {log.deliveredCount} / {log.sentCount}
                      </td>
                      <td className="py-3 text-right">
                        {log.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                            <AlertTriangle className="h-3.5 w-3.5" /> Partial
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
