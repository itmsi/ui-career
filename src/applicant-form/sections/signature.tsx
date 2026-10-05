import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Field } from '@/components/ui/field'

import { DatePickerField } from '../components/date-picker-field'
import { FieldCaption } from '../components/form-fields'
import { SignaturePadField } from '../components/signature-pad-field'
import type { ApplicantFormValues } from '../types'

export function SignatureSection({ token }: { token: string }) {
  const { t } = useTranslation()
  const { control } = useFormContext<ApplicantFormValues>()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <Field className="sm:col-span-2">
        <FieldCaption htmlFor="applicantSignature">{t('fields.signature')}</FieldCaption>
        <SignaturePadField
          name="applicantSignature"
          linkName="signatureLink"
          dateName="signatureDate"
          control={control}
          token={token}
        />
      </Field>
      <DatePickerField name="signatureDate" label={t('fields.signatureDate')} />
    </div>
  )
}
