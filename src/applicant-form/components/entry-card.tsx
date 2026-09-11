import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

import { BlueprintCorners } from '@/components/ui/blueprint-corners'
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
    <div className="blueprint relative border border-border p-4 transition-colors hover:border-foreground/40">
      <BlueprintCorners />
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-2.5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-[11px] font-semibold tracking-[0.1em] text-primary">
            {String(index).padStart(2, '0')}
          </span>
          <p className="font-heading text-sm font-semibold tracking-wide uppercase">{label}</p>
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
