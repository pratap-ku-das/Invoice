import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy, Send, PhoneCall, Mail, MessageSquare, HelpCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Input } from '@/components/ui/primitives';

interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  message: string;
  createdAt: string;
  adminResponse?: string;
}

const FAQS = [
  {
    q: 'How do I enable 58mm / 80mm thermal receipt printing?',
    a: 'Go to System Settings > Print Settings and select Paper Size as Thermal 58mm or 80mm, then enable Auto-Print & Thermal QR Code.',
  },
  {
    q: 'How can I add custom GSTIN tax rates to products?',
    a: 'Go to Catalog > Products, click New Product or Edit. You can set individual HSN codes and GST percentages (5%, 12%, 18%, 28%).',
  },
  {
    q: 'How do I upgrade my subscription plan or Razorpay payment method?',
    a: 'Go to System > Plan & Billing, select Basic or Pro Plan, and click Pay with Razorpay to activate instant plan limits.',
  },
  {
    q: 'Can I add multiple staff members to my company account?',
    a: 'Yes, go to System > Settings > Users & Staff to invite team members and assign specific roles (Sales, Accountant, Manager).',
  },
];

export default function CompanySupport() {
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Query');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [message, setMessage] = useState('');

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['support', 'my-tickets'],
    queryFn: async () => (await api.get('/support/my-tickets')).data,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (dto: { subject: string; category: string; priority: string; message: string }) => {
      return (await api.post('/support/tickets', dto)).data;
    },
    onSuccess: (data) => {
      toast.success(`🎉 Support ticket ${data.ticketId || ''} created successfully! Super Admin will review it.`);
      setSubject('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['support'] });
    },
    onError: (err) => {
      toast.error(apiError(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter a ticket subject and description');
      return;
    }
    createTicketMutation.mutate({
      subject: subject.trim(),
      category,
      priority,
      message: message.trim(),
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader
        title="Help & Customer Support"
        subtitle="Submit support tickets directly to Super Admin, access billing assistance, and get technical help"
      />

      {/* Support Quick Contact Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
            <PhoneCall className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">WhatsApp / Phone Support</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">+91 93485 32113</p>
            <p className="text-xs text-slate-500">Mon - Sat, 10:00 AM - 6:00 PM</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Assistance</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">support@balajione.dev</p>
            <p className="text-xs text-slate-500">Average response time: &lt; 2 hours</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">24/7 SLA Guarantee</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">Pro Priority Desk</p>
            <p className="text-xs text-slate-500">Dedicated technician support</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Create Support Ticket Form */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Create Support Ticket</h3>
              <p className="text-xs text-slate-500">Describe your query or issue and Super Admin will receive it live on their control panel.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Subject / Issue Summary *
              </label>
              <Input
                type="text"
                placeholder="e.g. Need assistance setting up barcode scanner prefix"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-brand-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="General Query">General Query</option>
                  <option value="GST & Billing">GST & Billing</option>
                  <option value="Print Settings">Print Settings / Thermal</option>
                  <option value="Barcode & Printers">Barcode & Printers</option>
                  <option value="Subscription & Payments">Subscription & Payments</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-brand-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority (Urgent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                placeholder="Provide steps or error details so we can solve your query quickly..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-brand-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <Button type="submit" loading={createTicketMutation.isPending} className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white">
              <Send className="mr-2 h-4 w-4" /> Send Ticket to Super Admin
            </Button>
          </form>
        </div>

        {/* Right Column: Submitted Tickets & FAQs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ticket History */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-600" /> My Recent Support Tickets
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No support tickets submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((tkt) => (
                  <div key={tkt._id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-600">{tkt.ticketId}</span>
                      <Badge tone={tkt.status === 'open' ? 'purple' : tkt.status === 'in-progress' ? 'blue' : 'green'}>
                        {tkt.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{tkt.subject}</p>
                    <p className="text-xs text-slate-500">{tkt.message}</p>
                    {tkt.adminResponse && (
                      <div className="mt-2 rounded-xl bg-brand-50/80 p-2.5 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/40">
                        <p className="text-[11px] font-bold text-brand-700 dark:text-brand-300">Super Admin Response:</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{tkt.adminResponse}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Category: {tkt.category}</span>
                      <span>{tkt.createdAt ? new Date(tkt.createdAt).toLocaleDateString('en-IN') : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-600" /> Frequently Asked Questions
            </h3>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 p-3.5 dark:border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" /> {faq.q}
                  </p>
                  <p className="text-xs text-slate-500 pl-5">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
