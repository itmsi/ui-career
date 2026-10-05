import { useWatch } from 'react-hook-form'

import { FieldGroup } from '@/components/ui/field'

import { EntryCard } from '../components/entry-card'
import { SelectField, TextField } from '../components/form-fields'
import { LAST_EDUCATION_OPTIONS } from '../form-utils'
import type { ApplicantFormValues } from '../types'

export function EducationalBackgroundSection() {
  const lastEducation = useWatch<ApplicantFormValues, 'lastEducation'>({ name: 'lastEducation' })

  return (
    <FieldGroup>
      <SelectField
        name="lastEducation"
        label="LAST EDUCATION / Pendidikan terakhir"
        options={LAST_EDUCATION_OPTIONS}
        placeholder="Pilih pendidikan terakhir"
        required
        className="sm:max-w-xs"
      />

      {lastEducation && (
        <EntryCard index={1} label={`Pendidikan Terakhir — ${lastEducation}`} columns={5} required>
          <TextField
            name="education.schoolName"
            label="Name of School/ Nama Institusi"
            required
          />
          <TextField name="education.location" label="Location/ Lokasi" required />
          <TextField name="education.graduate" label="Graduate/ Gelar Kelulusan" required />
          <TextField name="education.major" label="Major / Jurusan" required />
          <TextField
            name="education.graduationYear"
            label="Graduation Year/ Tahun Lulus"
            inputMode="numeric"
            placeholder="cth. 2020"
            maxLength={4}
            required
          />
        </EntryCard>
      )}
    </FieldGroup>
  )
}
