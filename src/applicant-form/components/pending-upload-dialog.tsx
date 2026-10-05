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
  return (
    <Dialog open={labels.length > 0} onOpenChange={(open) => !open && onStay()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>File belum diunggah</DialogTitle>
          <DialogDescription>
            File berikut sudah dipilih tetapi belum diunggah. Jika Anda lanjut, upload file
            ini akan dibatalkan.
          </DialogDescription>
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
            Kembali &amp; Upload
          </DialogClose>
          <Button type="button" variant="destructive" size="sm" onClick={onDiscard}>
            Batalkan Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
