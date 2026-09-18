import type { Control } from 'react-hook-form'

import { Field, FieldLabel } from '@/components/ui/field'

import { DatePickerField } from '../components/date-picker-field'
import { SignaturePadField } from '../components/signature-pad-field'
import { captionLabelClass } from '../form-utils'
import type { ApplicantFormValues } from '../types'

export function SignatureSection({
  control,
  token,
}: {
  control: Control<ApplicantFormValues>
  token: string
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="applicantSignature" className={captionLabelClass}>
          Signature of Applicant/ Tanda tangan pelamar
        </FieldLabel>
        <SignaturePadField
          name="applicantSignature"
          linkName="signatureLink"
          dateName="signatureDate"
          control={control}
          token={token}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="signatureDate" className={captionLabelClass}>
          Signature Date /Tanggal Tanda Tangan  
        </FieldLabel>
        <DatePickerField id="signatureDate" name="signatureDate" control={control} />
      </Field>
    </div>
  )
}
