import {
  Award,
  Briefcase,
  Contact,
  FileSignature,
  FileText,
  GraduationCap,
  Paperclip,
  ShieldQuestion,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { EntryCard } from '../components/entry-card'
import { ReviewItem } from '../components/review-item'
import { ReviewSection } from '../components/review-section'
import {
  captionLabelClass,
  FAMILY_ROWS,
  formatDateDisplay,
  LAST_EDUCATION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  SCREENING_QUESTIONS,
} from '../form-utils'
import type { ApplicantFormValues, YesNo } from '../types'

const isFilled = (row: Record<string, string>) => Object.values(row).some((v) => v && v.trim())

const includes = <T extends string>(options: readonly T[], value: string): value is T =>
  (options as readonly string[]).includes(value)

export function SummarySection({ values }: { values: ApplicantFormValues }) {
  const { t } = useTranslation()

  const yesNo = (value: YesNo) =>
    value === 'yes' ? t('common.yes') : value === 'no' ? t('common.no') : ''
  const maritalStatus = includes(MARITAL_STATUS_OPTIONS, values.maritalStatus)
    ? t(`options.maritalStatus.${values.maritalStatus}`)
    : values.maritalStatus
  const religion = includes(RELIGION_OPTIONS, values.religion)
    ? t(`options.religion.${values.religion}`)
    : values.religion
  const lastEducation = includes(LAST_EDUCATION_OPTIONS, values.lastEducation)
    ? t(`options.lastEducation.${values.lastEducation}`)
    : values.lastEducation

  const filledInformalEducation = values.informalEducation
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => isFilled(row))
  const filledWorkExperience = values.workExperience
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => isFilled(row))
  const filledReferences = values.references
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => isFilled(row))
  const uploadedDocuments = [
    values.cvDocument,
    values.photoDocument,
    ...values.additionalDocuments,
  ].filter(
    (doc) => doc.file,
  )

  return (
    <div className="space-y-6">
      <ReviewSection icon={UserRound} title={t('steps.applicantInformation.title')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReviewItem label={t('fields.fullName')} value={values.fullName} />
          <ReviewItem label={t('fields.nickname')} value={values.nickname} />
          <ReviewItem label={t('fields.email')} value={values.email} />
          <ReviewItem label={t('fields.mobile')} value={values.mobile} />
          <ReviewItem
            label={t('summary.placeDateOfBirth')}
            value={[values.birthPlace, formatDateDisplay(values.birthDate)]
              .filter(Boolean)
              .join(', ')}
          />
          <ReviewItem label={t('fields.bloodType')} value={values.bloodType} />
          <ReviewItem label={t('fields.idNumber')} value={values.idNumber} />
          <ReviewItem label={t('fields.taxId')} value={values.taxId} />
          <ReviewItem label={t('fields.positionApplied')} value={values.positionApplied} />
          <ReviewItem
            label={t('fields.workingAvailableDate')}
            value={formatDateDisplay(values.workingAvailableDate)}
          />
          <ReviewItem label={t('fields.maritalStatus')} value={maritalStatus} />
          <ReviewItem label={t('fields.religion')} value={religion} />
          <ReviewItem label={t('fields.heightWeight')} value={values.heightWeight} />
          <ReviewItem label={t('fields.tshirtSize')} value={values.tshirtSize} />
          <ReviewItem label={t('fields.city')} value={values.city} />
          <ReviewItem label={t('fields.driverLicense')} value={values.driverLicense} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewItem label={t('fields.addressIdCard')} value={values.addressIdCard} />
          <ReviewItem label={t('fields.presentAddress')} value={values.presentAddress} />
          <ReviewItem
            label={t('fields.emergencyContactInfo')}
            value={values.emergencyContactInfo}
          />
        </div>
      </ReviewSection>

      <ReviewSection icon={GraduationCap} title={t('steps.educationalHistory.title')}>
        <EntryCard
          index={1}
          label={
            lastEducation
              ? t('education.cardTitle', { level: lastEducation })
              : t('fields.lastEducation')
          }
          columns={5}
        >
          <ReviewItem label={t('fields.schoolName')} value={values.education.schoolName} />
          <ReviewItem label={t('fields.location')} value={values.education.location} />
          <ReviewItem label={t('fields.graduate')} value={values.education.graduate} />
          <ReviewItem label={t('fields.major')} value={values.education.major} />
          <ReviewItem
            label={t('fields.graduationYear')}
            value={values.education.graduationYear}
          />
        </EntryCard>
      </ReviewSection>

      <ReviewSection icon={Award} title={t('steps.informalEducation.title')}>
        {filledInformalEducation.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{t('summary.emptyInformal')}</p>
        ) : (
          <div className="space-y-3">
            {filledInformalEducation.map(({ row, index }) => (
              <EntryCard
                key={index}
                index={index + 1}
                label={t('informal.cardTitle', { number: index + 1 })}
                columns={5}
              >
                <ReviewItem label={t('fields.trainingName')} value={row.trainingName} />
                <ReviewItem label={t('fields.institutionName')} value={row.institutionName} />
                <ReviewItem label={t('fields.location')} value={row.location} />
                <ReviewItem label={t('fields.certification')} value={row.certification} />
                <ReviewItem label={t('fields.period')} value={row.period} />
              </EntryCard>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection icon={UsersRound} title={t('steps.familyBackground.title')}>
        <div className="space-y-3">
          {FAMILY_ROWS.map((row, i) => {
            const v = values.family[row.key]
            return (
              <EntryCard key={row.key} index={i + 1} label={t(`family.${row.key}`)} columns={4}>
                <ReviewItem label={t('fields.name')} value={v.name} />
                <ReviewItem label={t('fields.age')} value={v.age} />
                <ReviewItem label={t('fields.employment')} value={v.employment} />
                <ReviewItem
                  label={t('fields.emergencyContactNumber')}
                  value={v.emergencyContact}
                />
              </EntryCard>
            )
          })}
        </div>
      </ReviewSection>

      <ReviewSection icon={Briefcase} title={t('steps.workingExperiences.title')}>
        {filledWorkExperience.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{t('summary.emptyWork')}</p>
        ) : (
          <div className="space-y-3">
            {filledWorkExperience.map(({ row, index }) => (
              <EntryCard
                key={index}
                index={index + 1}
                label={t('work.cardTitle', { number: index + 1 })}
                columns={3}
              >
                <ReviewItem label={t('fields.companyName')} value={row.companyName} />
                <ReviewItem label={t('fields.dateFrom')} value={formatDateDisplay(row.dateFrom)} />
                <ReviewItem
                  label={t('fields.dateFinal')}
                  value={formatDateDisplay(row.dateFinal)}
                />
                <ReviewItem label={t('fields.salary')} value={row.salary} />
                <ReviewItem label={t('fields.supervisorName')} value={row.supervisorName} />
                <ReviewItem label={t('fields.reasonForLeaving')} value={row.reasonForLeaving} />
              </EntryCard>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection icon={Contact} title={t('steps.references.title')}>
        {filledReferences.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{t('summary.emptyReferences')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filledReferences.map(({ row, index }) => (
              <EntryCard
                key={index}
                index={index + 1}
                label={t('references.cardTitle', { number: index + 1 })}
                columns={3}
              >
                <ReviewItem label={t('fields.name')} value={row.name} />
                <ReviewItem label={t('fields.position')} value={row.position} />
                <ReviewItem label={t('fields.phone')} value={row.phone} />
              </EntryCard>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection icon={ShieldQuestion} title={t('steps.screening.title')}>
        <div className="grid gap-3 sm:grid-cols-3">
          {SCREENING_QUESTIONS.map(({ name }) => (
            <ReviewItem key={name} label={t(`screening.${name}`)} value={yesNo(values[name])} />
          ))}
        </div>
      </ReviewSection>

      <ReviewSection icon={Paperclip} title={t('steps.additionalDocuments.title')}>
        {uploadedDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{t('summary.emptyDocuments')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedDocuments.map((doc, index) => (
              <a
                key={index}
                href={doc.file}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-input bg-white/70 p-3 transition-colors hover:border-primary/50 dark:bg-input/30"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {doc.file_title}
                </span>
              </a>
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection icon={FileSignature} title={t('steps.signature.title')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={captionLabelClass}>{t('fields.signature')}</p>
            {values.applicantSignature ? (
              <img
                src={values.applicantSignature}
                alt={t('fields.signature')}
                className="mt-1 h-20 max-w-full rounded-md border border-input bg-white/70 object-contain dark:bg-input/30"
              />
            ) : (
              <p className="text-sm font-normal text-muted-foreground italic">
                {t('common.notFilled')}
              </p>
            )}
          </div>
          <ReviewItem
            label={t('fields.signatureDate')}
            value={formatDateDisplay(values.signatureDate)}
          />
        </div>
      </ReviewSection>
    </div>
  )
}
