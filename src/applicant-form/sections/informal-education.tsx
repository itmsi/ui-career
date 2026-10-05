import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { EntryCard } from '../components/entry-card'
import { TextField } from '../components/form-fields'
import { emptyInformalEducationRow, type ApplicantFormValues } from '../types'

export function InformalEducationSection() {
  const { t } = useTranslation()
  const { control } = useFormContext<ApplicantFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'informalEducation' })

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <EntryCard
          key={field.id}
          index={index + 1}
          label={t('informal.cardTitle', { number: index + 1 })}
          columns={5}
          onRemove={fields.length > 1 ? () => remove(index) : undefined}
        >
          <TextField
            name={`informalEducation.${index}.trainingName`}
            label={t('fields.trainingName')}
            className="justify-between"
          />
          <TextField
            name={`informalEducation.${index}.institutionName`}
            label={t('fields.institutionName')}
            className="justify-between"
          />
          <TextField
            name={`informalEducation.${index}.location`}
            label={t('fields.location')}
            className="justify-between"
          />
          <TextField
            name={`informalEducation.${index}.certification`}
            label={t('fields.certification')}
            className="justify-between"
          />
          <TextField
            name={`informalEducation.${index}.period`}
            label={t('fields.period')}
            className="justify-between"
          />
        </EntryCard>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ ...emptyInformalEducationRow })}
        className="w-full border-dashed"
      >
        <Plus className="size-4" />
        {t('informal.add')}
      </Button>
    </div>
  )
}
