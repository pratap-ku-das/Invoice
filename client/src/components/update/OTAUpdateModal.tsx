import { useState, useEffect } from 'react';
import { Sparkles, Download, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { checkOTAUpdate, applyOTABundle, reloadApp, OTACheckResult } from '@/platform/otaUpdateBridge';

export function OTAUpdateModal() {
  const [updateInfo, setUpdateInfo] = useState<OTACheckResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [readyToRestart, setReadyToRestart] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const runCheck = async () => {
      const res = await checkOTAUpdate();
      if (res.updateAvailable) {
        setUpdateInfo(res);
      }
    };
    runCheck();
  }, []);

  if (!updateInfo || !updateInfo.updateAvailable || dismissed) return null;

  const handleStartUpdate = async () => {
    if (!updateInfo.downloadUrl) return;
    setDownloading(true);
    setProgress(10);

    const success = await applyOTABundle(updateInfo.downloadUrl, (p) => setProgress(p));
    setDownloading(false);

    if (success) {
      setReadyToRestart(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center backdrop-blur-xs bg-slate-900/50">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {!updateInfo.forceUpdate && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 text-white shadow-md">
            <Sparkles className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <div className="inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 uppercase">
              Live OTA Update
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              v{updateInfo.latestVersion} Available
            </h2>
          </div>
        </div>

        {/* What's New List */}
        <div className="my-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40 text-xs space-y-2">
          <div className="font-extrabold text-slate-900 dark:text-slate-100">What's New:</div>
          <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
            {(updateInfo.whatsNew || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Download Progress Bar */}
        {downloading && (
          <div className="my-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Downloading Live Bundle...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5">
          {readyToRestart ? (
            <button
              onClick={reloadApp}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/30 active:scale-98 transition"
            >
              <RefreshCw className="h-4 w-4 animate-spin" /> Restart App Now
            </button>
          ) : (
            <button
              onClick={handleStartUpdate}
              disabled={downloading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-sm font-black text-white shadow-lg shadow-brand-600/30 active:scale-98 transition disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> {downloading ? 'Downloading...' : 'Update Now (OTA)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
