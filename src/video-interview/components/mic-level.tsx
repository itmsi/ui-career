import { useTranslation } from 'react-i18next'

import { useAudioLevel } from '../hooks/use-audio-level'

export function MicLevel({ stream }: { stream: MediaStream | null }) {
  const { t } = useTranslation()
  const level = useAudioLevel(stream)

  return (
    <div className="space-y-1.5">
      <p className="text-[12.5px] font-semibold text-foreground/80">
        {t('videoInterview.device.micLevel')}
      </p>
      <div
        role="meter"
        aria-label={t('videoInterview.device.micLevel')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(level * 100)}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-100"
          style={{ width: `${level * 100}%` }}
        />
      </div>
    </div>
  )
}
