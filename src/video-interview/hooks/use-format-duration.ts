import { useTranslation } from 'react-i18next'

export function useFormatDuration() {
  const { t } = useTranslation()

  return (seconds: number) =>
    seconds % 60 === 0
      ? t('videoInterview.duration.minutes', { value: seconds / 60 })
      : t('videoInterview.duration.seconds', { value: seconds })
}
