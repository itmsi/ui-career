import { useFormContext } from 'react-hook-form'

import { Field } from '@/components/ui/field'

import { DatePickerField } from '../components/date-picker-field'
import { SignaturePadField } from '../components/signature-pad-field'
import { FieldCaption } from '../components/form-fields'
import type { ApplicantFormValues } from '../types'

export function SignatureSection({ token }: { token: string }) {
  const { control } = useFormContext<ApplicantFormValues>()
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <Field className="sm:col-span-2">
        <FieldCaption htmlFor="applicantSignature">
          Signature of Applicant/ Tanda tangan pelamar
        </FieldCaption>
        <SignaturePadField
          name="applicantSignature"
          linkName="signatureLink"
          dateName="signatureDate"
          control={control}
          token={token}
        />
      </Field>
      <DatePickerField name="signatureDate" label="Signature Date / Tanggal Tanda Tangan" />
    </div>
  )
}
