import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'

import { EntryCard } from '../components/entry-card'
import { TextField } from '../components/form-fields'
import { emptyInformalEducationRow, type ApplicantFormValues } from '../types'

export function InformalEducationSection() {
  const { control } = useFormContext<ApplicantFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'informalEducation' })

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <EntryCard
          key={field.id}
          index={index + 1}
          label={`Pelatihan / Keterampilan ${index + 1}`}
          columns={5}
          onRemove={fields.length > 1 ? () => remove(index) : undefined}
        >
          <TextField
            name={`informalEducation.${index}.trainingName`}
            label="Type of Training/ Name of Skill/ Jenis Pelatihan/ Nama Keterampilan"
            className="justify-between"
          />
          <TextField
            name={`informalEducation.${index}.institutionName`}
            label="Institution's Name/ Nama Institusi Pelatihan"
            className="justify-between"
          />
          <TextField
            name={`informalEducation.${index}.location`}
            label="Location/ Tempat"
            className="justify-between"
          />
          <TextField
            name={`informalEducation.${index}.certification`}
            label="Certification/ Sertifikasi"
            className="justify-between"
          />
          <TextField
            name={`informalEducation.${index}.period`}
            label="Periode/ Waktu"
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
        Tambah Pelatihan / Keterampilan
      </Button>
    </div>
  )
}
