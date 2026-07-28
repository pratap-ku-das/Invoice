import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.balajione.invoice',
  appName: 'BalajiOne Invoice',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['invoice.balajione.dev', '127.0.0.1', 'localhost'],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      showSpinner: true,
      spinnerColor: '#6366f1',
    },
  },
};

export default config;
