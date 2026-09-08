import type { Control } from 'react-hook-form'

import { YesNoQuestion } from '../components/yes-no-question'
import type { ApplicantFormValues } from '../types'

export function ScreeningQuestionsSection({
  control,
}: {
  control: Control<ApplicantFormValues>
}) {
  return (
    <div className="space-y-3">
      <YesNoQuestion
        question="Apakah Anda pernah terlibat dalam tindakan kriminal?"
        name="hasCriminalRecord"
        control={control}
      />
      <YesNoQuestion
        question="Apakah Anda pernah menggunakan atau mengonsumsi narkotika, psikotropika, atau zat terlarang lainnya?"
        name="hasUsedDrugs"
        control={control}
      />
      <YesNoQuestion
        question="Apakah Anda bersedia ditempatkan di lokasi kerja mana pun sesuai kebutuhan perusahaan?"
        name="willingToRelocate"
        control={control}
      />
    </div>
  )
}
