import { captionLabelClass } from '../form-utils'

export function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className={captionLabelClass}>{label}</p>
      <p className="text-sm font-medium whitespace-pre-line text-foreground">
        {value && value.trim() ? (
          value
        ) : (
          <span className="font-normal text-muted-foreground italic">
            Belum diisi
          </span>
        )}
      </p>
    </div>
  )
}
