import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { CameraPreview } from '../components/camera-preview'
import { formatClock, useCountdown } from '../hooks/use-countdown'
import { RecorderUnsupportedError, startRecording, type Recording } from '../recorder'
import type { RecordingResult } from '../types'

const WARNING_SECONDS = 10

export function RecordScreen({
  stream,
  questionText,
  maxSeconds,
  onFinished,
  onFailed,
}: {
  stream: MediaStream
  questionText: string
  maxSeconds: number
  onFinished: (result: RecordingResult) => void
  onFailed: (reason: 'unsupported' | 'unknown') => void
}) {
  const { t } = useTranslation()
  const recordingRef = useRef<Recording | null>(null)
  const finishedRef = useRef(false)
  const onFailedRef = useRef(onFailed)

  useEffect(() => {
    onFailedRef.current = onFailed
  })

  useEffect(() => {
    finishedRef.current = false
    let recording: Recording
    try {
      recording = startRecording(stream)
    } catch (error) {
      onFailedRef.current(error instanceof RecorderUnsupportedError ? 'unsupported' : 'unknown')
      return
    }
    recordingRef.current = recording
    return () => {
      recordingRef.current = null
      if (!finishedRef.current) recording.cancel()
    }
  }, [stream])

  async function finish() {
    const recording = recordingRef.current
    if (!recording || finishedRef.current) return
    finishedRef.current = true
    try {
      const result = await recording.stop()
      onFinished({ ...result, durationSeconds: Math.min(result.durationSeconds, maxSeconds) })
    } catch {
      onFailedRef.current('unknown')
    }
  }

  const { elapsedSeconds, remainingSeconds, fraction } = useCountdown({
    seconds: maxSeconds,
    onExpire: () => void finish(),
  })
  const warning = remainingSeconds <= WARNING_SECONDS

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-white/60 p-5">
        <p className="mb-2 text-xs font-semibold text-primary">{t('videoInterview.record.questionLabel')}</p>
        <p className="font-heading text-lg leading-snug font-semibold sm:text-xl">{questionText}</p>
      </section>

      <div className="relative">
        <CameraPreview stream={stream} />
        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
          <span aria-hidden className="size-2 animate-pulse rounded-full bg-red-500" />
          {t('videoInterview.record.recording')}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[12.5px] font-semibold text-foreground/80">
              {t('videoInterview.record.timeLeft')}
            </p>
            <p
              className={cn(
                'font-heading text-3xl font-semibold tabular-nums',
                warning && 'text-destructive',
              )}
            >
              {formatClock(remainingSeconds)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('videoInterview.record.elapsed')} {formatClock(elapsedSeconds)}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={maxSeconds}
          aria-valuenow={elapsedSeconds}
          aria-label={t('videoInterview.record.timeLeft')}
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn('h-full rounded-full transition-[width] duration-200', warning ? 'bg-destructive' : 'bg-primary')}
            style={{ width: `${Math.min(100, fraction * 100)}%` }}
          />
        </div>
        <p role="status" className={cn('min-h-5 text-sm', warning && 'font-semibold text-destructive')}>
          {remainingSeconds === WARNING_SECONDS ? t('videoInterview.record.tenSeconds') : ''}
        </p>
      </div>

      <Button type="button" size="lg" onClick={() => void finish()} disabled={elapsedSeconds < 1}>
        {t('videoInterview.record.finish')}
      </Button>
    </div>
  )
}
