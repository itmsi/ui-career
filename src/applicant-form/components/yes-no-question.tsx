import { Controller, type Control, type FieldPath } from 'react-hook-form'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import type { ApplicantFormValues } from '../types'

export function YesNoQuestion({
  question,
  name,
  control,
}: {
  question: string
  name: FieldPath<ApplicantFormValues>
  control: Control<ApplicantFormValues>
}) {
  return (
    <div className="flex flex-col gap-3 border border-border p-4 transition-colors hover:border-foreground/40 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="text-sm leading-relaxed">{question}</p>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup
            value={(field.value as string) || ''}
            onValueChange={field.onChange}
            className="flex w-auto shrink-0 border border-border"
          >
            <label className="flex cursor-pointer items-center gap-2 px-4 py-2 font-heading text-sm font-semibold tracking-wide uppercase transition-colors has-data-checked:bg-primary has-data-checked:text-primary-foreground">
              <RadioGroupItem value="yes" className="sr-only" />
              Ya
            </label>
            <label className="flex cursor-pointer items-center gap-2 border-l border-border px-4 py-2 font-heading text-sm font-semibold tracking-wide uppercase transition-colors has-data-checked:bg-primary has-data-checked:text-primary-foreground">
              <RadioGroupItem value="no" className="sr-only" />
              Tidak
            </label>
          </RadioGroup>
        )}
      />
    </div>
  )
}
