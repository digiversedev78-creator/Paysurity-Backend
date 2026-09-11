/**
 * ═══════════════════════════════════════════════════════════
 * Digital Wallet Global Configuration
 * ═══════════════════════════════════════════════════════════
 * Centralized configuration for the mobile application to 
 * ensure consistency across environments.
 */

import { Platform } from 'react-native';

// In a real production app, this would be injected via environment variables (e.g., react-native-config or Expo constants)
// For the 2026 staging environment, we target the deployed Cloud Run service.
export const CONFIG = {
  API_BASE: 'https://api.staging.paysurity.com',
  IS_STAGING: true,
  VERSION: '1.2.0-staging',
};

export default CONFIG;
