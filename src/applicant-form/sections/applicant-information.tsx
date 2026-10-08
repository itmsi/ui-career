import { addYears, startOfToday } from 'date-fns'
import { Trans, useTranslation } from 'react-i18next'

import { FieldDescription, FieldGroup } from '@/components/ui/field'

import { DatePickerField } from '../components/date-picker-field'
import { DriverLicenseField, SelectField, TextField } from '../components/form-fields'
import {
  BLOOD_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
} from '../form-utils'

export function ApplicantInformationSection() {
  const { t } = useTranslation()
  const today = startOfToday()

  return (
    <FieldGroup>
      <FieldDescription>
        <Trans
          i18nKey="form.requiredLegend"
          components={{ mark: <span className="text-destructive" /> }}
        />
      </FieldDescription>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="fullName" label={t('fields.fullName')} required maxLength={150} />
        <TextField name="nickname" label={t('fields.nickname')} required maxLength={50} />
        <TextField name="addressIdCard" label={t('fields.addressIdCard')} required multiline />
        <TextField name="presentAddress" label={t('fields.presentAddress')} required multiline />
        <TextField
          name="mobile"
          label={t('fields.mobile')}
          type="tel"
          inputMode="tel"
          placeholder={t('placeholders.mobile')}
          required
        />
        <TextField
          name="emergencyContactInfo"
          label={t('fields.emergencyContactInfo')}
          placeholder={t('placeholders.emergencyContactInfo')}
          required
          multiline
        />
        <TextField name="birthPlace" label={t('fields.birthPlace')} required maxLength={100} />
        <DatePickerField
          name="birthDate"
          label={t('fields.birthDate')}
          required
          disabled={{ after: today }}
          startMonth={new Date(1940, 0)}
          endMonth={today}
        />
        <TextField
          name="email"
          label={t('fields.email')}
          type="email"
          inputMode="email"
          required
        />
        <SelectField
          name="bloodType"
          label={t('fields.bloodType')}
          options={BLOOD_TYPE_OPTIONS}
          placeholder={t('placeholders.bloodType')}
          required
        />
        <TextField
          name="idNumber"
          label={t('fields.idNumber')}
          inputMode="numeric"
          placeholder={t('placeholders.idNumber')}
          maxLength={16}
          required
        />
        <TextField name="positionApplied" label={t('fields.positionApplied')} required />
        <DatePickerField
          name="workingAvailableDate"
          label={t('fields.workingAvailableDate')}
          required
          disabled={{ before: today }}
          startMonth={today}
          endMonth={addYears(today, 2)}
        />
        <SelectField
          name="maritalStatus"
          label={t('fields.maritalStatus')}
          options={MARITAL_STATUS_OPTIONS}
          optionLabel={(option) =>
            t(`options.maritalStatus.${option as (typeof MARITAL_STATUS_OPTIONS)[number]}`)
          }
          placeholder={t('placeholders.maritalStatus')}
          required
        />
        <SelectField
          name="religion"
          label={t('fields.religion')}
          options={RELIGION_OPTIONS}
          optionLabel={(option) =>
            t(`options.religion.${option as (typeof RELIGION_OPTIONS)[number]}`)
          }
          placeholder={t('placeholders.religion')}
          required
        />
        <TextField
          name="heightWeight"
          label={t('fields.heightWeight')}
          placeholder={t('placeholders.heightWeight')}
          required
        />
        <TextField
          name="tshirtSize"
          label={t('fields.tshirtSize')}
          placeholder={t('placeholders.tshirtSize')}
          maxLength={10}
          required
        />
        <TextField
          name="taxId"
          label={t('fields.taxId')}
          inputMode="numeric"
          placeholder={t('placeholders.taxId')}
          maxLength={20}
        />
        <TextField name="city" label={t('fields.city')} />
        <DriverLicenseField className="sm:col-span-2" label={t('fields.driverLicense')} />
      </div>
    </FieldGroup>
  )
}
