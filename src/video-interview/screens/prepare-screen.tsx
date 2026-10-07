import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { CameraPreview } from '../components/camera-preview'
import { ScreenHeading } from '../components/screen-heading'
import { formatClock, useCountdown } from '../hooks/use-countdown'

export function PrepareScreen({
  stream,
  prepSeconds,
  showCountdown,
  onStart,
}: {
  stream: MediaStream
  prepSeconds: number
  showCountdown: boolean
  onStart: () => void
}) {
  const { t } = useTranslation()
  const { remainingSeconds, expired } = useCountdown({ seconds: prepSeconds, running: showCountdown })

  return (
    <div>
      <ScreenHeading
        title={t('videoInterview.prepare.title')}
        description={showCountdown ? t('videoInterview.prepare.hint') : t('videoInterview.prepare.rerecordHint')}
      />

      <div className="space-y-4">
        <CameraPreview stream={stream} />

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
