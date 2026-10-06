import { format, isValid, parseISO } from 'date-fns'

import { defaultValues, type ApplicantFormValues, type YesNo } from './types'

export const captionLabelClass = 'text-[12.5px] font-semibold text-foreground/80'
export const inputHeightClass = 'h-10 rounded-md'

export const BLOOD_TYPE_OPTIONS = ['A', 'B', 'O', 'AB'] as const
export const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'] as const
export const RELIGION_OPTIONS = [
  'Islam',
  'Kristen Protestan',
  'Katolik',
  'Hindu',
  'Buddha',
  'Konghucu',
  'Lainnya',
] as const
export const LAST_EDUCATION_OPTIONS = ['S3', 'S2', 'S1', 'D3', 'D1', 'SMA', 'SMP', 'SD'] as const

export const FAMILY_ROWS: Array<{
  key: keyof ApplicantFormValues['family']
  /** Sent to the backend as-is; the on-screen label comes from `family.<key>`. */
  relationship: string
  required?: boolean
}> = [
  { key: 'father', relationship: 'ayah', required: true },
  { key: 'mother', relationship: 'ibu', required: true },
  { key: 'spouse', relationship: 'suami/istri' },
  { key: 'child1', relationship: 'anak ke-1' },
  { key: 'child2', relationship: 'anak ke-2' },
  { key: 'child3', relationship: 'anak ke-3' },
  { key: 'child4', relationship: 'anak ke-4' },
]

/** The Indonesian question text is what the backend stores; the UI shows `screening.<name>`. */
export const SCREENING_QUESTIONS: Array<{
  name: 'hasCriminalRecord' | 'hasUsedDrugs' | 'willingToRelocate'
  question: string
}> = [
  {
    name: 'hasCriminalRecord',
    question: 'Apakah Anda pernah terlibat dalam tindakan kriminal?',
  },
  {
    name: 'hasUsedDrugs',
    question:
      'Apakah Anda pernah menggunakan atau mengonsumsi narkotika, psikotropika, atau zat terlarang lainnya?',
  },
  {
    name: 'willingToRelocate',
    question:
      'Apakah Anda bersedia ditempatkan di lokasi kerja mana pun sesuai kebutuhan perusahaan?',
  },
]

/** Rows that must stay in the list because the table marks them "Wajib Diisi". */
export const WORK_EXPERIENCE_MIN = 1
export const REFERENCES_MIN = 1

export const DRAFT_STORAGE_KEY = 'applicant-form:draft'
export const STEP_STORAGE_KEY = 'applicant-form:step'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Overlays a saved draft onto `defaults`, keeping only the keys and value types the
 * current form knows about. Drafts saved by an older version of the form (e.g. the
 * old one-row-per-school education shape) would otherwise leave fields `undefined`.
 */
function mergeDraft<T>(defaults: T, draft: unknown): T {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(draft)) return defaults
    const template: unknown = defaults[0]
    return (template === undefined ? draft : draft.map((item) => mergeDraft(template, item))) as T
  }
  if (isPlainObject(defaults)) {
    if (!isPlainObject(draft)) return defaults
    return Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [key, mergeDraft(value, draft[key])]),
    ) as T
  }
  return typeof draft === typeof defaults ? (draft as T) : defaults
}

export function loadDraftValues(): ApplicantFormValues {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return defaultValues
    return mergeDraft(defaultValues, JSON.parse(raw))
  } catch {
    return defaultValues
  }
}

export function loadDraftStep(): number {
  try {
    const raw = window.localStorage.getItem(STEP_STORAGE_KEY)
    return raw ? Number(raw) || 0 : 0
  } catch {
    return 0
  }
}

/** Answer text sent to the backend; always Indonesian, whatever language the UI shows. */
export function yesNoLabel(value: YesNo) {
  if (value === 'yes') return 'Ya'
  if (value === 'no') return 'Tidak'
  return ''
}

export function formatDateDisplay(value?: string) {
  if (!value) return ''
  const parsed = parseISO(value)
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : value
}
