import { Plus } from 'lucide-react'
import type { Control, FieldArrayWithId } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'

import { DatePickerField } from '../components/date-picker-field'
import { EntryCard } from '../components/entry-card'
import { EntryInput } from '../components/entry-input'
import { captionLabelClass } from '../form-utils'
import type { ApplicantFormValues, RegisterFn } from '../types'

export function WorkingExperiencesSection({
  register,
  control,
  fields,
  onAppend,
  onRemove,
}: {
  register: RegisterFn
  control: Control<ApplicantFormValues>
  fields: FieldArrayWithId<ApplicantFormValues, 'workExperience', 'id'>[]
  onAppend: () => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <EntryCard
          key={field.id}
          index={index + 1}
          label={`Pengalaman Kerja ${index + 1}`}
          columns={3}
          onRemove={fields.length > 1 ? () => onRemove(index) : undefined}
        >
          <Field>
            <FieldLabel className={captionLabelClass}>
              Name of Company/ Nama Perusahaan
            </FieldLabel>
            <EntryInput
              name={`workExperience.${index}.companyName`}
              register={register}
            />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Employment Date From/ dari
            </FieldLabel>
            <DatePickerField
              name={`workExperience.${index}.dateFrom`}
              control={control}
            />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Employment Date Final/ terakhir
            </FieldLabel>
            <DatePickerField
              name={`workExperience.${index}.dateFinal`}
              control={control}
            />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Pay of Salary/ Gaji yg dibayar
            </FieldLabel>
            <EntryInput
              name={`workExperience.${index}.salary`}
              register={register}
            />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Name of Supervisor/ Nama Atasan langsung
            </FieldLabel>
            <EntryInput
              name={`workExperience.${index}.supervisorName`}
              register={register}
            />
          </Field>
          <Field>
            <FieldLabel className={captionLabelClass}>
              Reason for Leaving/ Alasan mengundurkan diri
            </FieldLabel>
            <EntryInput
              name={`workExperience.${index}.reasonForLeaving`}
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
        Tambah Pengalaman Kerja
      </Button>
    </div>
  )
}
