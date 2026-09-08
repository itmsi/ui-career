import { format, isValid, parseISO } from 'date-fns'

import { defaultValues, type ApplicantFormValues, type YesNo } from './types'

export const captionLabelClass =
  'text-[11px] font-semibold tracking-wide text-muted-foreground'
export const inputHeightClass = 'h-10 rounded-lg'

export const EDUCATION_ROWS: Array<{
  key: keyof ApplicantFormValues['education']
  label: string
}> = [
  { key: 'university', label: 'University/ Universitas' },
  { key: 'highSchool', label: 'High School/ SMA' },
  { key: 'juniorSchool', label: 'Junior School/ SMP' },
  { key: 'elementarySchool', label: 'Elementary School/ SD' },
]

export const FAMILY_ROWS: Array<{
  key: keyof ApplicantFormValues['family']
  label: string
}> = [
  { key: 'father', label: 'Nama Ayah' },
  { key: 'mother', label: 'Nama Ibu' },
  { key: 'spouse', label: 'Nama Suami/ Istri' },
  { key: 'child1', label: 'Nama Anak ke-1 / Saudara ke-1' },
  { key: 'child2', label: 'Nama Anak ke-2 / Saudara ke-2' },
  { key: 'child3', label: 'Nama Anak ke-3 / Saudara ke-3' },
  { key: 'child4', label: 'Nama Anak ke-4 / Saudara ke-4' },
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
