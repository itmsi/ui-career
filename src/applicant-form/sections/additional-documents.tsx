import { useEffect, useRef, useState } from 'react'
import { FileImage, FileText, Loader2, Trash2, UploadCloud, X } from 'lucide-react'
import type { FieldArrayWithId } from 'react-hook-form'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'

import { uploadApplicantFormFile } from '../api'
import { captionLabelClass, inputHeightClass } from '../form-utils'
import type { AdditionalDocumentItem, ApplicantFormValues } from '../types'

export const MAX_ADDITIONAL_DOCUMENTS = 10
export const MAX_ADDITIONAL_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
const ACCEPT_ATTR = '.png,.jpg,.jpeg,.webp,.pdf'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdditionalDocumentsSection({
  token,
  fields,
  onAppend,
  onRemove,
}: {
  token: string
  fields: FieldArrayWithId<ApplicantFormValues, 'additionalDocuments', 'id'>[]
  onAppend: (item: AdditionalDocumentItem) => void
  onRemove: (index: number) => void
}) {
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const remainingSlots = MAX_ADDITIONAL_DOCUMENTS - fields.length
  const canAdd = remainingSlots > 0

  // Only images get a visual preview; keep it in sync with the staged file and
  // release the object URL as soon as it's no longer needed.
  useEffect(() => {
    if (!pendingFile || pendingFile.type === 'application/pdf') {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  function stageFile(file: File) {
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      toast.error('Format file harus PNG, JPG, JPEG, WEBP, atau PDF.')
      return
    }
    if (file.size > MAX_ADDITIONAL_DOCUMENT_SIZE_BYTES) {
      toast.error('Ukuran file maksimal 2MB.')
      return
    }
    if (!canAdd) {
      toast.error(`Maksimal ${MAX_ADDITIONAL_DOCUMENTS} file.`)
      return
    }
    setPendingFile(file)
    setTitle(file.name.replace(/\.[^./\\]+$/, ''))
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) stageFile(file)
  }

  function handleZoneClick() {
    if (uploading || !canAdd) return
    inputRef.current?.click()
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragActive(false)
    if (uploading || !canAdd) return
    const file = event.dataTransfer.files?.[0]
    if (file) stageFile(file)
  }

  function cancelPending() {
    setPendingFile(null)
    setTitle('')
  }

  async function handleUpload() {
    if (!pendingFile) return
    if (!title.trim()) {
      toast.error('Isi judul dokumen terlebih dahulu / Please fill in the document title first.')
      return
    }

    const documentTitle = title.trim()
    const toastId = toast.loading(`Mengunggah ${documentTitle}...`)
    setUploading(true)
    try {
      const result = await uploadApplicantFormFile(token, pendingFile, documentTitle)
      onAppend(result)
      toast.success(`${result.file_title} berhasil diunggah.`, { id: toastId })
      setPendingFile(null)
      setTitle('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Gagal mengunggah dokumen.', {
        id: toastId,
      })
    } finally {
      setUploading(false)
    }
  }

  function handleRemove(index: number, fileTitle: string) {
    onRemove(index)
    toast.success(`${fileTitle} dihapus.`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <Badge
          variant="outline"
          className={cn(
            'rounded-md px-3 font-semibold',
            !canAdd && 'border-destructive/40 text-destructive',
          )}
        >
          {fields.length}/{MAX_ADDITIONAL_DOCUMENTS} dokumen
        </Badge>
      </div>

      {pendingFile ? (
        <div className="space-y-3 rounded-xl border border-input bg-white/70 p-4 dark:bg-input/30">
          <div className="relative">
            {previewUrl ? (
              <div className="flex items-center justify-center overflow-hidden rounded-lg border border-input bg-white">
                <img
                  src={previewUrl}
                  alt={pendingFile.name}
                  className="h-56 w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-input bg-muted/30 p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-6" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {pendingFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(pendingFile.size)}
                  </p>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={cancelPending}
              disabled={uploading}
              aria-label="Batal"
              className="absolute -top-2.5 -right-2.5 rounded-full bg-background text-muted-foreground shadow-sm hover:text-destructive"
            >
              <X className="size-4" />
            </Button>
          </div>

          {previewUrl && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{pendingFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(pendingFile.size)}</p>
            </div>
          )}

          <Field>
            <FieldLabel className={captionLabelClass}>
              Judul Dokumen / Document Title
            </FieldLabel>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="mis. Sertifikat, contoh: Certificate"
              className={inputHeightClass}
              disabled={uploading}
              autoFocus
            />
          </Field>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelPending}
              disabled={uploading}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleUpload}
              disabled={uploading || !title.trim()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}
              {uploading ? 'Mengunggah...' : 'Upload'}
            </Button>
          </div>
        </div>
      ) : canAdd ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleZoneClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleZoneClick()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            'group flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5',
            dragActive && 'border-primary bg-primary/5',
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <UploadCloud className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">Klik atau seret file ke sini</span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG, JPEG, WEBP, atau PDF · maks. 2MB
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <p className="rounded-xl border-2 border-dashed border-input bg-muted/30 p-4 text-center text-sm text-muted-foreground italic">
          Batas maksimal {MAX_ADDITIONAL_DOCUMENTS} dokumen sudah tercapai.
        </p>
      )}

      {fields.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {fields.map((field, index) => {
            const isImage = field.file_type === 'image'
            return (
              <div
                key={field.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-input bg-white/70 p-3 transition-colors hover:border-foreground/30 dark:bg-input/30"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {isImage ? <FileImage className="size-4" /> : <FileText className="size-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {field.file_title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="h-4 rounded-sm px-1.5 text-[10px] font-semibold uppercase"
                      >
                        {isImage ? 'Image' : 'PDF'}
                      </Badge>
                      <a
                        href={field.file}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs text-muted-foreground hover:text-primary hover:underline"
                      >
                        Lihat dokumen
                      </a>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(index, field.file_title)}
                  aria-label="Hapus"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Format PNG, JPG, JPEG, WEBP, atau PDF. Maks. 2MB per file, maksimal{' '}
        {MAX_ADDITIONAL_DOCUMENTS} file.
      </p>
    </div>
  )
}
