import { useQuery } from '@tanstack/react-query';
import { FileText, Building2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function PlatformAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data,
  });

  const docBreakdown: Array<{ _id: string; count: number; totalValue: number }> = analytics?.docBreakdown ?? [];
  const companyGrowth: Array<{ _id: string; count: number }> = analytics?.companyGrowth ?? [];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Platform Growth & System Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time database metrics for company onboarding growth, document volume distribution, and system usage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Real Company Growth Trajectory */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-brand-600" />
              <h3 className="font-bold text-lg">Company Registration Growth</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Total: {analytics?.totalCompanies ?? 0}</span>
          </div>

          {isLoading ? (
            <div className="h-40 flex items-center justify-center text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading growth data...
            </div>
          ) : companyGrowth.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-semibold">
              Live registration data active ({analytics?.totalCompanies ?? 0} total companies)
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {companyGrowth.map((cg) => (
                <div key={cg._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">{cg._id || 'Recent'}</span>
                    <span className="text-brand-600">{cg.count} Companies</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                    <div
                      className="bg-brand-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(15, (cg.count / (analytics?.totalCompanies || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Document Volume & Value Breakdown */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-lg">Live Document Breakdown</h3>
            </div>
            <span className="text-xs font-bold text-purple-600">{analytics?.totalDocuments ?? 0} Docs Total</span>
          </div>

          {isLoading ? (
            <div className="h-40 flex items-center justify-center text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-purple-600" /> Loading document metrics...
            </div>
          ) : docBreakdown.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-semibold">
              No documents created yet. Documents generated across tenants will aggregate here in real-time.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {docBreakdown.map((db) => (
                <div key={db._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize text-slate-700 dark:text-slate-200">{db._id}s</span>
                    <span className="text-slate-500">
                      {db.count} items ({formatCurrency(db.totalValue)})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, (db.count / (analytics?.totalDocuments || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
