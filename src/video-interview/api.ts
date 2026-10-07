import type { AxiosProgressEvent } from 'axios'

import { apiRequest } from '@/lib/api-client'

import { timingForPosition } from './config'
import type { InterviewContent, InterviewQuestion, RecordingResult } from './types'

type ApiEnvelope<T> = { success: boolean; message: string; data: T }

type MasterQuestionApi = {
  id: string
  question_id: string
  question_en: string
  question_cn: string
  focus_assessment: string
}

type MasterQuestionsApiData = {
  data: MasterQuestionApi[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

const QUESTIONS_PAGE_LIMIT = 10

export class InvalidQuestionsError extends Error {
  constructor() {
    super('Interview questions are missing or incomplete')
    this.name = 'InvalidQuestionsError'
  }
}

export async function fetchInterviewQuestions(token: string): Promise<InterviewQuestion[]> {
  const response = await apiRequest<ApiEnvelope<MasterQuestionsApiData>>('/master_questions/get', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    data: {
      page: 1,
      limit: QUESTIONS_PAGE_LIMIT,
      search: '',
      sort_by: 'created_at',
      sort_order: 'asc',
    },
  })

  const { data: rows, pagination } = response.data
  if (rows.length === 0 || pagination.total > rows.length) throw new InvalidQuestionsError()

  return rows.map((row, index) => ({
    id: row.id,
    text: {
      id: row.question_id,
      en: row.question_en || row.question_id,
      zh: row.question_cn || row.question_id,
    },
    ...timingForPosition(index),
  }))
}

class IncompleteUploadResponseError extends Error {
  constructor() {
    super('Upload response is missing the file urls')
    this.name = 'IncompleteUploadResponseError'
  }
}

type InterviewContentInput = {
  questionId: string
  stepNumber: number
  recording: RecordingResult
}

function extensionFor(mimeType: string, kind: 'video' | 'audio') {
  if (mimeType.includes('mp4')) return kind === 'video' ? 'mp4' : 'm4a'
  return 'webm'
}

export async function uploadInterviewContent(
  token: string,
  { questionId, stepNumber, recording }: InterviewContentInput,
  onProgress: (percent: number) => void,
): Promise<InterviewContent> {
  const titles = {
    video: `Question step ${stepNumber}`,
    audio: `Rekaman Suara Step ${stepNumber}`,
  }

  const formData = new FormData()
  formData.append('id_question', questionId)
  formData.append('file_title_video', titles.video)
  formData.append('file_type_video', 'video')
  formData.append(
    'file_video',
    recording.blob,
    `question-${stepNumber}.${extensionFor(recording.mimeType, 'video')}`,
  )
  formData.append('file_title_audio', titles.audio)
  formData.append('file_type_audio', 'audio')
  formData.append(
    'file_audio',
    recording.audio.blob,
    `question-${stepNumber}.${extensionFor(recording.audio.mimeType, 'audio')}`,
  )

  const response = await apiRequest<ApiEnvelope<Partial<Omit<InterviewContent, 'id_question'>> | undefined>>(
    '/applicant_form_contents/create',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      data: formData,
      onUploadProgress: (event: AxiosProgressEvent) => {
        if (event.total) onProgress(Math.round((event.loaded / event.total) * 100))
      },
    },
  )

  const saved = response.data
  if (!saved?.file_video || !saved.file_audio) throw new IncompleteUploadResponseError()

  return {
    id_question: questionId,
    file_title_video: saved.file_title_video ?? titles.video,
    file_type_video: saved.file_type_video ?? 'video',
    file_video: saved.file_video,
    file_title_audio: saved.file_title_audio ?? titles.audio,
    file_type_audio: saved.file_type_audio ?? 'audio',
    file_audio: saved.file_audio,
  }
}
