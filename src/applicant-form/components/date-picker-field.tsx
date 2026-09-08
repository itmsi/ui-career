import { useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Controller, type Control, type FieldPath } from 'react-hook-form'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { inputHeightClass } from '../form-utils'
import type { ApplicantFormValues } from '../types'

export function DatePickerField({
  name,
  control,
  placeholder = 'Pilih tanggal',
  className,
  id,
}: {
  name: FieldPath<ApplicantFormValues>
  control: Control<ApplicantFormValues>
  placeholder?: string
  className?: string
  id?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DatePickerButton
          id={id}
          placeholder={placeholder}
          className={className}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={field.onChange}
        />
      )}
    />
  )
}

function DatePickerButton({
  id,
  placeholder,
  className,
  value,
  onChange,
}: {
  id?: string
  placeholder: string
  className?: string
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  const parsedValue = value ? parseISO(value) : undefined
  const selectedDate = parsedValue && isValid(parsedValue) ? parsedValue : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            id={id}
            className={cn(
              inputHeightClass,
              'flex w-full items-center justify-between gap-2 border border-input bg-transparent px-2.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
              !selectedDate && 'text-muted-foreground',
              className,
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
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={(date) => {
            onChange(date ? format(date, 'yyyy-MM-dd') : '')
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
