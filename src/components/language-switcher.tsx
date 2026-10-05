import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { SUPPORTED_LANGUAGES } from '@/i18n'
import { useLanguage } from '@/i18n/use-language'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { language, changeLanguage } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-border bg-white/70 p-0.5 dark:bg-input/30',
        className,
      )}
    >
      <Languages aria-hidden className="mx-1.5 size-3.5 text-muted-foreground" />
      {SUPPORTED_LANGUAGES.map(({ code, label }) => (
        <Button
          key={code}
          type="button"
          size="xs"
          variant={language === code ? 'default' : 'ghost'}
          aria-pressed={language === code}
          lang={code}
          onClick={() => void changeLanguage(code)}
          className="min-w-9 font-semibold"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
