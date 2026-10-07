import type { LanguageCode } from '@/i18n'

export type InterviewQuestion = {
  id: string
  text: Record<LanguageCode, string>
  prepSeconds: number
  maxSeconds: number
}

export type RecordedMedia = {
  blob: Blob
  mimeType: string
}

export type RecordingResult = RecordedMedia & {
  durationSeconds: number
  audio: RecordedMedia
}

export type InterviewContent = {
  id_question: string
  file_title_video: string
  file_type_video: string
  file_video: string
  file_title_audio: string
  file_type_audio: string
  file_audio: string
}

export type MediaErrorKind =
  | 'denied'
  | 'notFound'
  | 'inUse'
  | 'insecure'
  | 'unsupported'
  | 'deviceLost'
  | 'unknown'

export type UploadFailure = 'tooLarge' | 'unsupportedFormat' | 'network' | 'failed'
