import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import type { MediaErrorKind } from '../types'

const MESSAGES = {
  denied: { title: 'videoInterview.mediaError.deniedTitle', body: 'videoInterview.mediaError.deniedBody' },
  notFound: { title: 'videoInterview.mediaError.notFoundTitle', body: 'videoInterview.mediaError.notFoundBody' },
  inUse: { title: 'videoInterview.mediaError.inUseTitle', body: 'videoInterview.mediaError.inUseBody' },
  insecure: { title: 'videoInterview.mediaError.insecureTitle', body: 'videoInterview.mediaError.insecureBody' },
  unsupported: {
    title: 'videoInterview.mediaError.unsupportedTitle',
    body: 'videoInterview.mediaError.unsupportedBody',
  },
  deviceLost: {
    title: 'videoInterview.mediaError.deviceLostTitle',
    body: 'videoInterview.mediaError.deviceLostBody',
  },
  unknown: { title: 'videoInterview.mediaError.unknownTitle', body: 'videoInterview.mediaError.unknownBody' },
} as const satisfies Record<MediaErrorKind, { title: string; body: string }>

export function MediaErrorPanel({
  kind,
  onRetry,
  retrying,
}: {
  kind: MediaErrorKind
  onRetry: () => void
  retrying?: boolean
}) {
  const { t } = useTranslation()
  const message = MESSAGES[kind]
  const retryable = kind !== 'unsupported' && kind !== 'insecure'

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">{t(message.title)}</p>
          <p className="text-sm">{t(message.body)}</p>
        </div>
      </div>
      {retryable && (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
            {t('videoInterview.device.tryAgain')}
          </Button>
        </div>
      )}
    </div>
  )
}
