import { Loader2, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { CameraPreview } from '../components/camera-preview'
import { MediaErrorPanel } from '../components/media-error-panel'
import { MicLevel } from '../components/mic-level'
import { ScreenHeading } from '../components/screen-heading'
import type { MediaErrorKind } from '../types'

export function DeviceCheckScreen({
  stream,
  error,
  requesting,
  onRequest,
  onContinue,
}: {
  stream: MediaStream | null
  error: MediaErrorKind | null
  requesting: boolean
  onRequest: () => void
  onContinue: () => void
}) {
  const { t } = useTranslation()
  const ready = !!stream && !error

  return (
    <div>
      <ScreenHeading
        title={t('videoInterview.device.title')}
        description={t('videoInterview.device.description')}
      />

      <div className="space-y-4">
        {ready ? (
          <>
            <CameraPreview stream={stream} />
            <MicLevel stream={stream} />
            <p role="status" className="text-sm text-muted-foreground">
              {t('videoInterview.device.cameraReady')}
            </p>
          </>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-input bg-muted/30">
            <Video aria-hidden className="size-10 text-muted-foreground/50" />
          </div>
        )}

        {error && <MediaErrorPanel kind={error} onRetry={onRequest} retrying={requesting} />}

        <div className="flex flex-wrap items-center gap-3">
          {ready ? (
            <Button type="button" size="lg" onClick={onContinue}>
              {t('videoInterview.device.start')}
            </Button>
          ) : (
            !error && (
              <Button type="button" size="lg" onClick={onRequest} disabled={requesting}>
                {requesting && <Loader2 className="size-4 animate-spin" />}
                {requesting ? t('videoInterview.device.allowing') : t('videoInterview.device.allow')}
              </Button>
            )
          )}
          {!ready && !error && !requesting && (
            <span className="text-xs text-muted-foreground">{t('videoInterview.device.notReady')}</span>
          )}
        </div>
      </div>
    </div>
  )
}
