import type { FieldPath } from 'react-hook-form'

import { Input } from '@/components/ui/input'

import { inputHeightClass } from '../form-utils'
import type { ApplicantFormValues, RegisterFn } from '../types'

export function EntryInput({
  name,
  register,
  type = 'text',
  placeholder,
}: {
  name: FieldPath<ApplicantFormValues>
  register: RegisterFn
  type?: string
  placeholder?: string
}) {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      className={inputHeightClass}
      {...register(name)}
    />
  )
}
