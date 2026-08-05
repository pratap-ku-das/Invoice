/**
 * Platform & Device Detection Helper
 * Unified detector for Web (PWA), Windows Desktop (Electron), and Android Mobile (Capacitor).
 */

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).electronAPI || (window as any).process?.versions?.electron);
};

export const isCapacitor = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.());
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return isCapacitor() || ua.includes('android');
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (isCapacitor()) return true;
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getPlatform = (): 'electron' | 'capacitor-android' | 'web-mobile' | 'web-desktop' => {
  if (isElectron()) return 'electron';
  if (isCapacitor()) return 'capacitor-android';
  if (isMobileDevice()) return 'web-mobile';
  return 'web-desktop';
};
