import { useTranslation } from 'react-i18next'

import { YesNoQuestion } from '../components/yes-no-question'
import { SCREENING_QUESTIONS } from '../form-utils'

export function ScreeningQuestionsSection() {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      {SCREENING_QUESTIONS.map(({ name }) => (
        <YesNoQuestion key={name} question={t(`screening.${name}`)} name={name} required />
      ))}
    </div>
  )
}
