import { Controller, type Control, type FieldPath } from 'react-hook-form'

import { Label } from '@/components/ui/label'
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
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 transition-colors hover:border-border sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="text-sm">{question}</p>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup
            value={(field.value as string) || ''}
            onValueChange={field.onChange}
            className="grid w-auto grid-flow-col gap-4"
          >
            <Label className="flex items-center gap-1.5 text-sm">
              <RadioGroupItem value="yes" />
              Ya
            </Label>
            <Label className="flex items-center gap-1.5 text-sm">
              <RadioGroupItem value="no" />
              Tidak
            </Label>
          </RadioGroup>
        )}
      />
    </div>
  )
}
