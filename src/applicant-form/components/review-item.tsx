import { useTranslation } from 'react-i18next'

import { captionLabelClass } from '../form-utils'

export function ReviewItem({ label, value }: { label: string; value?: string }) {
  const { t } = useTranslation()
  return (
    <div>
      <p className={captionLabelClass}>{label}</p>
      <p className="text-sm font-medium whitespace-pre-line text-foreground">
        {value && value.trim() ? (
          value
        ) : (
          <span className="font-normal text-muted-foreground italic">
            {t('common.notFilled')}
          </span>
        )}
      </p>
    </div>
  )
}
