import { isElectron, isCapacitor } from './detectPlatform';

export interface AppNotification {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, any>;
}

export const sendLocalNotification = async (notification: AppNotification) => {
  if (isElectron()) {
    const electron = (window as any).electronAPI;
    if (electron && typeof electron.showNotification === 'function') {
      electron.showNotification(notification);
      return;
    }
  }

  if (isCapacitor()) {
    try {
      const capNotifications = (window as any).Capacitor?.Plugins?.LocalNotifications;
      if (capNotifications) {
        await capNotifications.schedule({
          notifications: [
            {
              title: notification.title,
              body: notification.body,
              id: Math.floor(Math.random() * 100000),
              schedule: { at: new Date(Date.now() + 500) },
            },
          ],
        });
        return;
      }
    } catch {
      // Fallback
    }
  }

  // Web Notification fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icons/pwa-192x192.png',
    });
  }
};
