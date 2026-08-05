import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText } from 'lucide-react';
import { MobileInvoiceCardM3 } from '../components/MobileInvoiceCardM3';

interface MobileInvoicesScreenProps {
  invoices?: Array<{
    _id: string;
    number: string;
    partyName: string;
    totalAmount: number;
    status: string;
    date: string;
    pdfUrl?: string;
  }>;
  loading?: boolean;
}

export function MobileInvoicesScreen({ invoices = [], loading }: MobileInvoicesScreenProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.partyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'paid' && inv.status?.toLowerCase() === 'paid') ||
      (activeFilter === 'unpaid' && inv.status?.toLowerCase() !== 'paid');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-slate-100">Sales Invoices</h1>
          <p className="text-xs text-slate-400">Total {invoices.length} billing records</p>
        </div>
        <button
          onClick={() => navigate('/app/documents/invoice/new')}
          className="flex items-center gap-1.5 rounded-2xl bg-brand-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md active:scale-95 transition"
        >
          <Plus className="h-4 w-4" /> Create Bill
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by invoice number or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Material 3 Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'unpaid', 'paid'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold capitalize transition-all ${
              activeFilter === filter
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-500">No invoices match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => (
            <MobileInvoiceCardM3 key={inv._id} invoice={inv} />
          ))}
        </div>
      )}
    </div>
  );
}
