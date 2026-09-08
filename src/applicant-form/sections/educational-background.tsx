import { Field, FieldLabel } from '@/components/ui/field'

import { EntryCard } from '../components/entry-card'
import { EntryInput } from '../components/entry-input'
import { EDUCATION_ROWS, captionLabelClass } from '../form-utils'
import type { RegisterFn } from '../types'

export function EducationalBackgroundSection({
  register,
}: {
  register: RegisterFn
}) {
  return (
    <div className="space-y-3">
      {EDUCATION_ROWS.map((row, i) => (
        <EntryCard key={row.key} index={i + 1} label={row.label} columns={5}>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Name of School/ Nama Institusi
            </FieldLabel>
            <EntryInput name={`education.${row.key}.schoolName`} register={register} />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>Location/ Lokasi</FieldLabel>
            <EntryInput name={`education.${row.key}.location`} register={register} />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Graduate/ Gelar Kelulusan
            </FieldLabel>
            <EntryInput name={`education.${row.key}.graduate`} register={register} />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>Major / Jurusan</FieldLabel>
            <EntryInput name={`education.${row.key}.major`} register={register} />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Graduation Year/ Tahun Lulus
            </FieldLabel>
            <EntryInput
              name={`education.${row.key}.graduationYear`}
              register={register}
            />
          </Field>
        </EntryCard>
      ))}
    </div>
  )
}
