import { apiRequest } from '@/lib/api-client'

import { EDUCATION_ROWS, FAMILY_ROWS, SCREENING_QUESTIONS, yesNoLabel } from './form-utils'
import type { ApplicantFormValues } from './types'

export type InvitationVerifyResponse = {
  id: string
  full_name: string
  email: string
  no_mobile: string
}

type InvitationVerifyApiResponse = {
  success: boolean
  message: string
  data: InvitationVerifyResponse
  timestamp: string
}

export async function verifyApplicantInvitation(token: string) {
  const response = await apiRequest<InvitationVerifyApiResponse>(
    `/applicant-invitations/verify/${encodeURIComponent(token)}`,
  )
  return response.data
}

export function submitApplicantForm(token: string, values: ApplicantFormValues) {
  return apiRequest('/applicant-forms/create', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    data: toApplicantFormPayload(values),
  })
}

export type SignatureUploadResponse = {
  signature_link: string
  signature_date: string
}

type SignatureUploadApiResponse = {
  success: boolean
  message: string
  data: SignatureUploadResponse
  timestamp: string
}

export async function uploadApplicantFormSignature(
  token: string,
  signatureDataUrl: string,
  signatureDate?: string,
) {
  const formData = new FormData()
  formData.append('file', dataUrlToFile(signatureDataUrl, 'signature.png'))
  if (signatureDate) formData.append('signature_date', signatureDate)

  const response = await apiRequest<SignatureUploadApiResponse>(
    '/applicant-form-signatures/create',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      data: formData,
    },
  )
  return response.data
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new File([bytes], filename, { type: mime })
}

function toApplicantFormPayload(values: ApplicantFormValues) {
  return {
    full_name: values.fullName,
    nickname: values.nickname,
    no_mobile: values.mobile,
    name_relationship_emergency_contact_number: values.emergencyContactInfo,
    email: values.email,
    id_number: values.idNumber,
    position_applied_for: values.positionApplied,
    marital_status: values.maritalStatus,
    height_weight: values.heightWeight,
    driver_license: [
      values.driverLicense.simA && { name: 'SIM A' },
      values.driverLicense.simB && { name: 'SIM B' },
      values.driverLicense.simC && { name: 'SIM C' },
      values.driverLicense.sio && { name: 'SIO' },
    ].filter((item): item is { name: string } => Boolean(item)),
    address_as_per_id_card: values.addressIdCard,
    present_address: values.presentAddress,
    city: values.city,
    place_date_of_birth: [values.birthPlace, values.birthDate].filter(Boolean).join(', '),
    blood_type: values.bloodType,
    tax_identification_number: values.taxId,
    working_available_date: values.workingAvailableDate,
    relogion: values.religion,
    tshirt_size: values.tshirtSize,
    educational_background: EDUCATION_ROWS.map((row) => {
      const v = values.education[row.key]
      return {
        type_of_school: row.typeOfSchool,
        name_of_school: v.schoolName,
        location: v.location,
        graduate: v.graduate,
        major: v.major,
        graduation_year: v.graduationYear,
      }
    }),
    informal_education_special_qualification: values.informalEducation.map((row) => ({
      type_of_training: row.trainingName,
      institution_name: row.institutionName,
      location: row.location,
      certification: row.certification,
      periode: row.period,
    })),
    family_background: FAMILY_ROWS.map((row) => {
      const v = values.family[row.key]
      return {
        relationship: row.relationship,
        name: v.name,
        age: v.age,
        employment: v.employment,
        emergency_contact_number: v.emergencyContact,
      }
    }),
    working_experiences: values.workExperience.map((row) => ({
      name_of_company: row.companyName,
      date_from: row.dateFrom,
      date_final: row.dateFinal,
      pay_of_salary: row.salary,
      name_of_supervisor: row.supervisorName,
      reason_of_leaving: row.reasonForLeaving,
    })),
    references_old_company: values.references.map((row) => ({
      name: row.name,
      position_company: row.position,
      phone: row.phone,
    })),
    following_answers: SCREENING_QUESTIONS.map(({ name, question }) => ({
      question,
      answers: yesNoLabel(values[name]),
    })),
    signature_link: values.signatureLink,
    signature_date: values.signatureDate,
  }
}
