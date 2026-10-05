import { EntryCard } from '../components/entry-card'
import { TextField } from '../components/form-fields'
import { FAMILY_ROWS } from '../form-utils'

export function FamilyBackgroundSection() {
  return (
    <div className="space-y-3">
      {FAMILY_ROWS.map((row, i) => (
        <EntryCard
          key={row.key}
          index={i + 1}
          label={row.label}
          columns={4}
          required={row.required}
        >
          <TextField name={`family.${row.key}.name`} label="Name/ Nama" required={row.required} />
          <TextField
            name={`family.${row.key}.age`}
            label="Age/ Usia"
            inputMode="numeric"
            maxLength={3}
          />
          <TextField name={`family.${row.key}.employment`} label="Employment/ Pekerjaan" />
          <TextField
            name={`family.${row.key}.emergencyContact`}
            label="Emergency Contact Number/ Kontak Darurat"
            type="tel"
            inputMode="tel"
          />
        </EntryCard>
      ))}
    </div>
  )
}
