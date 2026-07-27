import { useEffect, useState } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 86400000 * 3) {
      // Dismissed within last 3 days
      return;
    }

    if (iosDevice) {
      setShowBanner(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Floating PWA Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-slide-up">
        <div className="flex items-center gap-3.5 rounded-2xl border border-brand-500/30 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-xl dark:border-brand-500/40">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-md">
            <Smartphone className="h-6 w-6 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400">
              BalajiOne Enterprises App
            </h4>
            <p className="text-sm font-semibold text-slate-100 truncate">
              Install mobile app for quick billing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-500 active:scale-95 transition"
            >
              <Download className="h-4 w-4" />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-brand-400">Install on iPhone / iPad</h3>
              <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 pt-4 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 font-bold text-brand-400">1</span>
                Tap the <Share className="h-4 w-4 text-brand-400 inline mx-1" /> Share button in your Safari toolbar.
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 font-bold text-brand-400">2</span>
                Scroll down and select <strong className="text-white">"Add to Home Screen"</strong>.
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 font-bold text-brand-400">3</span>
                Tap <strong className="text-white">"Add"</strong> in the top right to complete installation.
              </p>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-6 w-full rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white hover:bg-brand-500 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
