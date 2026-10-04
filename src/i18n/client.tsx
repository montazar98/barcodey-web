'use client';

import { createContext, useContext, ReactNode } from 'react';

type Dictionary = Record<string, any>; // We can type this strictly later if needed

const I18nContext = createContext<Dictionary>({});

export function I18nProvider({ children, dict }: { children: ReactNode; dict: Dictionary }) {
  return (
    <I18nContext.Provider value={dict}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const dict = useContext(I18nContext);
  if (!dict) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return dict;
}

export function useLocale() {
  // A simple hook to get the current locale from the window pathname on the client
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const locale = path.split('/')[1];
    if (['ar', 'en', 'ru'].includes(locale)) return locale as 'ar' | 'en' | 'ru';
  }
  return 'ar';
}
