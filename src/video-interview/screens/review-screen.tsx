import { useEffect, useState } from 'react'
import { RotateCcw, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { ScreenHeading } from '../components/screen-heading'
import { formatClock } from '../hooks/use-countdown'
import type { RecordingResult } from '../types'

export function ReviewScreen({
  result,
  questionText,
  canRerecord,
  onRerecord,
  onSubmit,
}: {
  result: RecordingResult
  questionText: string
  canRerecord: boolean
  onRerecord: () => void
  onSubmit: () => void
}) {
  const { t } = useTranslation()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [playbackFailed, setPlaybackFailed] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(result.blob)
    setVideoUrl(url)
    setPlaybackFailed(false)
    return () => URL.revokeObjectURL(url)
  }, [result.blob])

  return (
    <div className="space-y-5">
      <ScreenHeading
        title={t('videoInterview.review.title')}
        description={t('videoInterview.review.description')}
      />

      <p className="rounded-xl border border-border bg-white/60 p-4 text-sm font-medium">{questionText}</p>

      {videoUrl && (
        <video
          src={videoUrl}
          controls
          playsInline
          onError={() => setPlaybackFailed(true)}
          className="aspect-video w-full rounded-xl border border-border bg-black"
        />
      )}
      <p className="text-xs text-muted-foreground">
        {t('videoInterview.review.duration', { time: formatClock(result.durationSeconds) })}
      </p>
      {playbackFailed && (
        <p role="alert" className="text-sm text-destructive">
          {t('videoInterview.review.playbackFailed')}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="lg" onClick={onSubmit}>
          <Send className="size-4" />
          {t('videoInterview.review.submit')}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onRerecord} disabled={!canRerecord}>
          <RotateCcw className="size-4" />
          {t('videoInterview.review.rerecord')}
        </Button>
        {!canRerecord && (
          <span className="text-xs text-muted-foreground">{t('videoInterview.review.rerecordLimit')}</span>
        )}
      </div>
    </div>
  )
}
