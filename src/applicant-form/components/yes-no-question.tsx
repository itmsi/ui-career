import { useController, type FieldPath } from 'react-hook-form'

import { FieldError } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

import type { ApplicantFormValues } from '../types'

export function YesNoQuestion({
  question,
  name,
  required,
}: {
  question: string
  name: FieldPath<ApplicantFormValues>
  required?: boolean
}) {
  const {
    field: { ref, ...field },
    fieldState,
  } = useController<ApplicantFormValues>({ name })

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-white/60 p-4 backdrop-blur-sm transition-colors hover:border-foreground/30',
        fieldState.error && 'border-destructive hover:border-destructive',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-sm leading-relaxed">
          {question}
          {required && (
            <span aria-hidden className="ml-0.5 text-destructive">
              *
            </span>
          )}
        </p>
        <RadioGroup
          ref={ref}
          value={typeof field.value === 'string' ? field.value : ''}
          onValueChange={(value) => {
            field.onChange(value)
            field.onBlur()
          }}
          aria-label={question}
          aria-invalid={!!fieldState.error}
          className="flex w-auto shrink-0 overflow-hidden rounded-full border border-border"
        >
          <label className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors has-data-checked:bg-primary has-data-checked:text-primary-foreground">
            <RadioGroupItem value="yes" className="sr-only" />
            Ya
          </label>
          <label className="flex cursor-pointer items-center gap-2 border-l border-border px-4 py-2 text-sm font-semibold transition-colors has-data-checked:bg-primary has-data-checked:text-primary-foreground">
            <RadioGroupItem value="no" className="sr-only" />
            Tidak
          </label>
        </RadioGroup>
      </div>
      <FieldError errors={[fieldState.error]} />
    </div>
  )
}
