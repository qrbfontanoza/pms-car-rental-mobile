import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'ph.pmsrentals.customer',
  appName: 'PMS Car Rental',
  webDir: 'www/browser',
  // Plugin bridge payloads can include authentication material. Keep native
  // logging disabled even in development builds and log only sanitized app events.
  loggingBehavior: 'none',
  server: { androidScheme: 'https' },
};
export default config;
