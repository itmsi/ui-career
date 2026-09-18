import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EntryCard({
  index,
  label,
  columns = 3,
  onRemove,
  children,
}: {
  index: number
  label: string
  columns?: 3 | 4 | 5
  onRemove?: () => void
  children: ReactNode
}) {
  const gridColsClass =
    columns === 5
      ? 'sm:grid-cols-2 lg:grid-cols-5'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="rounded-xl border border-border bg-white/60 p-4 backdrop-blur-sm transition-colors hover:border-foreground/30">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-2.5">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[11.5px] font-semibold text-primary">
            {String(index).padStart(2, '0')}
          </span>
          <p className="font-heading text-sm font-semibold">{label}</p>
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label="Hapus"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
      <div className={cn('grid gap-3', gridColsClass)}>{children}</div>
    </div>
  )
}
