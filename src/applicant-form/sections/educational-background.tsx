import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FieldGroup } from '@/components/ui/field'

import { EntryCard } from '../components/entry-card'
import { SelectField, TextField } from '../components/form-fields'
import { LAST_EDUCATION_OPTIONS } from '../form-utils'
import type { ApplicantFormValues } from '../types'

type LastEducation = (typeof LAST_EDUCATION_OPTIONS)[number]

export function EducationalBackgroundSection() {
  const { t } = useTranslation()
  const lastEducation = useWatch<ApplicantFormValues, 'lastEducation'>({ name: 'lastEducation' })
  const educationLabel = (option: string) => t(`options.lastEducation.${option as LastEducation}`)

  return (
    <FieldGroup>
      <SelectField
        name="lastEducation"
        label={t('fields.lastEducation')}
        options={LAST_EDUCATION_OPTIONS}
        optionLabel={educationLabel}
        placeholder={t('placeholders.lastEducation')}
        required
        className="sm:max-w-xs"
      />

      {lastEducation && (
        <EntryCard
          index={1}
          label={t('education.cardTitle', { level: educationLabel(lastEducation) })}
          columns={5}
          required
        >
          <TextField name="education.schoolName" label={t('fields.schoolName')} required />
          <TextField name="education.location" label={t('fields.location')} required />
          <TextField name="education.graduate" label={t('fields.graduate')} required />
          <TextField name="education.major" label={t('fields.major')} required />
          <TextField
            name="education.graduationYear"
            label={t('fields.graduationYear')}
            inputMode="numeric"
            placeholder={t('placeholders.graduationYear')}
            maxLength={4}
            required
          />
        </EntryCard>
      )}
    </FieldGroup>
  )
}
