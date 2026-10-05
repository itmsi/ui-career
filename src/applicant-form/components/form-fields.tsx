import type { HTMLAttributes, ReactNode } from 'react'
import { useController, type FieldPath } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { captionLabelClass, inputHeightClass } from '../form-utils'
import type { ApplicantFormValues } from '../types'

type FieldName = FieldPath<ApplicantFormValues>

export function FieldCaption({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <FieldLabel htmlFor={htmlFor} className={captionLabelClass}>
      <span>
        {children}
        {required && (
          <span aria-hidden className="ml-0.5 text-destructive">
            *
          </span>
        )}
      </span>
    </FieldLabel>
  )
}

export function TextField({
  name,
  label,
  required,
  multiline,
  type = 'text',
  inputMode,
  placeholder,
  maxLength,
  className,
}: {
  name: FieldName
  label: ReactNode
  required?: boolean
  multiline?: boolean
  type?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  placeholder?: string
  maxLength?: number
  className?: string
}) {
  const {
    field: { ref, ...field },
    fieldState,
  } = useController<ApplicantFormValues>({ name })
  const controlProps = {
    id: name,
    name: field.name,
    value: typeof field.value === 'string' ? field.value : '',
    onChange: field.onChange,
    onBlur: field.onBlur,
    ref,
    placeholder,
    maxLength,
    'aria-invalid': !!fieldState.error,
    'aria-required': required,
  }

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldCaption htmlFor={name} required={required}>
        {label}
      </FieldCaption>
      {multiline ? (
        <Textarea rows={2} className="rounded-lg" {...controlProps} />
      ) : (
        <Input type={type} inputMode={inputMode} className={inputHeightClass} {...controlProps} />
      )}
      <FieldError errors={[fieldState.error]} />
    </Field>
  )
}

export function SelectField({
  name,
  label,
  options,
  required,
  placeholder = 'Pilih',
  className,
}: {
  name: FieldName
  label: ReactNode
  options: readonly string[]
  required?: boolean
  placeholder?: string
  className?: string
}) {
  const {
    field: { ref, ...field },
    fieldState,
  } = useController<ApplicantFormValues>({ name })
  const value = typeof field.value === 'string' && field.value ? field.value : null

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldCaption htmlFor={name} required={required}>
        {label}
      </FieldCaption>
      <Select
        value={value}
        onValueChange={(next) => {
          field.onChange(next ?? '')
          field.onBlur()
        }}
      >
        <SelectTrigger
          id={name}
          ref={ref}
          aria-invalid={!!fieldState.error}
          aria-required={required}
          className={cn(inputHeightClass, 'w-full bg-white/70 data-[size=default]:h-10')}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={[fieldState.error]} />
    </Field>
  )
}
