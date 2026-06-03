import { translations, type AppLanguage } from './translations';

const fallbackLanguage: AppLanguage = 'en';

export function resolveDeviceLanguage(): AppLanguage {
  return fallbackLanguage;
}

export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) {
    return template;
  }

  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
    template,
  );
}

export function translate(
  language: AppLanguage,
  key: string,
  vars?: Record<string, string | number>,
) {
  const template = translations[language][key] ?? translations[fallbackLanguage][key] ?? key;
  return interpolate(template, vars);
}

export type { AppLanguage };
export { translations };
