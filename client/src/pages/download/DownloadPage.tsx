import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Play,
  HelpCircle,
} from 'lucide-react';

export default function DownloadPage() {
  const [release, setRelease] = useState({
    version: '1.0.4',
    build: '104',
    size: '18.5 MB',
    date: 'August 5, 2026',
    minAndroid: 'Android 8.0 (Oreo) or higher',
    downloadUrl: '/downloads/BalajiOne-Invoice-v1.0.4.apk',
  });

  useEffect(() => {
    // Dynamic fetch from NestJS backend if available
    const backendBase = import.meta.env.VITE_API_URL || 'https://invoice-server.onrender.com/api';
    fetch(`${backendBase}/releases/latest?platform=android`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.version) {
          setRelease((prev) => ({
            ...prev,
            version: data.version,
            downloadUrl: data.downloadUrl || prev.downloadUrl,
            size: data.size || prev.size,
            date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : prev.date,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = release.downloadUrl;
    link.download = `BalajiOne-Invoice-v${release.version}.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 px-4 py-2 text-center text-xs font-bold text-white shadow-md">
        <span>🚀 Official Mobile Release: BalajiOne Android Native Billing Suite v{release.version}</span>
      </div>

      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition"
            >
              Web Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition shadow-lg shadow-brand-600/30"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Download Manager */}
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Download Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />

              {/* App Badge Header */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white p-1 shadow-lg border border-slate-700 flex items-center justify-center shrink-0">
                  <img src="/logos/app_logo.png?v=2.0" alt="BalajiOne App Icon" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">BalajiOne Invoice & ERP</h1>
                  <p className="text-xs font-semibold text-brand-400">Official Android Native APK Release</p>
                </div>
              </div>

              {/* Version Specifications Metadata Table */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-y border-slate-800 py-4 text-xs">
                <div>
                  <div className="text-slate-500 font-semibold">Latest Version</div>
                  <div className="font-extrabold text-white mt-0.5">v{release.version} ({release.build})</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold">File Size</div>
                  <div className="font-extrabold text-emerald-400 mt-0.5">{release.size}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold">Release Date</div>
                  <div className="font-extrabold text-white mt-0.5">{release.date}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold">OS Requirement</div>
                  <div className="font-extrabold text-slate-300 mt-0.5">{release.minAndroid}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold">License</div>
                  <div className="font-extrabold text-brand-400 mt-0.5">Free Business Edition</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold">Security Check</div>
                  <div className="font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Safe
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 px-6 py-4 text-base font-black text-white shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 hover:shadow-emerald-600/40 text-center"
                >
                  <Download className="h-5 w-5 animate-bounce" />
                  Download Direct APK (v{release.version})
                </button>

                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950/60 px-6 py-3.5 text-xs font-extrabold text-slate-500 cursor-not-allowed text-center"
                >
                  <Play className="h-4 w-4 text-slate-600" />
                  Google Play Store (Coming Soon)
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Direct APK Download • Safe SHA-256 Verified Binary • No Ads</span>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-brand-400" /> How to Install APK on Android:
              </h2>
              <ol className="mt-4 space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                <li>Tap <strong className="text-emerald-400">"Download Direct APK"</strong> above to save the file.</li>
                <li>Open your Android Notification panel or Files app and tap <strong className="text-white">BalajiOne-Invoice-v{release.version}.apk</strong>.</li>
                <li>If prompted, enable <strong className="text-amber-300">"Allow installation from unknown sources"</strong> in your browser/settings.</li>
                <li>Tap <strong className="text-brand-400">Install</strong> and launch your new native Android ERP application!</li>
              </ol>
            </div>
          </div>

          {/* Right Column: Feature Highlights & Release Notes */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" /> What's New in v{release.version}
              </h2>
              <ul className="mt-4 space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>True Native Material 3 UI</strong>: Built with React Native and smooth 60fps animations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Instant GST Invoices & Thermal Printing</strong>: Generate GST bills with UPI QR codes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Customer Quick Call & WhatsApp</strong>: 1-Tap calling (`tel:`) and PDF invoice sharing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Live Stock Movement Alerts</strong>: Instant low stock notifications and barcode scanner.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Offline Invoice Drafts</strong>: Work without internet; syncs automatically when online.</span>
                </li>
              </ul>
            </div>

            {/* Architecture Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shared Business Engine</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Connects directly to your existing NestJS cloud server, sharing the exact same JWT authentication, MongoDB databases, stock ledgers, and GST tax engines as your Desktop ERP.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
