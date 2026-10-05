import { useTranslation } from 'react-i18next'

import { EntryCard } from '../components/entry-card'
import { TextField } from '../components/form-fields'
import { FAMILY_ROWS } from '../form-utils'

export function FamilyBackgroundSection() {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      {FAMILY_ROWS.map((row, i) => (
        <EntryCard
          key={row.key}
          index={i + 1}
          label={t(`family.${row.key}`)}
          columns={4}
          required={row.required}
        >
          <TextField name={`family.${row.key}.name`} label={t('fields.name')} required={row.required} />
          <TextField
            name={`family.${row.key}.age`}
            label={t('fields.age')}
            inputMode="numeric"
            maxLength={3}
          />
          <TextField name={`family.${row.key}.employment`} label={t('fields.employment')} />
          <TextField
            name={`family.${row.key}.emergencyContact`}
            label={t('fields.emergencyContactNumber')}
            type="tel"
            inputMode="tel"
          />
        </EntryCard>
      ))}
    </div>
  )
}
