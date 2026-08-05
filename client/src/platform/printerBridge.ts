import { isElectron, isCapacitor } from './detectPlatform';

export interface PrintOptions {
  silent?: boolean;
  deviceName?: string;
  copies?: number;
}

export const printDocument = async (pdfUrlOrHtml: string, options: PrintOptions = {}) => {
  if (isElectron()) {
    // Send to Electron Main Process for native thermal / desktop printing
    const electron = (window as any).electronAPI;
    if (electron && typeof electron.print === 'function') {
      return await electron.print({ url: pdfUrlOrHtml, ...options });
    }
  }

  if (isCapacitor()) {
    // Use Capacitor Share plugin to open native Android print / share intent
    try {
      const capShare = (window as any).Capacitor?.Plugins?.Share;
      if (capShare) {
        await capShare.share({
          title: 'Invoice PDF',
          text: 'Sharing Invoice PDF document',
          url: pdfUrlOrHtml,
          dialogTitle: 'Share or Print Invoice',
        });
        return true;
      }
    } catch {
      // Fallback if plugin unavailable
    }
  }

  // Web PWA fallback using standard browser print dialog
  const printWindow = window.open(pdfUrlOrHtml, '_blank');
  if (printWindow) {
    printWindow.focus();
    printWindow.print();
  }
};
