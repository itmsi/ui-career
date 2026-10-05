import { format } from 'date-fns'
import { z } from 'zod'

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

const PHONE_MESSAGE = 'Format nomor telepon tidak valid (9–15 digit, boleh diawali +)'

const isPhone = (value: string) => PHONE_PATTERN.test(value.replace(/[\s\-().]/g, ''))
const isKtp = (value: string) => KTP_PATTERN.test(value.replace(/\s/g, ''))
const isNpwp = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return /^[\d.\-\s]+$/.test(value) && (digits.length === 15 || digits.length === 16)
}
const today = () => format(new Date(), 'yyyy-MM-dd')
const isBlank = (value: string) => !value.trim()

const requiredText = (message: string) => z.string().trim().min(1, message)

/** Optional text that must match `test` once the applicant fills it in. */
const optionalFormat = (test: (value: string) => boolean, message: string) =>
  z.string().refine((value) => isBlank(value) || test(value.trim()), message)

const requiredOption = (options: readonly string[], message: string) =>
  z.string().refine((value) => options.includes(value), message)

// The explicit `boolean` return keeps TS from inferring a type predicate, which
// would make zod narrow the output to 'yes' | 'no' and break the '' default.
const yesNo = z
  .enum(['', 'yes', 'no'])
  .refine((value): boolean => value !== '', 'Silakan pilih Ya atau Tidak')

const educationSchema = z.object({
  schoolName: requiredText('Nama institusi wajib diisi'),
  location: requiredText('Lokasi wajib diisi'),
  graduate: requiredText('Gelar kelulusan wajib diisi'),
  major: requiredText('Jurusan wajib diisi'),
  graduationYear: requiredText('Tahun lulus wajib diisi').refine(
    (value) => YEAR_PATTERN.test(value),
    'Tahun lulus harus 4 digit (cth. 2020)',
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
  age: optionalFormat((value) => AGE_PATTERN.test(value), 'Usia harus berupa angka'),
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

export const applicantFormSchema = z.object({
  // 1. Applicant Information — wajib
  fullName: requiredText('Nama lengkap wajib diisi'),
  nickname: requiredText('Nama panggilan wajib diisi'),
  addressIdCard: requiredText('Alamat sesuai KTP wajib diisi'),
  presentAddress: requiredText('Alamat saat ini wajib diisi'),
  mobile: requiredText('Nomor handphone wajib diisi').refine(isPhone, PHONE_MESSAGE),
  emergencyContactInfo: requiredText('Kontak darurat wajib diisi'),
  birthPlace: requiredText('Tempat lahir wajib diisi'),
  birthDate: requiredText('Tanggal lahir wajib diisi').refine(
    (value) => value < today(),
    'Tanggal lahir harus sebelum hari ini',
  ),
  email: requiredText('Email wajib diisi').refine(
    (value) => EMAIL_PATTERN.test(value),
    'Format email tidak valid',
  ),
  bloodType: requiredOption(BLOOD_TYPE_OPTIONS, 'Golongan darah wajib dipilih'),
  idNumber: requiredText('No. KTP wajib diisi').refine(isKtp, 'No. KTP harus 16 digit angka'),
  positionApplied: requiredText('Posisi yang dilamar wajib diisi'),
  workingAvailableDate: requiredText('Tanggal siap bekerja wajib diisi').refine(
    (value) => value >= today(),
    'Tanggal siap bekerja tidak boleh sebelum hari ini',
  ),
  maritalStatus: requiredOption(MARITAL_STATUS_OPTIONS, 'Status pernikahan wajib dipilih'),
  religion: requiredOption(RELIGION_OPTIONS, 'Agama wajib dipilih'),
  heightWeight: requiredText('Tinggi & berat badan wajib diisi'),
  tshirtSize: requiredText('Ukuran kaos wajib diisi'),
  // 1. Applicant Information — tidak wajib
  city: z.string(),
  taxId: optionalFormat(isNpwp, 'NPWP harus 15 atau 16 digit angka'),
  driverLicense: z.string(),

  // 2. Educational History
  lastEducation: requiredOption(LAST_EDUCATION_OPTIONS, 'Pendidikan terakhir wajib dipilih'),
  education: educationSchema,

  // 3. Informal Education and Special Qualification — semua tidak wajib
  informalEducation: z.array(informalEducationRowSchema),

  // 4. Family Background — ayah & ibu wajib
  family: z.object({
    father: familyRowSchema.extend({ name: requiredText('Nama ayah wajib diisi') }),
    mother: familyRowSchema.extend({ name: requiredText('Nama ibu wajib diisi') }),
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
      ctx.addIssue({ code: 'custom', message: 'Pengalaman kerja / magang 1 wajib diisi', path: [] })
      return
    }
    if (isBlank(first.companyName)) {
      ctx.addIssue({ code: 'custom', message: 'Nama perusahaan wajib diisi', path: [0, 'companyName'] })
    }
    if (isBlank(first.dateFrom)) {
      ctx.addIssue({ code: 'custom', message: 'Tanggal mulai wajib diisi', path: [0, 'dateFrom'] })
    }
    rows.forEach((row, index) => {
      if (row.dateFrom && row.dateFinal && row.dateFinal < row.dateFrom) {
        ctx.addIssue({
          code: 'custom',
          message: 'Tanggal terakhir tidak boleh sebelum tanggal mulai',
          path: [index, 'dateFinal'],
        })
      }
    })
  }),

  // 6. References — referensi 1 wajib
  references: z.array(referenceRowSchema).superRefine((rows, ctx) => {
    const first = rows[0]
    if (!first) {
      ctx.addIssue({ code: 'custom', message: 'Referensi 1 wajib diisi', path: [] })
      return
    }
    const required: Array<[keyof typeof first, string]> = [
      ['name', 'Nama referensi wajib diisi'],
      ['position', 'Jabatan referensi wajib diisi'],
      ['phone', 'Telepon referensi wajib diisi'],
    ]
    for (const [key, message] of required) {
      if (isBlank(first[key])) ctx.addIssue({ code: 'custom', message, path: [0, key] })
    }
  }),

  // 7. Screening questions — semua wajib
  hasCriminalRecord: yesNo,
  hasUsedDrugs: yesNo,
  willingToRelocate: yesNo,

  additionalDocuments: z.array(additionalDocumentSchema),
  applicantSignature: z.string(),
  signatureLink: z.string(),
  signatureDate: z.string(),
})

export type ApplicantFormSchema = typeof applicantFormSchema
