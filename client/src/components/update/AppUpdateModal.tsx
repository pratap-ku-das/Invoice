import { useEffect, useState } from 'react';
import { Sparkles, Download, X, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { CURRENT_APP_VERSION, compareVersions } from '@/config/version';
import { api } from '@/lib/api';

export interface AppUpdateInfo {
  latestVersion: string;
  downloadUrl: string;
  forceUpdate: boolean;
  message: string;
  whatsNew: string[];
  releaseDate?: string;
}

export function AppUpdateModal() {
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAppUpdate() {
      try {
        const res = await api.get<AppUpdateInfo>('/app-update/check');
        if (!isMounted || !res.data) return;

        const info = res.data;
        if (compareVersions(CURRENT_APP_VERSION, info.latestVersion) < 0) {
          const dismissedKey = `app_update_dismissed_v_${info.latestVersion}`;
          const isDismissed = localStorage.getItem(dismissedKey) === 'true';

          if (!isDismissed || info.forceUpdate) {
            setUpdateInfo(info);
            setShowModal(true);
          }
        }
      } catch (err) {
        // Silent catch if backend route is unavailable
      }
    }

    checkAppUpdate();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownload = () => {
    if (!updateInfo?.downloadUrl) return;
    setDownloading(true);
    
    // Open APK download URL in a new window/tab
    window.open(updateInfo.downloadUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setDownloading(false);
      if (!updateInfo.forceUpdate) {
        setShowModal(false);
      }
    }, 1500);
  };

  const handleDismiss = () => {
    if (updateInfo) {
      localStorage.setItem(`app_update_dismissed_v_${updateInfo.latestVersion}`, 'true');
    }
    setShowModal(false);
  };

  if (!showModal || !updateInfo) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-brand-500/30 bg-slate-900 shadow-2xl text-slate-100 dark:border-brand-500/40">
        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Modal Header */}
        <div className="relative p-6 sm:p-7 pb-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-brand-400" />
              <span>Update Available</span>
            </div>

            {!updateInfo.forceUpdate && (
              <button
                onClick={handleDismiss}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                aria-label="Close update modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-black text-white tracking-tight">
            BalajiOne Invoice Update
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {updateInfo.message || 'A new version of the app is available for download.'}
          </p>

          {/* Version badge comparison */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs font-medium">
            <div className="flex-1">
              <span className="block text-slate-400 text-[11px] uppercase tracking-wider">Current</span>
              <span className="text-sm font-bold text-slate-300">v{CURRENT_APP_VERSION}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-400" />
            <div className="flex-1">
              <span className="block text-brand-400 text-[11px] uppercase tracking-wider font-semibold">Latest Version</span>
              <span className="text-sm font-bold text-emerald-400">v{updateInfo.latestVersion}</span>
            </div>
          </div>
        </div>

        {/* What's New Section */}
        {updateInfo.whatsNew && updateInfo.whatsNew.length > 0 && (
          <div className="relative px-6 sm:px-7 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              What's New
            </h3>
            <ul className="space-y-2 rounded-2xl bg-slate-950/40 p-4 border border-slate-800/80">
              {updateInfo.whatsNew.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Security badge note */}
        <div className="px-6 sm:px-7 py-2 flex items-center gap-2 text-[12px] text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Verified APK • Self-hosted on official BalajiOne servers</span>
        </div>

        {/* Action Buttons */}
        <div className="relative p-6 sm:p-7 pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-indigo-700 active:scale-[0.98] transition disabled:opacity-75"
          >
            {downloading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Starting Download...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-white" />
                <span>Download Update</span>
              </>
            )}
          </button>

          {!updateInfo.forceUpdate && (
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
