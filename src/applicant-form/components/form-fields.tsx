import type { HTMLAttributes, ReactNode } from 'react'
import { useController, type FieldError as RhfFieldError, type FieldPath } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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
import type { TranslationKey } from '@/i18n/use-language'
import { cn } from '@/lib/utils'

import { captionLabelClass, inputHeightClass } from '../form-utils'
import type { ApplicantFormValues } from '../types'

type FieldName = FieldPath<ApplicantFormValues>

/**
 * Shows a field's validation error. Schema messages are translation keys, so they are
 * translated here and follow the active language.
 */
export function FormFieldError({ error }: { error?: Pick<RhfFieldError, 'message'> }) {
  const { t } = useTranslation()
  const message = error?.message ? t(error.message as TranslationKey) : undefined
  return <FieldError errors={[message ? { message } : undefined]} />
}

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
      <FormFieldError error={fieldState.error} />
    </Field>
  )
}

export function SelectField({
  name,
  label,
  options,
  optionLabel = (option) => option,
  required,
  placeholder,
  className,
}: {
  name: FieldName
  label: ReactNode
  /** Values stored in the form and sent to the backend. */
  options: readonly string[]
  /** Text shown for each value; defaults to the value itself. */
  optionLabel?: (option: string) => string
  required?: boolean
  placeholder?: string
  className?: string
}) {
  const { t } = useTranslation()
  const items = options.map((option) => ({ value: option, label: optionLabel(option) }))
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
        items={items}
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
          <SelectValue placeholder={placeholder ?? t('common.selectPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormFieldError error={fieldState.error} />
    </Field>
  )
}
