import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { ScreenHeading } from '../components/screen-heading'
import type { UploadFailure } from '../types'

const FAILURE_MESSAGES = {
  tooLarge: 'videoInterview.upload.tooLarge',
  unsupportedFormat: 'videoInterview.upload.unsupportedFormat',
  network: 'videoInterview.upload.network',
  failed: 'videoInterview.upload.failed',
} as const satisfies Record<UploadFailure, string>

export function UploadScreen({
  percent,
  failure,
  onRetry,
  onBack,
}: {
  percent: number
  failure: UploadFailure | null
  onRetry: () => void
  onBack: () => void
}) {
  const { t } = useTranslation()

  if (failure) {
    return (
      <div className="space-y-5">
        <ScreenHeading title={t('videoInterview.upload.failedTitle')} />
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p>{t(FAILURE_MESSAGES[failure])}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" size="lg" onClick={onRetry}>
            {t('videoInterview.upload.retry')}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            {t('videoInterview.upload.backToReview')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ScreenHeading
        title={t('videoInterview.upload.title')}
        description={t('videoInterview.upload.description')}
      />
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={t('videoInterview.upload.title')}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm font-semibold tabular-nums">{t('videoInterview.upload.percent', { percent })}</p>
    </div>
  )
}
