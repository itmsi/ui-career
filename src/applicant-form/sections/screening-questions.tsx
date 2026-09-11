import type { Control } from 'react-hook-form'

import { YesNoQuestion } from '../components/yes-no-question'
import { SCREENING_QUESTIONS } from '../form-utils'
import type { ApplicantFormValues } from '../types'

export function ScreeningQuestionsSection({
  control,
}: {
  control: Control<ApplicantFormValues>
}) {
  return (
    <div className="space-y-3">
      {SCREENING_QUESTIONS.map(({ name, question }) => (
        <YesNoQuestion key={name} question={question} name={name} control={control} />
      ))}
    </div>
  )
}
