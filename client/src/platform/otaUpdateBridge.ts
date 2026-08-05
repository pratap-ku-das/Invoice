import { isCapacitor } from './detectPlatform';
import { api } from '@/lib/api';

export interface OTACheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl?: string;
  whatsNew?: string[];
  forceUpdate?: boolean;
}

export const checkOTAUpdate = async (): Promise<OTACheckResult> => {
  const currentVersion = '1.0.3';

  if (!isCapacitor()) {
    return { updateAvailable: false, currentVersion, latestVersion: currentVersion };
  }

  try {
    const res = await api.get('/releases/check?platform=android');
    const data = res.data;

    if (data && data.latestVersion && data.latestVersion !== currentVersion) {
      return {
        updateAvailable: true,
        currentVersion,
        latestVersion: data.latestVersion,
        downloadUrl: data.downloadUrl || data.apkUrl,
        whatsNew: data.whatsNew || ['Performance & Security Improvements', 'UI Enhancements'],
        forceUpdate: data.forceUpdate || false,
      };
    }
  } catch (err) {
    console.warn('OTA update check warning:', err);
  }

  return { updateAvailable: false, currentVersion, latestVersion: currentVersion };
};

export const applyOTABundle = async (
  downloadUrl: string,
  onProgress?: (progress: number) => void,
): Promise<boolean> => {
  if (!isCapacitor()) return false;

  try {
    // Check if Capgo Updater plugin is available dynamically
    const capUpdater = (window as any).Capacitor?.Plugins?.CapacitorUpdater;
    if (capUpdater && typeof capUpdater.download === 'function') {
      if (onProgress) onProgress(25);
      const version = await capUpdater.download({
        url: downloadUrl,
        version: Date.now().toString(),
      });

      if (onProgress) onProgress(75);
      if (version && typeof capUpdater.set === 'function') {
        await capUpdater.set(version);
        if (onProgress) onProgress(100);
        return true;
      }
    }
  } catch (err) {
    console.error('OTA Bundle Installation Failed:', err);
  }

  return false;
};

export const reloadApp = () => {
  if (typeof window !== 'undefined') {
    const capUpdater = (window as any).Capacitor?.Plugins?.CapacitorUpdater;
    if (capUpdater && typeof capUpdater.reload === 'function') {
      capUpdater.reload();
    } else {
      window.location.reload();
    }
  }
};
