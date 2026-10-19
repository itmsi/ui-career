import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'

export function StatusScreen({
  icon: Icon,
  tone = 'neutral',
  spinning,
  title,
  description,
  hint,
  action,
}: {
  icon: LucideIcon
  tone?: 'neutral' | 'error'
  spinning?: boolean
  title: string
  description: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex h-svh flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <img
          src="/motor-sights-international-logo.png"
          alt="Motor Sights International"
          className="h-9 w-auto"
        />
        <LanguageSwitcher />
      </header>

      <main className="flex flex-1 items-center justify-center overflow-y-auto px-4 pb-16 sm:px-6">
        <div
          role={tone === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
        >
          <span
            className={cn(
              'mx-auto mb-5 flex size-14 items-center justify-center rounded-full',
              tone === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
            )}
          >
            <Icon aria-hidden className={cn('size-7', spinning && 'animate-spin')} />
          </span>

          <h1 className="font-heading text-2xl leading-tight font-semibold sm:text-[28px]">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

          {hint ? (
            <p className="mt-5 rounded-xl bg-muted/60 px-4 py-3 text-[13px] leading-relaxed text-foreground/80">
              {hint}
            </p>
          ) : null}

          {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
        </div>
      </main>
    </div>
  )
}
