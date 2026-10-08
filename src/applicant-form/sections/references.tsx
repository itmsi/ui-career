import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { EntryCard } from '../components/entry-card'
import { TextField } from '../components/form-fields'
import { REFERENCES_MIN } from '../form-utils'
import { emptyReferenceRow, type ApplicantFormValues } from '../types'

export function ReferencesSection() {
  const { t } = useTranslation()
  const { control } = useFormContext<ApplicantFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'references' })

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field, index) => {
          const required = index < REFERENCES_MIN
          return (
            <EntryCard
              key={field.id}
              index={index + 1}
              label={t('references.cardTitle', { number: index + 1 })}
              columns={3}
              required={required}
              onRemove={required ? undefined : () => remove(index)}
            >
              <TextField
                name={`references.${index}.name`}
                label={t('fields.name')}
                required={required}
              />
              <TextField
                name={`references.${index}.position`}
                label={t('fields.position')}
                required={required}
              />
              <TextField
                name={`references.${index}.phone`}
                label={t('fields.phone')}
                type="tel"
                inputMode="tel"
                required={required}
              />
            </EntryCard>
          )
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ ...emptyReferenceRow })}
        className="w-full border-dashed"
      >
        <Plus className="size-4" />
        {t('references.add')}
      </Button>
    </div>
  )
}
