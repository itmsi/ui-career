import { useState, type ReactNode } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { Matcher } from 'react-day-picker'
import { useController, type FieldPath } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Calendar } from '@/components/ui/calendar'
import { Field } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLanguage } from '@/i18n/use-language'
import { cn } from '@/lib/utils'

import { inputHeightClass } from '../form-utils'
import { FieldCaption, FormFieldError } from './form-fields'
import type { ApplicantFormValues } from '../types'

type CalendarBounds = {
  /** Days the applicant cannot pick. */
  disabled?: Matcher | Matcher[]
  /** First and last month reachable from the month/year dropdowns. */
  startMonth?: Date
  endMonth?: Date
}

export function DatePickerField({
  name,
  label,
  required,
  placeholder,
  className,
  id,
  ...bounds
}: {
  name: FieldPath<ApplicantFormValues>
  label?: ReactNode
  required?: boolean
  placeholder?: string
  className?: string
  id?: string
} & CalendarBounds) {
  const { t } = useTranslation()
  const { field, fieldState } = useController<ApplicantFormValues>({ name })
  const buttonId = id ?? name

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      {label && (
        <FieldCaption htmlFor={buttonId} required={required}>
          {label}
        </FieldCaption>
      )}
      <DatePickerButton
        id={buttonId}
        buttonRef={field.ref}
        placeholder={placeholder ?? t('common.datePlaceholder')}
        invalid={!!fieldState.error}
        value={typeof field.value === 'string' ? field.value : ''}
        onChange={(value) => {
          field.onChange(value)
          field.onBlur()
        }}
        {...bounds}
      />
      <FormFieldError error={fieldState.error} />
    </Field>
  )
}

function DatePickerButton({
  id,
  buttonRef,
  placeholder,
  invalid,
  value,
  onChange,
  disabled,
  startMonth,
  endMonth,
}: {
  id?: string
  buttonRef?: (element: HTMLButtonElement | null) => void
  placeholder: string
  invalid: boolean
  value: string
  onChange: (value: string) => void
} & CalendarBounds) {
  const [open, setOpen] = useState(false)
  const { calendarLocale } = useLanguage()

  const parsedValue = value ? parseISO(value) : undefined
  const selectedDate = parsedValue && isValid(parsedValue) ? parsedValue : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            id={id}
            ref={buttonRef}
            aria-invalid={invalid}
            className={cn(
              inputHeightClass,
              'flex w-full items-center justify-between gap-2 border border-input bg-white/70 px-2.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
              !selectedDate && 'text-muted-foreground',
              invalid && 'border-destructive',
            )}
          >
            <span>{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder}</span>
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={calendarLocale}
          captionLayout="dropdown"
          selected={selectedDate}
          defaultMonth={selectedDate}
          disabled={disabled}
          startMonth={startMonth}
          endMonth={endMonth}
          onSelect={(date) => {
            onChange(date ? format(date, 'yyyy-MM-dd') : '')
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
