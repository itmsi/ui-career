import { Plus } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'

import { EntryCard } from '../components/entry-card'
import { SelectField, TextField } from '../components/form-fields'
import {
  LAST_EDUCATION_OPTIONS,
  educationHasDegree,
  educationHasMajor,
  educationLevelsFrom,
  isEducationLevelRequired,
  isOptionalEducationLevel,
  type EducationLevel,
  type OptionalEducationLevel,
} from '../form-utils'
import { emptyEducationRow, type ApplicantFormValues } from '../types'

export function EducationalBackgroundSection() {
  const { t } = useTranslation()
  const { setValue, clearErrors } = useFormContext<ApplicantFormValues>()
  const lastEducation = useWatch<ApplicantFormValues, 'lastEducation'>({ name: 'lastEducation' })
  const skipped = useWatch<ApplicantFormValues, 'educationSkipped'>({ name: 'educationSkipped' }) ?? []
  const levelLabel = (level: string) => t(`options.lastEducation.${level as EducationLevel}`)
  const levels = educationLevelsFrom(lastEducation)

  function removeLevel(level: OptionalEducationLevel) {
    setValue(`education.${level}`, { ...emptyEducationRow }, { shouldDirty: true })
    setValue('educationSkipped', [...skipped, level], { shouldDirty: true })
    clearErrors(`education.${level}`)
  }

  function restoreLevel(level: OptionalEducationLevel) {
    setValue(
      'educationSkipped',
      skipped.filter((item) => item !== level),
      { shouldDirty: true },
    )
  }

  return (
    <FieldGroup>
      <SelectField
        name="lastEducation"
        label={t('fields.lastEducation')}
        options={LAST_EDUCATION_OPTIONS}
        optionLabel={levelLabel}
        placeholder={t('placeholders.lastEducation')}
        required
        className="sm:max-w-xs"
      />

      {levels.length > 0 && (
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {t('education.historyHint')}
        </p>
      )}

      {levels.map((level, index) => {
        const required = isEducationLevelRequired(level, lastEducation)

        if (!required && isOptionalEducationLevel(level) && skipped.includes(level)) {
          return (
            <Button
              key={level}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => restoreLevel(level)}
              className="self-start"
            >
              <Plus className="size-4" />
              {t('education.addLevel', { level: levelLabel(level) })}
            </Button>
          )
        }

        const hasDegree = educationHasDegree(level)
        const hasMajor = educationHasMajor(level)

        return (
          <EntryCard
            key={level}
            index={index + 1}
            label={
              index === 0
                ? t('education.cardTitle', { level: levelLabel(level) })
                : t('education.historyTitle', { level: levelLabel(level) })
            }
            columns={hasDegree ? 5 : hasMajor ? 4 : 3}
            required={required}
            onRemove={
              !required && isOptionalEducationLevel(level) ? () => removeLevel(level) : undefined
            }
          >
            <TextField name={`education.${level}.schoolName`} label={t('fields.schoolName')} required={required} />
            <TextField name={`education.${level}.location`} label={t('fields.location')} required={required} />
            {hasDegree && (
              <TextField name={`education.${level}.graduate`} label={t('fields.graduate')} required={required} />
            )}
            {hasMajor && (
              <TextField
                name={`education.${level}.major`}
                label={t('fields.major')}
                required={required && hasDegree}
              />
            )}
            <TextField
              name={`education.${level}.graduationYear`}
              label={t('fields.graduationYear')}
              inputMode="numeric"
              placeholder={t('placeholders.graduationYear')}
              maxLength={4}
              required={required}
            />
          </EntryCard>
        )
      })}
    </FieldGroup>
  )
}
