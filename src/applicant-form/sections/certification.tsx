import type { Control } from 'react-hook-form'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { DatePickerField } from '../components/date-picker-field'
import { captionLabelClass, inputHeightClass } from '../form-utils'
import type { ApplicantFormValues, RegisterFn } from '../types'

export function CertificationSection({
  register,
  control,
}: {
  register: RegisterFn
  control: Control<ApplicantFormValues>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="applicantSignature" className={captionLabelClass}>
          Signature of Applicant/ Tanda tangan pelamar
        </FieldLabel>
        <Input
          id="applicantSignature"
          placeholder="Ketik nama lengkap sebagai tanda tangan"
          className={inputHeightClass}
          {...register('applicantSignature')}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="signatureDate" className={captionLabelClass}>
          Date /Tanggal
        </FieldLabel>
        <DatePickerField id="signatureDate" name="signatureDate" control={control} />
      </Field>
    </div>
  )
}
