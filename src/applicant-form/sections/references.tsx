import { Plus } from 'lucide-react'
import type { FieldArrayWithId } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'

import { EntryCard } from '../components/entry-card'
import { EntryInput } from '../components/entry-input'
import { REFERENCES_MIN, captionLabelClass } from '../form-utils'
import type { ApplicantFormValues, RegisterFn } from '../types'

export function ReferencesSection({
  register,
  fields,
  onAppend,
  onRemove,
}: {
  register: RegisterFn
  fields: FieldArrayWithId<ApplicantFormValues, 'references', 'id'>[]
  onAppend: () => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field, index) => (
          <EntryCard
            key={field.id}
            index={index + 1}
            label={`Referensi ${index + 1}`}
            columns={3}
            onRemove={fields.length > REFERENCES_MIN ? () => onRemove(index) : undefined}
          >
            <Field className="justify-between">
              <FieldLabel className={captionLabelClass}>Name/ Nama</FieldLabel>
              <EntryInput name={`references.${index}.name`} register={register} />
            </Field>
            <Field className="justify-between">
              <FieldLabel className={captionLabelClass}>
                Position Company/ Jabatan
              </FieldLabel>
              <EntryInput name={`references.${index}.position`} register={register} />
            </Field>
            <Field className="justify-between">
              <FieldLabel className={captionLabelClass}>
                Phone / Telepon
              </FieldLabel>
              <EntryInput name={`references.${index}.phone`} register={register} />
            </Field>
          </EntryCard>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onAppend}
        className="w-full border-dashed"
      >
        <Plus className="size-4" />
        Tambah Referensi
      </Button>
    </div>
  )
}
