import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import {
  useController,
  useWatch,
  type Control,
  type FieldPath,
  type RegisterOptions,
} from 'react-hook-form'
import { Loader2, PenLine, Trash2 } from 'lucide-react'

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
import { ApiError } from '@/lib/api-client'

import { uploadApplicantFormSignature } from '../api'
import type { ApplicantFormValues } from '../types'

export function SignaturePadField({
  name,
  linkName,
  dateName,
  control,
  token,
  className,
  rules,
}: {
  name: FieldPath<ApplicantFormValues>
  linkName: FieldPath<ApplicantFormValues>
  dateName: FieldPath<ApplicantFormValues>
  control: Control<ApplicantFormValues>
  token: string
  className?: string
  rules?: RegisterOptions<ApplicantFormValues, typeof name>
}) {
  const { field, fieldState } = useController({ control, name, rules })
  const { field: linkField } = useController({ control, name: linkName })
  const signatureDate = useWatch({ control, name: dateName })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleChange(dataUrl: string) {
    if (!dataUrl) {
      field.onChange('')
      linkField.onChange('')
      setUploadError(null)
      return
    }

    setUploadError(null)
    setUploading(true)
    try {
      const result = await uploadApplicantFormSignature(
        token,
        dataUrl,
        typeof signatureDate === 'string' ? signatureDate : undefined,
      )
      field.onChange(dataUrl)
      linkField.onChange(result.signature_link)
    } catch (error) {
      setUploadError(
        error instanceof ApiError ? error.message : 'Gagal mengunggah tanda tangan.',
      )
      throw error
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <SignatureField
        value={typeof field.value === 'string' ? field.value : ''}
        onChange={handleChange}
        hasError={!!fieldState.error}
        uploading={uploading}
      />
      {fieldState.error && (
        <p className="text-sm font-normal text-destructive">{fieldState.error.message}</p>
      )}
      {uploadError && <p className="text-sm font-normal text-destructive">{uploadError}</p>}
    </div>
  )
}

function SignatureField({
  value,
  onChange,
  hasError,
  uploading,
}: {
  value: string
  onChange: (value: string) => Promise<void>
  hasError: boolean
  uploading: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-xl',
          value && 'border border-input bg-white/70 dark:bg-input/30',
          hasError && 'border-destructive',
        )}
      >
        {value ? (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-center rounded-lg border border-dashed border-input bg-white p-4">
              <img src={value} alt="Tanda tangan" className="h-20 max-w-full object-contain" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  void onChange('')
                }}
              >
                <Trash2 className="size-4" />
                Hapus
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                <PenLine className="size-4" />
                Ganti Tanda Tangan
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              'group flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5',
              hasError && 'border-destructive',
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <PenLine className="size-5" />
            </span>
            <span className="text-sm font-medium text-foreground">
              Ketuk untuk menandatangani
            </span>
            <span className="text-xs text-muted-foreground">
              Gambar tanda tangan Anda dengan mouse atau jari
            </span>
          </button>
        )}
      </div>

      <SignaturePadDialog
        open={open}
        onOpenChange={(next) => {
          if (uploading) return
          setOpen(next)
        }}
        initialValue={value}
        uploading={uploading}
        onSave={async (dataUrl) => {
          try {
            await onChange(dataUrl)
            setOpen(false)
          } catch {
            // keep the dialog open; the error is surfaced below the field
          }
        }}
      />
    </>
  )
}

function SignaturePadDialog({
  open,
  onOpenChange,
  initialValue,
  uploading,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue: string
  uploading: boolean
  onSave: (dataUrl: string) => void
}) {
  const sigRef = useRef<SignatureCanvas>(null)

  useEffect(() => {
    if (!open) return

    const canvas = sigRef.current?.getCanvas()
    if (!canvas) return

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.getContext('2d')?.scale(ratio, ratio)
      sigRef.current?.clear()
      if (initialValue) {
        sigRef.current?.fromDataURL(initialValue, { width, height })
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [open, initialValue])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tanda Tangan</DialogTitle>
          <DialogDescription>
            Gambar tanda tangan Anda pada area di bawah ini, lalu
            simpan.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-md border border-input bg-white">
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            minWidth={3}
            maxWidth={3}
            velocityFilterWeight={1}
            canvasProps={{ className: 'h-56 w-full touch-none' }}
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => sigRef.current?.clear()}
          >
            Hapus Coretan
          </Button>
          <div className="flex gap-2">
            <DialogClose
              type="button"
              disabled={uploading}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            >
              Batal
            </DialogClose>
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={() => {
                if (sigRef.current && !sigRef.current.isEmpty()) {
                  onSave(sigRef.current.toDataURL())
                }
              }}
            >
              {uploading && <Loader2 className="size-4 animate-spin" />}
              {uploading ? 'Mengunggah...' : 'Simpan'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
