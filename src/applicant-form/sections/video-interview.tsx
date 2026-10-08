import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { InvalidQuestionsError, fetchInterviewQuestions } from '@/video-interview/api'
import type { InterviewQuestion } from '@/video-interview/types'
import { VideoInterview } from '@/video-interview/video-interview'

import { FormFieldError } from '../components/form-fields'
import type { ApplicantFormValues } from '../types'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; reason: 'load' | 'questions' }
  | { status: 'ready'; questions: InterviewQuestion[] }

export function VideoInterviewSection({
  token,
  fullName,
  onQuestionCount,
  onStarted,
}: {
  token: string
  fullName: string
  onQuestionCount: (total: number) => void
  onStarted: () => void
}) {
  const { t } = useTranslation()
  const {
    control,
    formState: { errors },
  } = useFormContext<ApplicantFormValues>()
  const { fields, append } = useFieldArray({ control, name: 'applicantFormContents' })
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    fetchInterviewQuestions(token)
      .then((questions) => {
        if (cancelled) return
        setState({ status: 'ready', questions })
        onQuestionCount(questions.length)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({
          status: 'error',
          reason: error instanceof InvalidQuestionsError ? 'questions' : 'load',
        })
      })

    return () => {
      cancelled = true
    }
  }, [token, attempt, onQuestionCount])

  if (state.status === 'loading') {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t('videoInterview.load.loading')}
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <div
        role="alert"
        className="max-w-3xl space-y-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
      >
        <p>
          {state.reason === 'questions'
            ? t('videoInterview.load.questionsInvalid')
            : t('videoInterview.load.failed')}
        </p>
        {state.reason === 'load' && (
          <Button type="button" variant="outline" size="sm" onClick={() => setAttempt((n) => n + 1)}>
            {t('videoInterview.load.retry')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <VideoInterview
        token={token}
        fullName={fullName}
        questions={state.questions}
        answeredQuestionIds={fields.map((field) => field.id_question)}
        onAnswered={(content) => append(content)}
        onStarted={onStarted}
      />
      <FormFieldError error={errors.applicantFormContents?.root ?? errors.applicantFormContents} />
    </div>
  )
}
