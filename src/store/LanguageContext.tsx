import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { resolveDeviceLanguage, translate, type AppLanguage } from '../i18n';

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const STORAGE_KEY = 'foomate.language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>(resolveDeviceLanguage());

  useEffect(() => {
    const loadLanguage = async () => {
      const savedValue = await AsyncStorage.getItem(STORAGE_KEY);

      if (
        savedValue === 'en' ||
        savedValue === 'zh' ||
        savedValue === 'zh-Hant' ||
        savedValue === 'th' ||
        savedValue === 'es'
      ) {
        setLanguageState(savedValue);
      }
    };

    void loadLanguage();
  }, []);

  const setLanguage = async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    return translate(language, key, vars);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
