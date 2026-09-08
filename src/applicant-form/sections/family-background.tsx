import { Field, FieldLabel } from '@/components/ui/field'

import { EntryCard } from '../components/entry-card'
import { EntryInput } from '../components/entry-input'
import { FAMILY_ROWS, captionLabelClass } from '../form-utils'
import type { RegisterFn } from '../types'

export function FamilyBackgroundSection({
  register,
}: {
  register: RegisterFn
}) {
  return (
    <div className="space-y-3">
      {FAMILY_ROWS.map((row, i) => (
        <EntryCard key={row.key} index={i + 1} label={row.label} columns={4}>
          <Field>
            <FieldLabel className={captionLabelClass}>Name/ Nama</FieldLabel>
            <EntryInput name={`family.${row.key}.name`} register={register} />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>Age/ Usia</FieldLabel>
            <EntryInput name={`family.${row.key}.age`} register={register} />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Employment/ Pekerjaan
            </FieldLabel>
            <EntryInput name={`family.${row.key}.employment`} register={register} />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Emergency Contact Number/ Kontak Darurat
            </FieldLabel>
            <EntryInput
              name={`family.${row.key}.emergencyContact`}
              register={register}
            />
          </Field>
        </EntryCard>
      ))}
    </div>
  )
}
