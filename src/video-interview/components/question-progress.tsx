import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export function QuestionProgress({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation()

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-xs font-semibold text-primary">
        {t('videoInterview.progress', { current, total })}
      </span>
      <div className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={cn('h-[3px] flex-1 rounded-full', index < current ? 'bg-primary' : 'bg-primary/25')}
          />
        ))}
      </div>
    </div>
  )
}
