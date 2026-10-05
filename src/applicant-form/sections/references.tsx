import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'

import { EntryCard } from '../components/entry-card'
import { TextField } from '../components/form-fields'
import { REFERENCES_MIN } from '../form-utils'
import { emptyReferenceRow, type ApplicantFormValues } from '../types'

export function ReferencesSection() {
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
              label={`Referensi ${index + 1}`}
              columns={3}
              required={required}
              onRemove={required ? undefined : () => remove(index)}
            >
              <TextField
                name={`references.${index}.name`}
                label="Name/ Nama"
                required={required}
                className="justify-between"
              />
              <TextField
                name={`references.${index}.position`}
                label="Position Company/ Jabatan"
                required={required}
                className="justify-between"
              />
              <TextField
                name={`references.${index}.phone`}
                label="Phone / Telepon"
                type="tel"
                inputMode="tel"
                required={required}
                className="justify-between"
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
        Tambah Referensi
      </Button>
    </div>
  )
}
