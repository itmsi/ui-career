import { useEffect, useMemo, useRef, useState } from 'react'
import { FileImage, FileText, Loader2, Trash2, UploadCloud, X } from 'lucide-react'
import { useController, useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { TranslationKey } from '@/i18n/use-language'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'

import { uploadApplicantFormFile } from '../api'
import { FieldCaption, FormFieldError } from '../components/form-fields'
import { usePendingUpload } from '../pending-uploads'
import { captionLabelClass, inputHeightClass } from '../form-utils'
import type { ApplicantFormValues } from '../types'

export const MAX_ADDITIONAL_DOCUMENTS = 10
export const MAX_ADDITIONAL_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
const ACCEPT_ATTR = '.png,.jpg,.jpeg,.webp,.pdf'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type SingleFileConfig = {
  name: 'cvDocument' | 'photoDocument'
  /** `file_title` sent to the upload endpoint. */
  fileTitle: string
  acceptAttr: string
  acceptedMimeTypes: string[]
  /** Show the picked / uploaded file as an image thumbnail. */
  image?: boolean
  required?: boolean
  /** Translation keys for every piece of text this slot shows. */
  text: {
    label: TranslationKey
    invalidType: TranslationKey
    tooLarge: TranslationKey
    uploading: TranslationKey
    uploaded: TranslationKey
    uploadFailed: TranslationKey
    removed: TranslationKey
    replaces: TranslationKey
    view: TranslationKey
    remove: TranslationKey
    dropzone: TranslationKey
    hint: TranslationKey
    pendingLabel: TranslationKey
  }
}

const CV_CONFIG: SingleFileConfig = {
  name: 'cvDocument',
  fileTitle: 'CV',
  acceptAttr: '.pdf,application/pdf',
  acceptedMimeTypes: ['application/pdf'],
  required: true,
  text: {
    label: 'fields.cv',
    invalidType: 'documents.cvMustBePdf',
    tooLarge: 'documents.cvTooLarge',
    uploading: 'documents.cvUploading',
    uploaded: 'documents.cvUploaded',
    uploadFailed: 'documents.cvUploadFailed',
    removed: 'documents.cvRemoved',
    replaces: 'documents.cvReplaces',
    view: 'documents.viewCv',
    remove: 'documents.removeCv',
    dropzone: 'documents.cvDropzone',
    hint: 'documents.cvHint',
    pendingLabel: 'pendingUpload.cvLabel',
  },
}

const PHOTO_CONFIG: SingleFileConfig = {
  name: 'photoDocument',
  fileTitle: 'Foto',
  acceptAttr: '.png,.jpg,.jpeg,.webp',
  acceptedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  image: true,
  text: {
    label: 'fields.photo',
    invalidType: 'documents.photoInvalidType',
    tooLarge: 'documents.photoTooLarge',
    uploading: 'documents.photoUploading',
    uploaded: 'documents.photoUploaded',
    uploadFailed: 'documents.photoUploadFailed',
    removed: 'documents.photoRemoved',
    replaces: 'documents.photoReplaces',
    view: 'documents.viewPhoto',
    remove: 'documents.removePhoto',
    dropzone: 'documents.photoDropzone',
    hint: 'documents.photoHint',
    pendingLabel: 'pendingUpload.photoLabel',
  },
}

/** A dedicated single-file slot: staged first, uploaded on "Upload". */
function SingleFileUploadField({ token, config }: { token: string; config: SingleFileConfig }) {
  const { t } = useTranslation()
  const { text } = config
  const {
    field: { ref, ...field },
    fieldState,
  } = useController<ApplicantFormValues, SingleFileConfig['name']>({ name: config.name })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploaded = field.value
  const Icon = config.image ? FileImage : FileText

  const previewUrl = useMemo(
    () => (config.image && pendingFile ? URL.createObjectURL(pendingFile) : null),
    [config.image, pendingFile],
  )
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  // Right after an upload, show the applicant's own file instead of relying on the
  // server URL rendering as an image. Keyed by the uploaded URL so it is ignored once
  // the file is replaced or removed.
  const [localThumb, setLocalThumb] = useState<{ file: string; url: string } | null>(null)
  useEffect(() => {
    if (!localThumb) return
    return () => URL.revokeObjectURL(localThumb.url)
  }, [localThumb])
  const thumbSrc =
    localThumb && localThumb.file === uploaded.file ? localThumb.url : uploaded.file
  // A server URL that fails to load falls back to the file icon instead of a broken image.
  const [brokenThumb, setBrokenThumb] = useState<string | null>(null)
  const showThumb = config.image && !!thumbSrc && brokenThumb !== thumbSrc

  usePendingUpload(
    config.name,
    pendingFile ? t(text.pendingLabel, { name: pendingFile.name }) : null,
    cancelPending,
  )

  function openPicker() {
    if (!uploading) inputRef.current?.click()
  }

  function stageFile(file: File) {
    if (!config.acceptedMimeTypes.includes(file.type)) {
      toast.error(t(text.invalidType))
      return
    }
    if (file.size > MAX_ADDITIONAL_DOCUMENT_SIZE_BYTES) {
      toast.error(t(text.tooLarge))
      return
    }
    setPendingFile(file)
  }

  function cancelPending() {
    setPendingFile(null)
  }

  async function handleUpload() {
    if (!pendingFile) return
    const toastId = toast.loading(t(text.uploading))
    setUploading(true)
    try {
      const result = await uploadApplicantFormFile(token, pendingFile, config.fileTitle)
      setLocalThumb(
        config.image ? { file: result.file, url: URL.createObjectURL(pendingFile) } : null,
      )
      field.onChange(result)
      field.onBlur()
      setPendingFile(null)
      toast.success(t(text.uploaded), { id: toastId })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t(text.uploadFailed), {
        id: toastId,
      })
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    field.onChange({ file_title: '', file_type: '', file: '' })
    field.onBlur()
    toast.success(t(text.removed))
  }

  return (
    <Field data-invalid={!!fieldState.error}>
      <FieldCaption htmlFor={config.name} required={config.required}>
        {t(text.label)}
      </FieldCaption>

      <input
        ref={inputRef}
        type="file"
        accept={config.acceptAttr}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) stageFile(file)
        }}
      />

      {pendingFile ? (
        <div className="space-y-3 rounded-xl border border-input bg-white/70 p-4 dark:bg-input/30">
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-input bg-muted/30 p-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={pendingFile.name}
                className="size-16 shrink-0 rounded-lg border border-input bg-white object-cover"
              />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{pendingFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(pendingFile.size)}
                {uploaded.file && ` · ${t(text.replaces)}`}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelPending}
              disabled={uploading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="button" size="sm" onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}
              {uploading ? t('common.uploading') : t('common.upload')}
            </Button>
          </div>
        </div>
      ) : uploaded.file ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-input bg-white/70 p-3 dark:bg-input/30">
          <div className="flex min-w-0 items-center gap-2.5">
            {showThumb ? (
              <img
                src={thumbSrc}
                alt={uploaded.file_title}
                onError={() => setBrokenThumb(thumbSrc)}
                className="size-12 shrink-0 rounded-lg border border-input bg-white object-cover"
              />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{uploaded.file_title}</p>
              <a
                href={uploaded.file}
                target="_blank"
                rel="noreferrer"
                className="truncate text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {t(text.view)}
              </a>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="outline" size="sm" onClick={openPicker}>
              <UploadCloud className="size-4" />
              {t('common.change')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleRemove}
              aria-label={t(text.remove)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          id={config.name}
          ref={ref}
          role="button"
          tabIndex={0}
          aria-invalid={!!fieldState.error}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openPicker()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragActive(false)
            const file = event.dataTransfer.files?.[0]
            if (file) stageFile(file)
          }}
          className={cn(
            'group flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/30 p-6 text-center transition-colors outline-none hover:border-primary/50 hover:bg-primary/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            dragActive && 'border-primary bg-primary/5',
            fieldState.error && 'border-destructive',
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <Icon className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">{t(text.dropzone)}</span>
          <span className="text-xs text-muted-foreground">{t(text.hint)}</span>
        </div>
      )}

      <FormFieldError error={fieldState.error} />
    </Field>
  )
}

export function AdditionalDocumentsSection({ token }: { token: string }) {
  const { t } = useTranslation()
  const { control } = useFormContext<ApplicantFormValues>()
  const {
    fields,
    append: onAppend,
    remove: onRemove,
  } = useFieldArray({ control, name: 'additionalDocuments' })
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

  usePendingUpload(
    'additional-document',
    pendingFile
      ? t('pendingUpload.documentLabel', { name: title.trim() || pendingFile.name })
      : null,
    cancelPending,
  )

  function stageFile(file: File) {
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      toast.error(t('documents.invalidType'))
      return
    }
    if (file.size > MAX_ADDITIONAL_DOCUMENT_SIZE_BYTES) {
      toast.error(t('documents.tooLarge'))
      return
    }
    if (!canAdd) {
      toast.error(t('documents.maxFiles', { max: MAX_ADDITIONAL_DOCUMENTS }))
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
      toast.error(t('documents.titleRequired'))
      return
    }

    const documentTitle = title.trim()
    const toastId = toast.loading(t('documents.uploadingFile', { title: documentTitle }))
    setUploading(true)
    try {
      const result = await uploadApplicantFormFile(token, pendingFile, documentTitle)
      onAppend(result)
      toast.success(t('documents.uploaded', { title: result.file_title }), { id: toastId })
      setPendingFile(null)
      setTitle('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t('documents.uploadFailed'), {
        id: toastId,
      })
    } finally {
      setUploading(false)
    }
  }

  function handleRemove(index: number, fileTitle: string) {
    onRemove(index)
    toast.success(t('documents.removed', { title: fileTitle }))
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SingleFileUploadField token={token} config={CV_CONFIG} />
        <SingleFileUploadField token={token} config={PHOTO_CONFIG} />
      </div>

      <FieldSeparator>{t('documents.additionalSeparator')}</FieldSeparator>

      <div className="flex items-center justify-end">
        <Badge
          variant="outline"
          className={cn(
            'rounded-md px-3 font-semibold',
            !canAdd && 'border-destructive/40 text-destructive',
          )}
        >
          {t('documents.counter', { count: fields.length, max: MAX_ADDITIONAL_DOCUMENTS })}
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
              aria-label={t('common.cancel')}
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
              {t('documents.titleLabel')}
            </FieldLabel>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('documents.titlePlaceholder')}
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
              {t('common.cancel')}
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
              {uploading ? t('common.uploading') : t('common.upload')}
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
          <span className="text-sm font-medium text-foreground">{t('documents.dropzone')}</span>
          <span className="text-xs text-muted-foreground">
            {t('documents.hint')}
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
          {t('documents.limitReached', { max: MAX_ADDITIONAL_DOCUMENTS })}
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
                        {isImage ? t('documents.typeImage') : t('documents.typePdf')}
                      </Badge>
                      <a
                        href={field.file}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs text-muted-foreground hover:text-primary hover:underline"
                      >
                        {t('documents.viewDocument')}
                      </a>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(index, field.file_title)}
                  aria-label={t('common.remove')}
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
        {t('documents.footnote', { max: MAX_ADDITIONAL_DOCUMENTS })}
      </p>
    </div>
  )
}
