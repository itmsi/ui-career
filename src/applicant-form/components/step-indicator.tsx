import { Fragment } from 'react'
import { Check, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: Array<{ title: string; icon: LucideIcon }>
  currentStep: number
  onStepClick: (index: number) => void
}) {
  return (
    <div className="flex w-full items-center overflow-x-auto p-1 sm:px-10 sm:pb-10">
      {steps.map((s, index) => {
        const isDone = index < currentStep
        const isCurrent = index === currentStep

        return (
          <Fragment key={s.title}>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className={cn(
                  'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-[10px] font-semibold transition-colors hover:opacity-80 sm:size-8 sm:text-xs',
                  isDone && 'bg-primary text-primary-foreground',
                  isCurrent &&
                    'bg-primary text-primary-foreground ring-2 ring-primary/20 sm:ring-4',
                  !isDone &&
                    !isCurrent &&
                    'border border-slate-400 bg-muted text-muted-foreground dark:border-slate-600',
                )}
              >
                {isDone ? <Check className="size-3 sm:size-4" /> : index + 1}
              </button>
              <span
                className={cn(
                  'absolute top-full left-1/2 mt-1.5 hidden w-20 -translate-x-1/2 text-center text-[10px] leading-tight text-muted-foreground sm:line-clamp-2',
                  isCurrent && 'font-medium text-foreground',
                )}
              >
                {s.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 min-w-2 flex-1 sm:min-w-4',
                  index < currentStep
                    ? 'bg-primary'
                    : 'bg-slate-400 dark:bg-slate-600',
                )}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
