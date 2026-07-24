import { TrendingUp, HardDrive } from 'lucide-react';

export default function PlatformAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Platform Growth & System Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time metrics for Monthly Recurring Revenue (MRR), company retention, API calls, and storage distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-lg">MRR Growth Trajectory</h3>
          </div>
          <div className="h-40 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 flex items-end justify-around p-4">
            <div className="w-8 bg-brand-200 h-16 rounded-t-md" />
            <div className="w-8 bg-brand-300 h-24 rounded-t-md" />
            <div className="w-8 bg-brand-400 h-28 rounded-t-md" />
            <div className="w-8 bg-brand-500 h-32 rounded-t-md" />
            <div className="w-8 bg-brand-600 h-36 rounded-t-md shadow-md" />
          </div>
          <p className="text-xs text-slate-500 text-center font-semibold">Steady +18.4% MRR growth over last 5 months</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-lg">System Resources & API Hit Rate</h3>
          </div>
          <div className="space-y-4 text-sm font-semibold">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Database Storage (MongoDB rs0)</span>
                <span>420 MB / 50 GB</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-800">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>API Calls Today</span>
                <span>14,890 requests</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-800">
                <div className="bg-brand-600 h-2 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
