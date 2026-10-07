import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export function IntroScreen({
  fullName,
  totalQuestions,
  onContinue,
}: {
  fullName: string
  totalQuestions: number
  onContinue: () => void
}) {
  const { t } = useTranslation()
  const [consented, setConsented] = useState(false)

  const rules = [
    t('videoInterview.intro.ruleQuestions', { count: totalQuestions }),
    t('videoInterview.intro.ruleTime'),
    t('videoInterview.intro.ruleRerecord'),
    t('videoInterview.intro.ruleNoBack'),
    t('videoInterview.intro.ruleLocked'),
    t('videoInterview.intro.ruleLanguage'),
  ]

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-primary">
        {t('videoInterview.intro.greeting', { name: fullName })}
      </p>
      <p className="mb-5 max-w-[58ch] text-[13px] leading-relaxed text-muted-foreground">
        {t('videoInterview.intro.description')}
      </p>

      <ul className="mb-8 ml-4 list-disc space-y-2 text-sm text-foreground">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>

      <section className="mb-6 rounded-xl border border-border bg-white/60 p-4">
        <h2 className="mb-2 font-heading text-sm font-semibold">
          {t('videoInterview.intro.consentTitle')}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">{t('videoInterview.intro.consent')}</p>
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="interview-consent"
            checked={consented}
            onCheckedChange={(checked) => setConsented(checked)}
            className="mt-0.5"
          />
          <label htmlFor="interview-consent" className="text-sm font-medium">
            {t('videoInterview.intro.consentLabel')}
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="lg" onClick={onContinue} disabled={!consented}>
          {t('videoInterview.intro.continue')}
        </Button>
        {!consented && (
          <span className="text-xs text-muted-foreground">
            {t('videoInterview.intro.consentRequired')}
          </span>
        )}
      </div>
    </div>
  )
}
