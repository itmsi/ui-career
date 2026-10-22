import { Info, Timer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { CameraPreview } from '../components/camera-preview'
import { ScreenHeading } from '../components/screen-heading'
import { formatClock, useCountdown } from '../hooks/use-countdown'
import { useFormatDuration } from '../hooks/use-format-duration'

export function PrepareScreen({
  stream,
  prepSeconds,
  maxSeconds,
  showCountdown,
  onStart,
}: {
  stream: MediaStream
  prepSeconds: number
  maxSeconds: number
  showCountdown: boolean
  onStart: () => void
}) {
  const { t } = useTranslation()
  const formatDuration = useFormatDuration()
  const { remainingSeconds, expired } = useCountdown({ seconds: prepSeconds, running: showCountdown })

  return (
    <div>
      <ScreenHeading
        title={t('videoInterview.prepare.title')}
        description={showCountdown ? t('videoInterview.prepare.hint') : t('videoInterview.prepare.rerecordHint')}
      />

      <div className="space-y-4">
        <CameraPreview stream={stream} />

        <div className="grid gap-3 sm:grid-cols-2">
          {showCountdown && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/60 px-4 py-3">
              <span className="text-[12.5px] font-semibold text-foreground/80">
                {t('videoInterview.prepare.timeLeft')}
              </span>
              <span className="font-heading text-2xl font-semibold tabular-nums">
                {formatClock(remainingSeconds)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-white/60 px-4 py-3">
            <Timer aria-hidden className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-semibold">
              {t('videoInterview.prepare.answerTime', { max: formatDuration(maxSeconds) })}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground">{t('videoInterview.prepare.startNotice')}</p>
        </div>

        <p role="status" className="min-h-5 text-sm text-muted-foreground">
          {showCountdown && expired ? t('videoInterview.prepare.timeUp') : ''}
        </p>

        <Button type="button" size="lg" onClick={onStart}>
          {t('videoInterview.prepare.start')}
        </Button>
      </div>
    </div>
  )
}
