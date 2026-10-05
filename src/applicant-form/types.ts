import { format } from 'date-fns'
import type { z } from 'zod'

import type { applicantFormSchema } from './schema'

export type ApplicantFormValues = z.infer<typeof applicantFormSchema>
export type EducationRow = ApplicantFormValues['education']
export type InformalEducationRow = ApplicantFormValues['informalEducation'][number]
export type FamilyRow = ApplicantFormValues['family']['spouse']
export type WorkExperienceRow = ApplicantFormValues['workExperience'][number]
export type ReferenceRow = ApplicantFormValues['references'][number]
export type AdditionalDocumentItem = ApplicantFormValues['additionalDocuments'][number]
export type YesNo = ApplicantFormValues['hasCriminalRecord']

const emptyEducationRow: EducationRow = {
  schoolName: '',
  location: '',
  graduate: '',
  major: '',
  graduationYear: '',
}

const emptyFamilyRow: FamilyRow = {
  name: '',
  age: '',
  employment: '',
  emergencyContact: '',
}

export const emptyInformalEducationRow: InformalEducationRow = {
  trainingName: '',
  institutionName: '',
  location: '',
  certification: '',
  period: '',
}

export const emptyWorkExperienceRow: WorkExperienceRow = {
  companyName: '',
  dateFrom: '',
  dateFinal: '',
  salary: '',
  supervisorName: '',
  reasonForLeaving: '',
}

export const emptyReferenceRow: ReferenceRow = {
  name: '',
  position: '',
  phone: '',
}

export const defaultValues: ApplicantFormValues = {
  fullName: '',
  addressIdCard: '',
  nickname: '',
  presentAddress: '',
  mobile: '',
  city: '',
  emergencyContactInfo: '',
  birthPlace: '',
  birthDate: '',
  email: '',
  bloodType: '',
  idNumber: '',
  taxId: '',
  positionApplied: '',
  workingAvailableDate: '',
  maritalStatus: '',
  religion: '',
  heightWeight: '',
  tshirtSize: '',
  driverLicense: '',
  lastEducation: '',
  education: { ...emptyEducationRow },
  informalEducation: Array.from({ length: 2 }, () => ({ ...emptyInformalEducationRow })),
  family: {
    father: { ...emptyFamilyRow },
    mother: { ...emptyFamilyRow },
    spouse: { ...emptyFamilyRow },
    child1: { ...emptyFamilyRow },
    child2: { ...emptyFamilyRow },
    child3: { ...emptyFamilyRow },
    child4: { ...emptyFamilyRow },
  },
  workExperience: Array.from({ length: 3 }, () => ({ ...emptyWorkExperienceRow })),
  references: Array.from({ length: 2 }, () => ({ ...emptyReferenceRow })),
  hasCriminalRecord: '',
  hasUsedDrugs: '',
  willingToRelocate: '',
  cvDocument: { file_title: '', file_type: '', file: '' },
  additionalDocuments: [],
  applicantSignature: '',
  signatureLink: '',
  signatureDate: format(new Date(), 'yyyy-MM-dd'),
}
