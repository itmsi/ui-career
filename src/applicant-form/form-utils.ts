import { format, isValid, parseISO } from 'date-fns'

import { defaultValues, type ApplicantFormValues, type YesNo } from './types'

export const captionLabelClass =
  'text-[11px] font-semibold tracking-wide text-muted-foreground'
export const inputHeightClass = 'h-10 rounded-lg'

export const EDUCATION_ROWS: Array<{
  key: keyof ApplicantFormValues['education']
  label: string
  typeOfSchool: string
}> = [
  { key: 'university', label: 'University/ Universitas', typeOfSchool: 'university' },
  { key: 'highSchool', label: 'High School/ SMA', typeOfSchool: 'high_school' },
  { key: 'juniorSchool', label: 'Junior School/ SMP', typeOfSchool: 'junior_school' },
  { key: 'elementarySchool', label: 'Elementary School/ SD', typeOfSchool: 'elementary_school' },
]

export const FAMILY_ROWS: Array<{
  key: keyof ApplicantFormValues['family']
  label: string
  relationship: string
}> = [
  { key: 'father', label: 'Nama Ayah', relationship: 'ayah' },
  { key: 'mother', label: 'Nama Ibu', relationship: 'ibu' },
  { key: 'spouse', label: 'Nama Suami/ Istri', relationship: 'suami/istri' },
  { key: 'child1', label: 'Nama Anak ke-1 / Saudara ke-1', relationship: 'anak ke-1' },
  { key: 'child2', label: 'Nama Anak ke-2 / Saudara ke-2', relationship: 'anak ke-2' },
  { key: 'child3', label: 'Nama Anak ke-3 / Saudara ke-3', relationship: 'anak ke-3' },
  { key: 'child4', label: 'Nama Anak ke-4 / Saudara ke-4', relationship: 'anak ke-4' },
]

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

export const REFERENCES_MIN = 2

export const DRAFT_STORAGE_KEY = 'applicant-form:draft'
export const STEP_STORAGE_KEY = 'applicant-form:step'

export function loadDraftValues(): ApplicantFormValues {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return defaultValues
    return { ...defaultValues, ...JSON.parse(raw) }
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
