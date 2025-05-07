import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'peaceathome',
  webDir: 'www',
  plugins: {
    Geolocation: {
      enableHighAccuracy: true
    }
  }
};

export default config;
