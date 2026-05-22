import en from './locales/en.json';
import it from './locales/it.json';
import type { LanguageCode } from '../types';

export type LocaleDictionary = typeof it;
export type LocaleLanguage = {
  code: LanguageCode;
  label: string;
  flag: string;
  locale: string;
};

export const translations: Record<LanguageCode, LocaleDictionary> = {
  it,
  en,
};

export const SUPPORTED_LANGUAGES: LocaleLanguage[] = [
  it.language as LocaleLanguage,
  en.language as LocaleLanguage,
];

export const getDictionary = (language: LanguageCode): LocaleDictionary => {
  return translations[language] ?? translations.it;
};

export const formatMessage = (
  template: string,
  values: Record<string, string | number>,
): string => {
  return Object.entries(values).reduce((message, [key, value]) => {
    return message.split(`{${key}}`).join(String(value));
  }, template);
};

export const getNavigationLabel = (nodeId: string, dictionary: LocaleDictionary): string => {
  switch (nodeId) {
    case 'home':
      return dictionary.common.home;
    case 'settings':
      return dictionary.common.settings;
    case 'saved':
      return dictionary.common.saved;
    case 'feeds':
      return dictionary.common.manageFeeds;
    case 'language':
      return dictionary.common.language;
    case 'privacy':
      return dictionary.common.privacy;
    case 'cookies':
      return dictionary.common.cookies;
    default:
      return nodeId;
  }
};
