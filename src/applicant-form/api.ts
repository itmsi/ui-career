import { apiRequest } from '@/lib/api-client'

import { EDUCATION_ROWS, FAMILY_ROWS, SCREENING_QUESTIONS, yesNoLabel } from './form-utils'
import type { ApplicantFormValues } from './types'

export type InvitationVerifyResponse = {
  valid?: boolean
  message?: string
}

export function verifyApplicantInvitation(token: string) {
  return apiRequest<InvitationVerifyResponse>(
    `/applicant-invitations/verify/${encodeURIComponent(token)}`,
  )
}

export function submitApplicantForm(token: string, values: ApplicantFormValues) {
  return apiRequest('/applicant-forms/create', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    data: toApplicantFormPayload(values),
  })
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
  }
}
