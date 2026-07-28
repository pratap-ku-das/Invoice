import { api } from '@/lib/api';

export const FIREBASE_VAPID_KEY =
  'BD02K4pHwG6v8vFpRDSOkRCpmeAoOCbAicOqWTW6-fNwnA_tH2nidZH2NG8igC74_c5pgDFqmjii0HfP9dirHGA';

export interface DevicePlatformInfo {
  platform: 'android' | 'windows' | 'web';
  isNative: boolean;
  userAgent: string;
}

export class NativeService {
  /** Detect Current Platform Environment */
  static getPlatform(): DevicePlatformInfo {
    if (typeof window === 'undefined') {
      return { platform: 'web', isNative: false, userAgent: '' };
    }

    const ua = navigator.userAgent || '';
    const isTauri = Boolean((window as any).__TAURI_IPC__ || (window as any).__TAURI__);
    const isCapacitor = Boolean((window as any).Capacitor?.isNativePlatform?.());
    const isAndroid = /android/i.test(ua) || isCapacitor;

    if (isTauri) return { platform: 'windows', isNative: true, userAgent: ua };
    if (isAndroid) return { platform: 'android', isNative: isCapacitor, userAgent: ua };

    return { platform: 'web', isNative: false, userAgent: ua };
  }

  /** Register FCM Push Token with Backend */
  static async registerDeviceToken(token: string): Promise<boolean> {
    try {
      const { platform } = this.getPlatform();
      await api.post('/devices/register', {
        platform,
        fcmToken: token,
        appVersion: '1.0.3',
        deviceModel: navigator.platform || 'Browser',
        osVersion: navigator.userAgent.slice(0, 50),
      });
      return true;
    } catch (err) {
      console.warn('Failed registering device token:', err);
      return false;
    }
  }

  /** Native Share Invoice File or URL */
  static async shareInvoice(data: { title: string; text?: string; url?: string; file?: File }): Promise<boolean> {
    try {
      if (navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
        return true;
      }
      if (data.url) {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${data.title}: ${data.url}`)}`, '_blank');
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Native share cancelled or failed:', err);
      return false;
    }
  }

  /** Native Trigger Print Dialog */
  static printIframe(iframeElement: HTMLIFrameElement): boolean {
    if (!iframeElement || !iframeElement.contentWindow) return false;
    try {
      iframeElement.contentWindow.focus();
      iframeElement.contentWindow.print();
      return true;
    } catch (err) {
      console.warn('Failed executing iframe print:', err);
      return false;
    }
  }
}
