import type { Locale } from 'react-day-picker'
import { enUS, id, zhCN } from 'react-day-picker/locale'
import type { ParseKeys } from 'i18next'
import { useTranslation } from 'react-i18next'

import type { LanguageCode } from './index'

/** Any key of the translation dictionary, e.g. `validation.emailRequired`. */
export type TranslationKey = ParseKeys

const CALENDAR_LOCALES: Record<LanguageCode, Locale> = { en: enUS, id, zh: zhCN }

/** The active language (always one of the supported codes) and its calendar locale. */
export function useLanguage() {
  const { i18n } = useTranslation()
  const language = (i18n.resolvedLanguage ?? 'id') as LanguageCode
  return {
    language,
    calendarLocale: CALENDAR_LOCALES[language] ?? id,
    changeLanguage: (code: LanguageCode) => i18n.changeLanguage(code),
  }
}
