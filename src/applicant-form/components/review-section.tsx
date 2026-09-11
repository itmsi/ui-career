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
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Icon className="size-4 text-primary" />
        <h3 className="font-heading text-sm font-semibold tracking-wide uppercase">{title}</h3>
      </div>
      {children}
    </div>
  )
}
