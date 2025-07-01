export {}; // Make this file an external module

declare global {
  interface Window {
    gtag: (command: string, targetId: string, params?: any) => void;
  }
}