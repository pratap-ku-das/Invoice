import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users } from 'lucide-react';
import { MobileCustomerCardM3 } from '../components/MobileCustomerCardM3';

interface MobileCustomersScreenProps {
  parties?: Array<{
    _id: string;
    name: string;
    phone?: string;
    type?: string;
    gstin?: string;
    balance?: number;
  }>;
  loading?: boolean;
}

export function MobileCustomersScreen({ parties = [], loading }: MobileCustomersScreenProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'supplier'>('customer');

  const filteredParties = parties.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm);
    const matchesType =
      activeTab === 'all' || p.type?.toLowerCase() === activeTab;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-slate-100">Parties & Clients</h1>
          <p className="text-xs text-slate-400">Directory of customers and suppliers</p>
        </div>
        <button
          onClick={() => navigate('/app/parties/new?type=customer')}
          className="flex items-center gap-1.5 rounded-2xl bg-brand-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md active:scale-95 transition"
        >
          <UserPlus className="h-4 w-4" /> Add Party
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['customer', 'supplier', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold capitalize transition-all ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {tab}s
          </button>
        ))}
      </div>

      {/* Party List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading directory...</div>
      ) : filteredParties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-500">No parties match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredParties.map((p) => (
            <MobileCustomerCardM3 key={p._id} party={p} />
          ))}
        </div>
      )}
    </div>
  );
}
