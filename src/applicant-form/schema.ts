import { format } from 'date-fns'
import { z } from 'zod'

import type { TranslationKey } from '@/i18n/use-language'

import {
  BLOOD_TYPE_OPTIONS,
  LAST_EDUCATION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
} from './form-utils'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?\d{9,15}$/
const KTP_PATTERN = /^\d{16}$/
const YEAR_PATTERN = /^(19|20)\d{2}$/
const AGE_PATTERN = /^\d{1,3}$/

// Messages are translation keys; the UI translates them when it shows the error,
// so a visible error follows the language switcher without re-validating.
const PHONE_MESSAGE: TranslationKey = 'validation.phoneFormat'

const isPhone = (value: string) => PHONE_PATTERN.test(value.replace(/[\s\-().]/g, ''))
const isKtp = (value: string) => KTP_PATTERN.test(value.replace(/\s/g, ''))
const isNpwp = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return /^[\d.\-\s]+$/.test(value) && (digits.length === 15 || digits.length === 16)
}
const today = () => format(new Date(), 'yyyy-MM-dd')
const isBlank = (value: string) => !value.trim()

const requiredText = (message: TranslationKey) => z.string().trim().min(1, message)

/** Optional text that must match `test` once the applicant fills it in. */
const optionalFormat = (test: (value: string) => boolean, message: TranslationKey) =>
  z.string().refine((value) => isBlank(value) || test(value.trim()), message)

const requiredOption = (options: readonly string[], message: TranslationKey) =>
  z.string().refine((value) => options.includes(value), message)

// The explicit `boolean` return keeps TS from inferring a type predicate, which
// would make zod narrow the output to 'yes' | 'no' and break the '' default.
const yesNo = z
  .enum(['', 'yes', 'no'])
  .refine((value): boolean => value !== '', 'validation.yesNoRequired')

const educationSchema = z.object({
  schoolName: requiredText('validation.schoolNameRequired'),
  location: requiredText('validation.locationRequired'),
  graduate: requiredText('validation.graduateRequired'),
  major: requiredText('validation.majorRequired'),
  graduationYear: requiredText('validation.graduationYearRequired').refine(
    (value) => YEAR_PATTERN.test(value),
    'validation.graduationYearFormat',
  ),
})

const informalEducationRowSchema = z.object({
  trainingName: z.string(),
  institutionName: z.string(),
  location: z.string(),
  certification: z.string(),
  period: z.string(),
})

const familyRowSchema = z.object({
  name: z.string(),
  age: optionalFormat((value) => AGE_PATTERN.test(value), 'validation.ageFormat'),
  employment: z.string(),
  emergencyContact: optionalFormat(isPhone, PHONE_MESSAGE),
})

const workExperienceRowSchema = z.object({
  companyName: z.string(),
  dateFrom: z.string(),
  dateFinal: z.string(),
  salary: z.string(),
  supervisorName: z.string(),
  reasonForLeaving: z.string(),
})

const referenceRowSchema = z.object({
  name: z.string(),
  position: z.string(),
  phone: optionalFormat(isPhone, PHONE_MESSAGE),
})

const additionalDocumentSchema = z.object({
  file_title: z.string(),
  file_type: z.string(),
  file: z.string(),
})

const interviewContentSchema = z.object({
  id_question: z.string(),
  file_title_video: z.string(),
  file_type_video: z.string(),
  file_video: z.string(),
  file_title_audio: z.string(),
  file_type_audio: z.string(),
  file_audio: z.string(),
})

export const applicantFormSchema = z.object({
  // 1. Applicant Information — wajib
  fullName: requiredText('validation.fullNameRequired'),
  nickname: requiredText('validation.nicknameRequired'),
  addressIdCard: requiredText('validation.addressIdCardRequired'),
  presentAddress: requiredText('validation.presentAddressRequired'),
  mobile: requiredText('validation.mobileRequired').refine(isPhone, PHONE_MESSAGE),
  emergencyContactInfo: requiredText('validation.emergencyContactRequired'),
  birthPlace: requiredText('validation.birthPlaceRequired'),
  birthDate: requiredText('validation.birthDateRequired').refine(
    (value) => value < today(),
    'validation.birthDatePast',
  ),
  email: requiredText('validation.emailRequired').refine(
    (value) => EMAIL_PATTERN.test(value),
    'validation.emailFormat',
  ),
  bloodType: requiredOption(BLOOD_TYPE_OPTIONS, 'validation.bloodTypeRequired'),
  idNumber: requiredText('validation.idNumberRequired').refine(isKtp, 'validation.idNumberFormat'),
  positionApplied: requiredText('validation.positionAppliedRequired'),
  workingAvailableDate: requiredText('validation.workingAvailableDateRequired').refine(
    (value) => value >= today(),
    'validation.workingAvailableDateFuture',
  ),
  maritalStatus: requiredOption(MARITAL_STATUS_OPTIONS, 'validation.maritalStatusRequired'),
  religion: requiredOption(RELIGION_OPTIONS, 'validation.religionRequired'),
  heightWeight: requiredText('validation.heightWeightRequired'),
  tshirtSize: requiredText('validation.tshirtSizeRequired'),
  // 1. Applicant Information — tidak wajib
  city: z.string(),
  taxId: optionalFormat(isNpwp, 'validation.taxIdFormat'),
  driverLicense: z.string(),

  // 2. Educational History
  lastEducation: requiredOption(LAST_EDUCATION_OPTIONS, 'validation.lastEducationRequired'),
  education: educationSchema,

  // 3. Informal Education and Special Qualification — semua tidak wajib
  informalEducation: z.array(informalEducationRowSchema),

  // 4. Family Background — ayah & ibu wajib
  family: z.object({
    father: familyRowSchema.extend({ name: requiredText('validation.fatherNameRequired') }),
    mother: familyRowSchema.extend({ name: requiredText('validation.motherNameRequired') }),
    spouse: familyRowSchema,
    child1: familyRowSchema,
    child2: familyRowSchema,
    child3: familyRowSchema,
    child4: familyRowSchema,
  }),

  // 5. Working Experiences — pengalaman kerja / magang 1 wajib
  workExperience: z.array(workExperienceRowSchema).superRefine((rows, ctx) => {
    const first = rows[0]
    if (!first) {
      ctx.addIssue({ code: 'custom', message: 'validation.workExperienceRequired', path: [] })
      return
    }
    if (isBlank(first.companyName)) {
      ctx.addIssue({ code: 'custom', message: 'validation.companyNameRequired', path: [0, 'companyName'] })
    }
    if (isBlank(first.dateFrom)) {
      ctx.addIssue({ code: 'custom', message: 'validation.dateFromRequired', path: [0, 'dateFrom'] })
    }
    rows.forEach((row, index) => {
      if (row.dateFrom && row.dateFinal && row.dateFinal < row.dateFrom) {
        ctx.addIssue({
          code: 'custom',
          message: 'validation.dateFinalAfterFrom',
          path: [index, 'dateFinal'],
        })
      }
    })
  }),

  // 6. References — referensi 1 wajib
  references: z.array(referenceRowSchema).superRefine((rows, ctx) => {
    const first = rows[0]
    if (!first) {
      ctx.addIssue({ code: 'custom', message: 'validation.referenceRequired', path: [] })
      return
    }
    const required: Array<[keyof typeof first, TranslationKey]> = [
      ['name', 'validation.referenceNameRequired'],
      ['position', 'validation.referencePositionRequired'],
      ['phone', 'validation.referencePhoneRequired'],
    ]
    for (const [key, message] of required) {
      if (isBlank(first[key])) ctx.addIssue({ code: 'custom', message, path: [0, key] })
    }
  }),

  // 7. Screening questions — semua wajib
  hasCriminalRecord: yesNo,
  hasUsedDrugs: yesNo,
  willingToRelocate: yesNo,

  cvDocument: additionalDocumentSchema.refine((doc) => !!doc.file, 'validation.cvRequired'),
  photoDocument: additionalDocumentSchema,
  additionalDocuments: z.array(additionalDocumentSchema),
  applicantFormContents: z
    .array(interviewContentSchema)
    .min(1, 'validation.interviewRequired'),
  applicantSignature: z.string(),
  signatureLink: z.string(),
  signatureDate: z.string(),
})

export type ApplicantFormSchema = typeof applicantFormSchema
