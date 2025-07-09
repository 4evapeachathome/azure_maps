declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
    };
    dataLayer?: any[];
    gtag: (command: string, targetId: string, params?: any) => void;
  }
}

export {};