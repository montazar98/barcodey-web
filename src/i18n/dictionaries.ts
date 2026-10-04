import 'server-only';

const dictionaries = {
  ar: () => import('./locales/ar.json').then((module) => module.default),
  en: () => import('./locales/en.json').then((module) => module.default),
  ru: () => import('./locales/ru.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'ar' | 'en' | 'ru') => dictionaries[locale]();
