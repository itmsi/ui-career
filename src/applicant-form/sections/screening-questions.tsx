import { YesNoQuestion } from '../components/yes-no-question'
import { SCREENING_QUESTIONS } from '../form-utils'

export function ScreeningQuestionsSection() {
  return (
    <div className="space-y-3">
      {SCREENING_QUESTIONS.map(({ name, question }) => (
        <YesNoQuestion key={name} question={question} name={name} required />
      ))}
    </div>
  )
}
