import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'turiscol.mobilapp',
  appName: 'turiscol-mobilapp',
  webDir: 'www',
  plugins: {
    CapacitorGoogleMaps: {
      apiKey: '', // Se pasa desde environment.ts en runtime para web
    },
  },
};

export default config;
