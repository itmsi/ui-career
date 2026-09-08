import { Plus } from 'lucide-react'
import type { FieldArrayWithId } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'

import { EntryCard } from '../components/entry-card'
import { EntryInput } from '../components/entry-input'
import { captionLabelClass } from '../form-utils'
import type { ApplicantFormValues, RegisterFn } from '../types'

export function InformalEducationSection({
  register,
  fields,
  onAppend,
  onRemove,
}: {
  register: RegisterFn
  fields: FieldArrayWithId<ApplicantFormValues, 'informalEducation', 'id'>[]
  onAppend: () => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <EntryCard
          key={field.id}
          index={index + 1}
          label={`Pelatihan / Keterampilan ${index + 1}`}
          columns={5}
          onRemove={fields.length > 1 ? () => onRemove(index) : undefined}
        >
          <Field className="justify-between">
            <FieldLabel className={captionLabelClass}>
              Type of Training/ Name of Skill/ Jenis Pelatihan/ Nama Keterampilan
            </FieldLabel>
            <EntryInput
              name={`informalEducation.${index}.trainingName`}
              register={register}
            />
          </Field>
          <Field className="justify-between">
            <FieldLabel className={captionLabelClass}>
              Institution&apos;s Name/ Nama Institusi Pelatihan
            </FieldLabel>
            <EntryInput
              name={`informalEducation.${index}.institutionName`}
              register={register}
            />
          </Field>
          <Field className="justify-between">
            <FieldLabel className={captionLabelClass}>
              Location/ Tempat
            </FieldLabel>
            <EntryInput
              name={`informalEducation.${index}.location`}
              register={register}
            />
          </Field>
          <Field className="justify-between">
            <FieldLabel className={captionLabelClass}>
              Certification/ Sertifikasi
            </FieldLabel>
            <EntryInput
              name={`informalEducation.${index}.certification`}
              register={register}
            />
          </Field>
          <Field className="justify-between">
            <FieldLabel className={captionLabelClass}>
              Periode/ Waktu
            </FieldLabel>
            <EntryInput
              name={`informalEducation.${index}.period`}
              register={register}
            />
          </Field>
        </EntryCard>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={onAppend}
        className="w-full border-dashed"
      >
        <Plus className="size-4" />
        Tambah Pelatihan / Keterampilan
      </Button>
    </div>
  )
}
