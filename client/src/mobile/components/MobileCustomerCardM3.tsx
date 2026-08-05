import { Phone, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileCustomerCardM3Props {
  party: {
    _id: string;
    name: string;
    phone?: string;
    type?: string;
    gstin?: string;
    balance?: number;
  };
}

export function MobileCustomerCardM3({ party }: MobileCustomerCardM3Props) {
  const navigate = useNavigate();

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (party.phone) window.open(`tel:${party.phone}`, '_self');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (party.phone) {
      const cleanPhone = party.phone.replace(/[^0-9]/g, '');
      const text = encodeURIComponent(`Hello ${party.name}, greeting from our business!`);
      window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank');
    }
  };

  return (
    <div
      onClick={() => navigate(`/app/parties/${party._id}`)}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 active:scale-98 transition"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 font-black text-white text-base shadow-xs">
          {party.name ? party.name.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">{party.name}</h4>
          <div className="truncate text-xs text-slate-400 font-medium">{party.phone || 'No Phone Number'}</div>
          {party.gstin && (
            <div className="text-[10px] text-slate-400 font-mono">GST: {party.gstin}</div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Balance</div>
          <div className={`text-xs font-black ${(party.balance ?? 0) > 0 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
            ₹{Math.abs(party.balance ?? 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {party.phone && (
            <>
              <button
                onClick={handleCall}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300 active:scale-90"
                title="Call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 active:scale-90"
                title="WhatsApp Message"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            </>
          )}
          <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
