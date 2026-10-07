import { useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/i18n/use-language'
import { ApiError } from '@/lib/api-client'

import { uploadInterviewContent } from './api'
import { QuestionProgress } from './components/question-progress'
import { MAX_RERECORDS } from './config'
import { useMediaStream } from './hooks/use-media-stream'
import { DeviceCheckScreen } from './screens/device-check-screen'
import { IntroScreen } from './screens/intro-screen'
import { PrepareScreen } from './screens/prepare-screen'
import { RecordScreen } from './screens/record-screen'
import { ReviewScreen } from './screens/review-screen'
import { UploadScreen } from './screens/upload-screen'
import type {
  InterviewContent,
  InterviewQuestion,
  MediaErrorKind,
  RecordingResult,
  UploadFailure,
} from './types'

type Phase = 'intro' | 'device' | 'prepare' | 'record' | 'review' | 'upload' | 'done'

const UNSAVED_PHASES: Phase[] = ['record', 'review', 'upload']

function uploadFailureFor(error: unknown): UploadFailure {
  if (error instanceof ApiError) {
    if (error.status === 413) return 'tooLarge'
    if (error.status === 415) return 'unsupportedFormat'
    if (error.status === 0) return 'network'
  }
  return 'failed'
}

export function VideoInterview({
  token,
  fullName,
  questions,
  answeredQuestionIds,
  onAnswered,
}: {
  token: string
  fullName: string
  questions: InterviewQuestion[]
  answeredQuestionIds: string[]
  onAnswered: (content: InterviewContent) => void
}) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const media = useMediaStream()

  const [firstOpenIndex] = useState(() => {
    const answered = new Set(answeredQuestionIds)
    return questions.findIndex((question) => !answered.has(question.id))
  })
  const [phase, setPhase] = useState<Phase>(firstOpenIndex === -1 ? 'done' : 'intro')
  const [index, setIndex] = useState(Math.max(firstOpenIndex, 0))
  const [rerecordsUsed, setRerecordsUsed] = useState(0)
  const [result, setResult] = useState<RecordingResult | null>(null)
  const [recorderError, setRecorderError] = useState<MediaErrorKind | null>(null)
  const [uploadPercent, setUploadPercent] = useState(0)
  const [uploadFailure, setUploadFailure] = useState<UploadFailure | null>(null)

  const question = questions[index]
  const { release } = media

  const activePhase: Phase =
    (phase === 'prepare' || phase === 'record') && !media.stream ? 'device' : phase

  useEffect(() => {
    if (phase === 'done') release()
  }, [phase, release])

  useEffect(() => {
    if (!UNSAVED_PHASES.includes(activePhase)) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [activePhase])

  function requestDevices() {
    setRecorderError(null)
    setPhase((current) => (current === 'record' ? 'prepare' : current))
    void media.request()
  }

  function handleRecorderFailed(reason: 'unsupported' | 'unknown') {
    setRecorderError(reason)
    setPhase('device')
  }

  function handleRerecord() {
    setRerecordsUsed((used) => used + 1)
    setResult(null)
    setPhase('prepare')
  }

  async function submitAnswer() {
    if (!result) return
    setUploadFailure(null)
    setUploadPercent(0)
    setPhase('upload')

    let content: InterviewContent
    try {
      content = await uploadInterviewContent(
        token,
        { questionId: question.id, stepNumber: index + 1, recording: result },
        setUploadPercent,
      )
    } catch (error) {
      setUploadFailure(uploadFailureFor(error))
      return
    }

    onAnswered(content)
    setResult(null)
    setRerecordsUsed(0)
    if (index + 1 >= questions.length) {
      setPhase('done')
      return
    }
    setIndex(index + 1)
    setPhase('prepare')
  }

  if (phase === 'done') {
    return (
      <div role="status" className="flex max-w-3xl items-start gap-3 rounded-xl border border-border bg-white/60 p-5">
        <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-heading text-base font-semibold">{t('videoInterview.done.title')}</p>
          <p className="text-sm text-muted-foreground">{t('videoInterview.done.description')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {activePhase !== 'intro' && (
        <QuestionProgress current={index + 1} total={questions.length} />
      )}

      {activePhase === 'intro' && (
        <IntroScreen
          fullName={fullName}
          totalQuestions={questions.length}
          onContinue={() => setPhase('device')}
        />
      )}

      {activePhase === 'device' && (
        <DeviceCheckScreen
          stream={media.stream}
          error={recorderError ?? media.error}
          requesting={media.requesting}
          onRequest={requestDevices}
          onContinue={() => setPhase('prepare')}
        />
      )}

      {activePhase === 'prepare' && media.stream && (
        <PrepareScreen
          stream={media.stream}
          prepSeconds={question.prepSeconds}
          showCountdown={rerecordsUsed === 0}
          onStart={() => setPhase('record')}
        />
      )}

      {activePhase === 'record' && media.stream && (
        <RecordScreen
          stream={media.stream}
          questionText={question.text[language]}
          maxSeconds={question.maxSeconds}
          onFinished={(finished) => {
            setResult(finished)
            setPhase('review')
          }}
          onFailed={handleRecorderFailed}
        />
      )}

      {activePhase === 'review' && result && (
        <ReviewScreen
          result={result}
          questionText={question.text[language]}
          canRerecord={rerecordsUsed < MAX_RERECORDS}
          onRerecord={handleRerecord}
          onSubmit={() => void submitAnswer()}
        />
      )}

      {activePhase === 'upload' && (
        <UploadScreen
          percent={uploadPercent}
          failure={uploadFailure}
          onRetry={() => void submitAnswer()}
          onBack={() => setPhase('review')}
        />
      )}
    </div>
  )
}
