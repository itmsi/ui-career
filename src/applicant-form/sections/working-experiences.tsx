import { startOfToday } from 'date-fns'
import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { DatePickerField } from '../components/date-picker-field'
import { EntryCard } from '../components/entry-card'
import { TextField } from '../components/form-fields'
import { WORK_EXPERIENCE_MIN } from '../form-utils'
import { emptyWorkExperienceRow, type ApplicantFormValues } from '../types'

export function WorkingExperiencesSection() {
  const { t } = useTranslation()
  const { control } = useFormContext<ApplicantFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'workExperience' })
  const today = startOfToday()

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        const required = index < WORK_EXPERIENCE_MIN
        return (
          <EntryCard
            key={field.id}
            index={index + 1}
            label={t('work.cardTitle', { number: index + 1 })}
            columns={3}
            required={required}
            onRemove={required ? undefined : () => remove(index)}
          >
            <TextField
              name={`workExperience.${index}.companyName`}
              label={t('fields.companyName')}
              required={required}
            />
            <DatePickerField
              name={`workExperience.${index}.dateFrom`}
              label={t('fields.dateFrom')}
              required={required}
              disabled={{ after: today }}
              startMonth={new Date(1970, 0)}
              endMonth={today}
            />
            <DatePickerField
              name={`workExperience.${index}.dateFinal`}
              label={t('fields.dateFinal')}
              disabled={{ after: today }}
              startMonth={new Date(1970, 0)}
              endMonth={today}
            />
            <TextField
              name={`workExperience.${index}.salary`}
              label={t('fields.salary')}
              inputMode="numeric"
            />
            <TextField
              name={`workExperience.${index}.supervisorName`}
              label={t('fields.supervisorName')}
            />
            <TextField
              name={`workExperience.${index}.reasonForLeaving`}
              label={t('fields.reasonForLeaving')}
              required={required}
            />
          </EntryCard>
        )
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ ...emptyWorkExperienceRow })}
        className="w-full border-dashed"
      >
        <Plus className="size-4" />
        {t('work.add')}
      </Button>
    </div>
  )
}
