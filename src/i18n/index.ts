import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { en } from './locales/en'
import { id } from './locales/id'
import { zh } from './locales/zh'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'id', label: 'ID' },
  { code: 'zh', label: '中文' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

export const LANGUAGE_STORAGE_KEY = 'career-ui:language'

export const resources = {
  id: { translation: id },
  en: { translation: en },
  zh: { translation: zh },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id',
    supportedLngs: SUPPORTED_LANGUAGES.map(({ code }) => code),
    // Browser codes like `zh-CN` or `en-US` resolve to `zh` / `en`.
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : language
}

syncDocumentLanguage(i18n.resolvedLanguage ?? 'id')
i18n.on('languageChanged', syncDocumentLanguage)

export default i18n
