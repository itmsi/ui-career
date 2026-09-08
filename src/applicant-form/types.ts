import type { UseFormRegister } from 'react-hook-form'

export type EducationRow = {
  schoolName: string
  location: string
  graduate: string
  major: string
  graduationYear: string
}

export type InformalEducationRow = {
  trainingName: string
  institutionName: string
  location: string
  certification: string
  period: string
}

export type FamilyRow = {
  name: string
  age: string
  employment: string
  emergencyContact: string
}

export type WorkExperienceRow = {
  companyName: string
  dateFrom: string
  dateFinal: string
  salary: string
  supervisorName: string
  reasonForLeaving: string
}

export type ReferenceRow = {
  name: string
  position: string
  phone: string
}

export type YesNo = '' | 'yes' | 'no'

export type ApplicantFormValues = {
  fullName: string
  addressIdCard: string
  nickname: string
  presentAddress: string
  mobile: string
  city: string
  emergencyContactInfo: string
  birthPlace: string
  birthDate: string
  email: string
  bloodType: string
  idNumber: string
  taxId: string
  positionApplied: string
  workingAvailableDate: string
  maritalStatus: string
  religion: string
  heightWeight: string
  tshirtSize: string
  driverLicense: {
    simA: boolean
    simB: boolean
    simC: boolean
    sio: boolean
  }
  education: {
    university: EducationRow
    highSchool: EducationRow
    juniorSchool: EducationRow
    elementarySchool: EducationRow
  }
  informalEducation: InformalEducationRow[]
  family: {
    father: FamilyRow
    mother: FamilyRow
    spouse: FamilyRow
    child1: FamilyRow
    child2: FamilyRow
    child3: FamilyRow
    child4: FamilyRow
  }
  workExperience: WorkExperienceRow[]
  references: ReferenceRow[]
  hasCriminalRecord: YesNo
  hasUsedDrugs: YesNo
  willingToRelocate: YesNo
  applicantSignature: string
  signatureDate: string
}

export type RegisterFn = UseFormRegister<ApplicantFormValues>

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
  driverLicense: { simA: false, simB: false, simC: false, sio: false },
  education: {
    university: { ...emptyEducationRow },
    highSchool: { ...emptyEducationRow },
    juniorSchool: { ...emptyEducationRow },
    elementarySchool: { ...emptyEducationRow },
  },
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
  applicantSignature: '',
  signatureDate: '',
}
