import { useState } from 'react'
import {
  Camera,
  Languages,
  ListOrdered,
  Lock,
  Mic,
  RotateCcw,
  ScanFace,
  Timer,
  TriangleAlert,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { useFormatDuration } from '../hooks/use-format-duration'

type InfoItem = { icon: LucideIcon; text: string }

export function IntroScreen({
  fullName,
  totalQuestions,
  prepSeconds,
  maxSeconds,
  onContinue,
}: {
  fullName: string
  totalQuestions: number
  prepSeconds: number
  maxSeconds: number
  onContinue: () => void
}) {
  const { t } = useTranslation()
  const formatDuration = useFormatDuration()
  const [consented, setConsented] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const facts = [
    { value: String(totalQuestions), label: t('videoInterview.intro.factQuestions') },
    { value: formatDuration(maxSeconds), label: t('videoInterview.intro.factAnswer') },
  ]

  const preparations = [
    { icon: ScanFace, title: t('videoInterview.intro.readyTitle'), text: t('videoInterview.intro.ready') },
    { icon: Wifi, title: t('videoInterview.intro.connectionTitle'), text: t('videoInterview.intro.connection') },
    { icon: Camera, title: t('videoInterview.intro.deviceTitle'), text: t('videoInterview.intro.device') },
  ]

  const rules: InfoItem[] = [
    { icon: ListOrdered, text: t('videoInterview.intro.ruleQuestions', { count: totalQuestions }) },
    {
      icon: Timer,
      text: t('videoInterview.intro.ruleTime', {
        prep: formatDuration(prepSeconds),
        max: formatDuration(maxSeconds),
      }),
    },
    { icon: RotateCcw, text: t('videoInterview.intro.ruleRerecord') },
    { icon: Lock, text: t('videoInterview.intro.ruleNoBack') },
    { icon: Mic, text: t('videoInterview.intro.ruleClarity') },
    { icon: Languages, text: t('videoInterview.intro.ruleLanguage') },
  ]

  const confirmItems = [
    { icon: Lock, text: t('videoInterview.intro.confirmNoBack'), emphasis: true },
    { icon: Timer, text: t('videoInterview.intro.confirmTime', { max: formatDuration(maxSeconds) }), emphasis: false },
    { icon: Camera, text: t('videoInterview.intro.confirmDevice'), emphasis: false },
  ]

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-primary">
        {t('videoInterview.intro.greeting', { name: fullName })}
      </p>
      <p className="mb-5 max-w-[58ch] text-[13px] leading-relaxed text-muted-foreground">
        {t('videoInterview.intro.description')}
      </p>

      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map(({  value, label }) => (
          <div key={label} className="rounded-xl border border-border bg-white/60 p-3">
            <p className="font-heading text-xl leading-tight font-semibold">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <section className="mb-6">
        <h2 className="mb-3 font-heading text-sm font-semibold">
          {t('videoInterview.intro.prepareTitle')}
        </h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {preparations.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-white/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon aria-hidden className="size-4" />
                </span>
                <p className="font-heading text-sm font-semibold">{title}</p>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-heading text-sm font-semibold">
          {t('videoInterview.intro.rulesTitle')}
        </h2>
        <ul className="space-y-2.5">
          {rules.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 text-sm text-foreground">
              <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <div
        role="note"
        className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4"
      >
        <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-destructive">
            {t('videoInterview.intro.lockedTitle')}
          </p>
          <p className="text-sm text-foreground">{t('videoInterview.intro.lockedWarning')}</p>
        </div>
      </div>

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
        <Button type="button" size="lg" onClick={() => setConfirmOpen(true)} disabled={!consented}>
          {t('videoInterview.intro.continue')}
        </Button>
        {!consented && (
          <span className="text-xs text-muted-foreground">
            {t('videoInterview.intro.consentRequired')}
          </span>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('videoInterview.intro.confirmTitle')}</DialogTitle>
            <DialogDescription>{t('videoInterview.intro.confirmDescription')}</DialogDescription>
          </DialogHeader>

          <ul className="space-y-2.5">
            {confirmItems.map(({ icon: Icon, text, emphasis }) => (
              <li
                key={text}
                className={cn(
                  'flex items-start gap-2.5 text-sm',
                  emphasis ? 'font-semibold text-destructive' : 'text-foreground',
                )}
              >
                <Icon
                  aria-hidden
                  className={cn('mt-0.5 size-4 shrink-0', emphasis ? 'text-destructive' : 'text-primary')}
                />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <DialogFooter>
            <DialogClose type="button" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              {t('videoInterview.intro.confirmCancel')}
            </DialogClose>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setConfirmOpen(false)
                onContinue()
              }}
            >
              {t('videoInterview.intro.confirmStart')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
