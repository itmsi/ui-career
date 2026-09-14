import { cn } from '@/lib/utils'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

type NavMode = 'rail' | 'bar'

const controlButtonClass =
  'grid size-[30px] place-items-center rounded-[9px] border transition-colors'
const controlIdleClass =
  'border-sidebar-foreground/16 bg-transparent hover:border-sidebar-foreground/40'

function ControlIcon({ name }: { name: 'rail' | 'bar' | 'minus' | 'plus' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'rail' && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
        </>
      )}
      {name === 'bar' && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
        </>
      )}
      {name === 'minus' && <path d="M5 12h14" />}
      {name === 'plus' && <path d="M12 5v14M5 12h14" />}
    </svg>
  )
}

function NavControls({
  mode,
  collapsed,
  onModeChange,
  onToggleCollapse,
}: {
  mode: NavMode
  collapsed: boolean
  onModeChange: (mode: NavMode) => void
  onToggleCollapse: () => void
}) {
  // The bar rows are far shorter than the rail, so the shared `top-3.5` leaves the
  // buttons off-centre there — and overflowing a collapsed bar entirely.
  // Align each bar variant to its own text row instead:
  //   collapsed bar row = the whole 40.5px nav  -> centre it
  //   expanded bar row  = pt-6 (24) + half of the h-6 row (12) - half button (15) = 21
  const positionClass =
    mode === 'rail'
      ? collapsed
        ? 'inset-x-0 top-3.5 flex-col items-center'
        : 'top-3.5 right-4'
      : collapsed
        ? 'top-1/2 right-4 -translate-y-1/2'
        : 'top-[21px] right-4'

  return (
    <div className={cn('absolute z-10 flex gap-1.5', positionClass)}>
      <button
        type="button"
        title={mode === 'rail' ? 'Switch to horizontal indicator' : 'Switch to sidebar indicator'}
        onClick={() => onModeChange(mode === 'rail' ? 'bar' : 'rail')}
        className={cn(controlButtonClass, controlIdleClass)}
      >
        <ControlIcon name={mode} />
      </button>
      <button
        type="button"
        title={collapsed ? 'Expand indicator' : 'Minimise indicator'}
        onClick={onToggleCollapse}
        className={cn(controlButtonClass, controlIdleClass)}
      >
        <ControlIcon name={collapsed ? 'plus' : 'minus'} />
      </button>
    </div>
  )
}

export function FormNav({
  steps,
  currentStep,
  onStepClick,
  mode,
  collapsed,
  onModeChange,
  onToggleCollapse,
}: {
  steps: Array<{ title: string }>
  currentStep: number
  onStepClick: (index: number) => void
  mode: NavMode
  collapsed: boolean
  onModeChange: (mode: NavMode) => void
  onToggleCollapse: () => void
}) {
  const total = steps.length
  // The current step already counts as reached, so the last step reads 100% — matches
  // the mockup's `(step + 1) / total`. Using `currentStep / total` capped a 9-step form
  // at 89% and the final "Review & Ringkasan" step could never reach 100%.
  const pct = Math.round(((currentStep + 1) / total) * 100)
  // Derived from `pct` so the label can never disagree with the number shown: only the
  // final step (100%) reads as done, every earlier step is still being filled in.
  const progressLabel = pct === 100 ? 'complete' : 'On Progress'

  const controls = (
    <NavControls
      mode={mode}
      collapsed={collapsed}
      onModeChange={onModeChange}
      onToggleCollapse={onToggleCollapse}
    />
  )

  if (mode === 'rail' && collapsed) {
    return (
      <div className="relative flex w-full shrink-0 flex-col items-center gap-4 overflow-y-auto bg-sidebar px-3 pt-[106px] pb-6 text-sidebar-foreground transition-[width] duration-[220ms] ease-out lg:w-[84px]">
        {controls}
        <span className="text-[11px] font-semibold opacity-60">{pct}%</span>
        {steps.map((s, index) => (
          <button
            key={s.title}
            type="button"
            title={s.title}
            onClick={() => onStepClick(index)}
            className={cn(
              'flex size-[26px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors',
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
      <div className="relative flex w-full shrink-0 flex-col gap-7 overflow-y-auto bg-sidebar px-6 py-7 text-sidebar-foreground transition-[width] duration-[220ms] ease-out lg:w-[320px]">
        {controls}
        <div className="flex items-center gap-2.5 pr-[86px]">
          <img
            src="/motor-sights-international-logo-white.svg"
            alt="Motor Sights International"
            className="h-16 w-auto"
          />
        </div>

        <div>
          <div className="flex items-end gap-2.5">
            <span className="font-heading text-[58px] leading-[0.82] font-semibold">{pct}</span>
            <span className="pb-1.5 font-heading text-sm opacity-55">% {progressLabel}</span>
          </div>
          <div className="mt-4 flex gap-[3px]">
            {steps.map((s, index) => (
              <div
                key={s.title}
                className={cn(
                  'h-[3px] flex-1 rounded-full',
                  index <= currentStep ? 'bg-sidebar-foreground' : 'bg-sidebar-foreground/25',
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
                index === currentStep && 'rounded-2xl bg-sidebar-accent',
              )}
            >
              <span
                className={cn(
                  'flex size-[26px] items-center justify-center rounded-full border text-[11px] font-semibold',
                  index <= currentStep ? 'border-sidebar-foreground' : 'border-sidebar-foreground/35',
                  index > currentStep && 'opacity-50',
                )}
              >
                {pad(index + 1)}
              </span>
              <span
                className={cn(
                  'font-heading text-[14px] leading-tight font-semibold',
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
          <div className="text-[11px] font-semibold opacity-55">Draft autosaved</div>
          <div className="mt-1 text-[12px] leading-snug opacity-65">
            Tutup halaman ini dan lanjutkan nanti lewat tautan yang kami kirim ke email Anda.
          </div>
        </div>
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className="relative flex w-full shrink-0 items-center gap-4 bg-sidebar py-3 pl-6 pr-[86px] text-sidebar-foreground sm:pl-8">
        {controls}
        <span className="shrink-0 text-[11px] font-semibold opacity-75">
          {pad(currentStep + 1)} / {pad(total)} · {steps[currentStep]?.title}
        </span>
        <div className="flex flex-1 gap-[3px]">
          {steps.map((s, index) => (
            <div
              key={s.title}
              className={cn(
                'h-[3px] flex-1 rounded-full',
                index <= currentStep ? 'bg-sidebar-foreground' : 'bg-sidebar-foreground/25',
              )}
            />
          ))}
        </div>
        <span className="shrink-0 text-[11px] font-semibold opacity-55">{pct}%</span>
      </div>
    )
  }

  return (
    <div className="relative w-full shrink-0 bg-sidebar pt-6 pl-6 pr-[86px] text-sidebar-foreground sm:pl-8">
      {controls}
      <div className="flex flex-wrap items-top justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img
            src="/motor-sights-international-logo-white.svg"
            alt="Motor Sights International"
            className="h-auto w-20"
          />
        </div>
        <span className="text-[11px] font-semibold opacity-55 mt-1">
          {pct}% {progressLabel} · draft autosaved
        </span>
      </div>
      <div className="mt-5 flex gap-[2px] overflow-x-auto">
        {steps.map((s, index) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onStepClick(index)}
            className={cn(
              'min-w-[112px] flex-1 rounded-t-md border-t-2 px-3 pt-3 pb-4 text-left transition-colors',
              index <= currentStep ? 'border-t-sidebar-foreground' : 'border-t-sidebar-foreground/25',
            )}
          >
            <span className="text-[10px] font-semibold opacity-65">
              {pad(index + 1)} / {pad(total)}
            </span>
            <span
              className={cn(
                'mt-0.5 block font-heading text-[13px] leading-tight font-semibold',
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
