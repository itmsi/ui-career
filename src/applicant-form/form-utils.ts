import { format, isValid, parseISO } from 'date-fns'

import { defaultValues, emptyEducationRow, type ApplicantFormValues, type YesNo } from './types'

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
export const DRIVER_LICENSE_NONE = 'Tidak Punya'
export const DRIVER_LICENSE_OPTIONS = [
  'SIM A',
  'SIM B1',
  'SIM B1 Umum',
  'SIM B2',
  'SIM B2 Umum',
  'SIM C',
  'SIM D',
  DRIVER_LICENSE_NONE,
] as const
export const LAST_EDUCATION_OPTIONS = ['S3', 'S2', 'S1', 'D3', 'D1', 'SMA', 'SMP', 'SD'] as const
export type EducationLevel = (typeof LAST_EDUCATION_OPTIONS)[number]
export const OPTIONAL_EDUCATION_LEVELS = ['D3', 'D1'] as const
export type OptionalEducationLevel = (typeof OPTIONAL_EDUCATION_LEVELS)[number]

type EducationRowValues = {
  schoolName: string
  location: string
  graduate: string
  major: string
  graduationYear: string
}

type EducationValues = {
  lastEducation: string
  education: Record<EducationLevel, EducationRowValues>
  educationSkipped: readonly string[]
}

export function isOptionalEducationLevel(level: string): level is OptionalEducationLevel {
  return (OPTIONAL_EDUCATION_LEVELS as readonly string[]).includes(level)
}

/** The selected level and every level below it, highest first. */
export function educationLevelsFrom(lastEducation: string): EducationLevel[] {
  const start = (LAST_EDUCATION_OPTIONS as readonly string[]).indexOf(lastEducation)
  return start === -1 ? [] : LAST_EDUCATION_OPTIONS.slice(start)
}

/** D3 and D1 are optional unless they are the level the applicant selected. */
export function isEducationLevelRequired(level: EducationLevel, lastEducation: string) {
  return level === lastEducation || !isOptionalEducationLevel(level)
}

export function educationHasDegree(level: EducationLevel) {
  return level !== 'SMA' && level !== 'SMP' && level !== 'SD'
}

export function educationHasMajor(level: EducationLevel) {
  return level !== 'SMP' && level !== 'SD'
}

function isEducationRowEmpty(row: EducationRowValues) {
  return Object.values(row).every((value) => !value.trim())
}

/** Rows that are validated and sent: required levels, plus optional ones the applicant kept and filled in. */
export function educationEntries({ lastEducation, education, educationSkipped }: EducationValues) {
  return educationLevelsFrom(lastEducation)
    .filter(
      (level) =>
        isEducationLevelRequired(level, lastEducation) ||
        (!educationSkipped.includes(level) && !isEducationRowEmpty(education[level])),
    )
    .map((level) => ({ level, row: education[level] }))
}

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

const INTERVIEW_CONTENT_KEYS = [
  'id_question',
  'file_title_video',
  'file_type_video',
  'file_video',
  'file_title_audio',
  'file_type_audio',
  'file_audio',
] as const

function sanitizeInterviewContents(draft: unknown): ApplicantFormValues['applicantFormContents'] {
  if (!Array.isArray(draft)) return []
  const byQuestion = new Map<string, ApplicantFormValues['applicantFormContents'][number]>()
  for (const item of draft) {
    if (!isPlainObject(item)) continue
    const candidate: Record<string, unknown> = {
      ...item,
      id_question: item.id_question ?? item.question_id,
    }
    const values = INTERVIEW_CONTENT_KEYS.map((key) => candidate[key])
    if (!values.every((value) => typeof value === 'string' && value)) continue
    const [id_question, file_title_video, file_type_video, file_video, file_title_audio, file_type_audio, file_audio] =
      values as string[]
    byQuestion.set(id_question, {
      id_question,
      file_title_video,
      file_type_video,
      file_video,
      file_title_audio,
      file_type_audio,
      file_audio,
    })
  }
  return [...byQuestion.values()]
}

/**
 * Drafts saved before education became one row per level hold a single row; it belongs
 * to the level the applicant had selected.
 */
function migrateEducation(draft: Record<string, unknown>, values: ApplicantFormValues) {
  const previous = draft.education
  if (!isPlainObject(previous) || typeof previous.schoolName !== 'string') return values.education
  const level = LAST_EDUCATION_OPTIONS.find((option) => option === values.lastEducation)
  if (!level) return values.education
  return { ...values.education, [level]: mergeDraft(emptyEducationRow, previous) }
}

export function loadDraftValues(): ApplicantFormValues {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return defaultValues
    const draft: unknown = JSON.parse(raw)
    const values = mergeDraft(defaultValues, draft)
    return {
      ...values,
      education: isPlainObject(draft) ? migrateEducation(draft, values) : values.education,
      educationSkipped: values.educationSkipped.filter(isOptionalEducationLevel),
      applicantFormContents: sanitizeInterviewContents(
        isPlainObject(draft) ? draft.applicantFormContents : undefined,
      ),
    }
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
