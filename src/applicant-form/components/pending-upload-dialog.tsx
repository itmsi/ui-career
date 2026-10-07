import { useTranslation } from 'react-i18next'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function PendingUploadDialog({
  labels,
  onStay,
  onDiscard,
}: {
  /** Files picked but not uploaded; the dialog is open while this is non-empty. */
  labels: string[]
  onStay: () => void
  onDiscard: () => void
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={labels.length > 0} onOpenChange={(open) => !open && onStay()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('pendingUpload.title')}</DialogTitle>
          <DialogDescription>{t('pendingUpload.description')}</DialogDescription>
        </DialogHeader>

        <ul className="ml-4 list-disc space-y-1 text-sm font-medium text-foreground">
          {labels.map((label) => (
            <li key={label} className="break-all">
              {label}
            </li>
          ))}
        </ul>

        <DialogFooter>
          <DialogClose
            type="button"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            {t('pendingUpload.stay')}
          </DialogClose>
          <Button type="button" variant="destructive" size="sm" onClick={onDiscard}>
            {t('pendingUpload.discard')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
