import { startOfToday } from 'date-fns'
import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'

import { DatePickerField } from '../components/date-picker-field'
import { EntryCard } from '../components/entry-card'
import { TextField } from '../components/form-fields'
import { WORK_EXPERIENCE_MIN } from '../form-utils'
import { emptyWorkExperienceRow, type ApplicantFormValues } from '../types'

export function WorkingExperiencesSection() {
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
            label={`Pengalaman Kerja / Magang ${index + 1}`}
            columns={3}
            required={required}
            onRemove={required ? undefined : () => remove(index)}
          >
            <TextField
              name={`workExperience.${index}.companyName`}
              label="Name of Company/ Nama Perusahaan"
              required={required}
            />
            <DatePickerField
              name={`workExperience.${index}.dateFrom`}
              label="Employment Date From/ dari"
              required={required}
              disabled={{ after: today }}
              startMonth={new Date(1970, 0)}
              endMonth={today}
            />
            <DatePickerField
              name={`workExperience.${index}.dateFinal`}
              label="Employment Date Final/ terakhir"
              disabled={{ after: today }}
              startMonth={new Date(1970, 0)}
              endMonth={today}
            />
            <TextField
              name={`workExperience.${index}.salary`}
              label="Pay of Salary/ Gaji yg dibayar"
              inputMode="numeric"
            />
            <TextField
              name={`workExperience.${index}.supervisorName`}
              label="Name of Supervisor/ Nama Atasan langsung"
            />
            <TextField
              name={`workExperience.${index}.reasonForLeaving`}
              label="Reason for Leaving/ Alasan mengundurkan diri"
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
        Tambah Pengalaman Kerja / Magang
      </Button>
    </div>
  )
}
