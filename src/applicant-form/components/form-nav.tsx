import { cn } from '@/lib/utils'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function FormNav({
  steps,
  currentStep,
  onStepClick,
  mode,
  collapsed,
}: {
  steps: Array<{ title: string }>
  currentStep: number
  onStepClick: (index: number) => void
  mode: 'rail' | 'bar'
  collapsed: boolean
}) {
  const total = steps.length
  // currentStep itself isn't finished yet — only the steps before it are complete.
  const pct = Math.round((currentStep / total) * 100)

  if (mode === 'rail' && collapsed) {
    return (
      <div className="flex w-full shrink-0 flex-col items-center gap-4 bg-sidebar px-3 py-6 text-sidebar-foreground lg:w-[84px]">
        <span className="font-mono text-[11px] tracking-[0.08em] opacity-60">{pct}%</span>
        {steps.map((s, index) => (
          <button
            key={s.title}
            type="button"
            title={s.title}
            onClick={() => onStepClick(index)}
            className={cn(
              'flex size-[26px] shrink-0 items-center justify-center border font-mono text-[11px] transition-colors',
              index <= currentStep ? 'border-sidebar-foreground' : 'border-sidebar-foreground/35',
              index === currentStep && 'bg-sidebar-accent',
            )}
          >
            {pad(index + 1)}
          </button>
        ))}
      </div>
    )
  }

  if (mode === 'rail') {
    return (
      <div className="flex w-full shrink-0 flex-col gap-7 bg-sidebar px-6 py-7 text-sidebar-foreground lg:w-[320px]">
        <div className="flex items-center gap-2.5">
          <img
            src="/motor-sights-international-logo-white.svg"
            alt="Motor Sights International"
            className="h-7 w-auto"
          />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase opacity-55">Careers</span>
        </div>

        <div>
          <div className="flex items-end gap-2.5">
            <span className="font-heading text-[58px] leading-[0.82] font-semibold">{pct}</span>
            <span className="pb-1.5 font-heading text-sm tracking-[0.06em] uppercase opacity-55">
              % complete
            </span>
          </div>
          <div className="mt-4 flex gap-[3px]">
            {steps.map((s, index) => (
              <div
                key={s.title}
                className={cn(
                  'h-[2px] flex-1',
                  index < currentStep ? 'bg-sidebar-foreground' : 'bg-sidebar-foreground/25',
                )}
              />
            ))}
          </div>
        </div>

        <div className="grid">
          {steps.map((s, index) => (
            <button
              key={s.title}
              type="button"
              onClick={() => onStepClick(index)}
              className={cn(
                'grid grid-cols-[30px_1fr] items-center gap-3 border-t border-sidebar-foreground/15 px-6 py-3 -mx-6 text-left transition-colors',
                index === currentStep && 'bg-sidebar-accent',
              )}
            >
              <span
                className={cn(
                  'flex size-[26px] items-center justify-center border font-mono text-[11px]',
                  index <= currentStep ? 'border-sidebar-foreground' : 'border-sidebar-foreground/35',
                  index > currentStep && 'opacity-50',
                )}
              >
                {pad(index + 1)}
              </span>
              <span
                className={cn(
                  'font-heading text-[14px] leading-tight font-semibold tracking-wide uppercase',
                  index === currentStep
                    ? 'opacity-100'
                    : index < currentStep
                      ? 'opacity-65'
                      : 'opacity-40',
                )}
              >
                {s.title}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-sidebar-foreground/15 pt-3.5">
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase opacity-55">
            Draft autosaved
          </div>
          <div className="mt-1 text-[12px] leading-snug opacity-65">
            Tutup halaman ini dan lanjutkan nanti lewat tautan yang kami kirim ke email Anda.
          </div>
        </div>
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className="flex w-full items-center gap-4 bg-sidebar px-6 py-3 text-sidebar-foreground sm:px-8">
        <span className="shrink-0 font-mono text-[11px] tracking-[0.06em] uppercase opacity-75">
          {pad(currentStep + 1)} / {pad(total)} · {steps[currentStep]?.title}
        </span>
        <div className="flex flex-1 gap-[3px]">
          {steps.map((s, index) => (
            <div
              key={s.title}
              className={cn(
                'h-[3px] flex-1',
                index < currentStep ? 'bg-sidebar-foreground' : 'bg-sidebar-foreground/25',
              )}
            />
          ))}
        </div>
        <span className="shrink-0 font-mono text-[11px] opacity-55">{pct}%</span>
      </div>
    )
  }

  return (
    <div className="w-full bg-sidebar px-6 pt-6 text-sidebar-foreground sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src="/motor-sights-international-logo-white.svg"
            alt="Motor Sights International"
            className="h-6 w-auto"
          />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase opacity-55">Careers</span>
        </div>
        <span className="font-mono text-[11px] tracking-[0.08em] uppercase opacity-55">
          {pct}% complete · draft autosaved
        </span>
      </div>
      <div className="mt-5 flex gap-[2px] overflow-x-auto">
        {steps.map((s, index) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onStepClick(index)}
            className={cn(
              'min-w-[112px] flex-1 border-t-2 px-3 pt-3 pb-4 text-left transition-colors',
              index <= currentStep ? 'border-t-sidebar-foreground' : 'border-t-sidebar-foreground/25',
            )}
          >
            <span className="font-mono text-[10px] opacity-65">
              {pad(index + 1)} / {pad(total)}
            </span>
            <span
              className={cn(
                'mt-0.5 block font-heading text-[13px] leading-tight font-semibold tracking-wide uppercase',
                index === currentStep
                  ? 'opacity-100'
                  : index < currentStep
                    ? 'opacity-65'
                    : 'opacity-55',
              )}
            >
              {s.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
