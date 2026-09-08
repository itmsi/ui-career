import { Award, Briefcase, Contact, FileSignature, GraduationCap, ShieldQuestion, UserRound, UsersRound } from 'lucide-react'

import { EntryCard } from '../components/entry-card'
import { ReviewItem } from '../components/review-item'
import { ReviewSection } from '../components/review-section'
import { EDUCATION_ROWS, FAMILY_ROWS, formatDateDisplay, yesNoLabel } from '../form-utils'
import type { ApplicantFormValues } from '../types'

export function SummarySection({ values }: { values: ApplicantFormValues }) {
  const filledInformalEducation = values.informalEducation
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => Object.values(row).some((v) => v && v.trim()))

  const filledWorkExperience = values.workExperience
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => Object.values(row).some((v) => v && v.trim()))

  const filledReferences = values.references
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => Object.values(row).some((v) => v && v.trim()))

  const driverLicenseSummary = [
    values.driverLicense?.simA && 'SIM A',
    values.driverLicense?.simB && 'SIM B',
    values.driverLicense?.simC && 'SIM C',
    values.driverLicense?.sio && 'SIO',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-6">
      <ReviewSection icon={UserRound} title="Applicant Information / Informasi Pelamar">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReviewItem label="Full Name" value={values.fullName} />
          <ReviewItem label="Nickname" value={values.nickname} />
          <ReviewItem label="Email" value={values.email} />
          <ReviewItem label="Mobile" value={values.mobile} />
          <ReviewItem label="City" value={values.city} />
          <ReviewItem
            label="Place, Date of Birth"
            value={[values.birthPlace, formatDateDisplay(values.birthDate)]
              .filter(Boolean)
              .join(', ')}
          />
          <ReviewItem label="Blood Type" value={values.bloodType} />
          <ReviewItem label="ID Number" value={values.idNumber} />
          <ReviewItem label="Tax ID" value={values.taxId} />
          <ReviewItem label="Position Applied" value={values.positionApplied} />
          <ReviewItem
            label="Working Available Date"
            value={formatDateDisplay(values.workingAvailableDate)}
          />
          <ReviewItem label="Marital Status" value={values.maritalStatus} />
          <ReviewItem label="Religion" value={values.religion} />
          <ReviewItem label="Height & Weight" value={values.heightWeight} />
          <ReviewItem label="T-Shirt Size" value={values.tshirtSize} />
          <ReviewItem label="Driver's License" value={driverLicenseSummary} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewItem label="Address as per ID Card" value={values.addressIdCard} />
          <ReviewItem label="Present Address" value={values.presentAddress} />
          <ReviewItem
            label="Emergency Contact"
            value={values.emergencyContactInfo}
          />
        </div>
      </ReviewSection>

      <ReviewSection
        icon={GraduationCap}
        title="Educational Background / Latar Belakang Pendidikan"
      >
        <div className="space-y-3">
          {EDUCATION_ROWS.map((row, i) => {
            const v = values.education[row.key]
            return (
              <EntryCard key={row.key} index={i + 1} label={row.label} columns={5}>
                <ReviewItem label="Name of School" value={v.schoolName} />
                <ReviewItem label="Location" value={v.location} />
                <ReviewItem label="Graduate" value={v.graduate} />
                <ReviewItem label="Major" value={v.major} />
                <ReviewItem label="Graduation Year" value={v.graduationYear} />
              </EntryCard>
            )
          })}
        </div>
      </ReviewSection>

      <ReviewSection
        icon={Award}
        title="Informal Education and Special Qualification / Pendidikan Informal dan Keterampilan Khusus"
      >
        {filledInformalEducation.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Belum ada data pelatihan tambahan.
          </p>
        ) : (
          <div className="space-y-3">
            {filledInformalEducation.map(({ row, index }) => (
              <EntryCard
                key={index}
                index={index + 1}
                label={`Pelatihan / Keterampilan ${index + 1}`}
                columns={5}
              >
                <ReviewItem
                  label="Type of Training/ Name of Skill"
                  value={row.trainingName}
                />
                <ReviewItem label="Institution's Name" value={row.institutionName} />
                <ReviewItem label="Location" value={row.location} />
                <ReviewItem label="Certification" value={row.certification} />
                <ReviewItem label="Periode" value={row.period} />
              </EntryCard>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection icon={UsersRound} title="Family Background / Latar Belakang Keluarga">
        <div className="space-y-3">
          {FAMILY_ROWS.map((row, i) => {
            const v = values.family[row.key]
            return (
              <EntryCard key={row.key} index={i + 1} label={row.label} columns={4}>
                <ReviewItem label="Name" value={v.name} />
                <ReviewItem label="Age" value={v.age} />
                <ReviewItem label="Employment" value={v.employment} />
                <ReviewItem
                  label="Emergency Contact Number"
                  value={v.emergencyContact}
                />
              </EntryCard>
            )
          })}
        </div>
      </ReviewSection>

      <ReviewSection icon={Briefcase} title="Working Experiences / Pengalaman Kerja">
        {filledWorkExperience.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Belum ada data pengalaman kerja.
          </p>
        ) : (
          <div className="space-y-3">
            {filledWorkExperience.map(({ row, index }) => (
              <EntryCard
                key={index}
                index={index + 1}
                label={`Pengalaman Kerja ${index + 1}`}
                columns={3}
              >
                <ReviewItem label="Name of Company" value={row.companyName} />
                <ReviewItem label="Date From" value={formatDateDisplay(row.dateFrom)} />
                <ReviewItem
                  label="Date Final"
                  value={formatDateDisplay(row.dateFinal)}
                />
                <ReviewItem label="Pay of Salary" value={row.salary} />
                <ReviewItem label="Name of Supervisor" value={row.supervisorName} />
                <ReviewItem label="Reason for Leaving" value={row.reasonForLeaving} />
              </EntryCard>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection icon={Contact} title="References / Referensi">
        {filledReferences.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Belum ada data referensi.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filledReferences.map(({ row, index }) => (
              <EntryCard
                key={index}
                index={index + 1}
                label={`Referensi ${index + 1}`}
                columns={3}
              >
                <ReviewItem label="Name" value={row.name} />
                <ReviewItem label="Position" value={row.position} />
                <ReviewItem label="Phone" value={row.phone} />
              </EntryCard>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection icon={ShieldQuestion} title="Please select one of the following answers">
        <div className="grid gap-3 sm:grid-cols-3">
          <ReviewItem
            label="Pernah terlibat tindakan kriminal?"
            value={yesNoLabel(values.hasCriminalRecord)}
          />
          <ReviewItem
            label="Pernah menggunakan narkotika/zat terlarang?"
            value={yesNoLabel(values.hasUsedDrugs)}
          />
          <ReviewItem
            label="Bersedia ditempatkan di lokasi mana pun?"
            value={yesNoLabel(values.willingToRelocate)}
          />
        </div>
      </ReviewSection>

      <ReviewSection icon={FileSignature} title="Certification">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewItem label="Signature of Applicant" value={values.applicantSignature} />
          <ReviewItem label="Date" value={formatDateDisplay(values.signatureDate)} />
        </div>
      </ReviewSection>
    </div>
  )
}
