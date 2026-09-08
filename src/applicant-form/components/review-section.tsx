import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function ReviewSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}
