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
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 transition-colors hover:border-border hover:bg-muted/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {index}
          </span>
          <p className="text-sm font-medium">{label}</p>
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
