import { loadConfig } from 'c12';

interface CookieConsentConfig {
  geoCookieMaxAge: number;
  consentMaxAge: number;
  configurableCategories: string[];
  requiredCountries: string[];
}

export interface AppConfig {
  cookieConsent: CookieConsentConfig;
}

let _config: AppConfig | null = null;

export async function getAppConfig(): Promise<AppConfig> {
  if (_config) return _config;
  const { config } = await loadConfig<AppConfig>({
    name: 'app',
    cwd: process.cwd(),
  });
  _config = config!;
  return _config!;
}

/** Synchronous cached access — call after first async load. */
export function getAppConfigSync(): AppConfig {
  if (!_config) throw new Error('Config not loaded — await getAppConfig() first');
  return _config;
}
