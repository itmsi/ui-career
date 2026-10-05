import 'i18next'

import type { id } from './locales/id'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof id }
  }
}
