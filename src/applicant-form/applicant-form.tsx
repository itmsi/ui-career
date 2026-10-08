import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Send } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormProvider,
  get,
  useForm,
  type FieldErrors,
  type FieldPath,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'
import { VIDEO_INTERVIEW_ENABLED } from '@/video-interview/config'

import { submitApplicantForm, type InvitationVerifyResponse } from './api'
import { FormNav } from './components/form-nav'
import { PendingUploadDialog } from './components/pending-upload-dialog'
import { DRAFT_STORAGE_KEY, STEP_STORAGE_KEY, loadDraftStep, loadDraftValues } from './form-utils'
import { AdditionalDocumentsSection } from './sections/additional-documents'
import { ApplicantInformationSection } from './sections/applicant-information'
import { EducationalBackgroundSection } from './sections/educational-background'
import { FamilyBackgroundSection } from './sections/family-background'
import { InformalEducationSection } from './sections/informal-education'
import { ReferencesSection } from './sections/references'
import { ScreeningQuestionsSection } from './sections/screening-questions'
import { SignatureSection } from './sections/signature'
import { SummarySection } from './sections/summary'
import { VideoInterviewSection } from './sections/video-interview'
import { WorkingExperiencesSection } from './sections/working-experiences'
import { PendingUploadsContext, type PendingUploadRegistry } from './pending-uploads'
import { applicantFormSchema } from './schema'
import { defaultValues, type ApplicantFormValues } from './types'

type FormStep = {
  title: string
  description: string
  /** Fields validated before the applicant may leave this step. */
  fields: FieldPath<ApplicantFormValues>[]
  content: React.ReactNode
  blocked?: boolean
  locksPrevious?: boolean
}

/** Kept as data rather than text so a shown error follows the language switcher. */
type SubmitError = { kind: 'incomplete' } | { kind: 'failed'; serverMessage?: string }

export function ApplicantForm({
  token,
  invitation,
}: {
  token: string
  invitation: InvitationVerifyResponse
}) {
  const form = useForm<ApplicantFormValues>({
    resolver: zodResolver(applicantFormSchema),
    defaultValues: {
      ...loadDraftValues(),
      // Identity fields come from the invitation, not the applicant, so they always
      // win over whatever a stale local draft happened to have.
      ...(invitation.full_name ? { fullName: invitation.full_name } : {}),
      ...(invitation.email ? { email: invitation.email } : {}),
      ...(invitation.no_mobile ? { mobile: invitation.no_mobile } : {}),
    },
    mode: 'onTouched',
  })
  const {
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { isSubmitting },
  } = form
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<SubmitError | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [storedStep, setStep] = useState(loadDraftStep)
  const [navMode, setNavMode] = useState<'rail' | 'bar'>('rail')
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [interviewTotal, setInterviewTotal] = useState<number | null>(null)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Files picked but not uploaded yet, registered by the upload fields of the current step.
  const [pendingUploads] = useState(() => {
    const entries = new Map<string, { label: string; cancel: () => void }>()
    const set: PendingUploadRegistry['set'] = (key, entry) => {
      if (entry) entries.set(key, entry)
      else entries.delete(key)
    }
    return { entries, set }
  })
  const [leaveRequest, setLeaveRequest] = useState<{
    labels: string[]
    proceed: () => void
  } | null>(null)

  useEffect(() => {
    const subscription = watch((values) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        try {
          window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values))
          setLastSavedAt(new Date())
        } catch {
          // ignore write failures (private browsing / storage full)
        }
      }, 300)
    })
    return () => {
      subscription.unsubscribe()
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [watch])

  useEffect(() => {
    try {
      window.localStorage.setItem(STEP_STORAGE_KEY, String(storedStep))
    } catch {
      // ignore write failures (private browsing / storage full)
    }
  }, [storedStep])

  const onSubmit = async (data: ApplicantFormValues) => {
    setSubmitError(null)
    try {
      await submitApplicantForm(token, data)
    } catch (error) {
      setSubmitError({
        kind: 'failed',
        serverMessage: error instanceof ApiError ? error.message : undefined,
      })
      return
    }

    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY)
      window.localStorage.removeItem(STEP_STORAGE_KEY)
    } catch {
      // ignore
    }
    reset(defaultValues)
    setStep(0)
    setInterviewTotal(null)
    setInterviewStarted(false)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reviewValues = watch()
  const interviewAnswerCount = reviewValues.applicantFormContents?.length ?? 0
  const interviewComplete = interviewTotal !== null && interviewAnswerCount >= interviewTotal

  const interviewSteps: FormStep[] = VIDEO_INTERVIEW_ENABLED
    ? [
        {
          title: t('steps.videoInterview.title'),
          description: t('steps.videoInterview.description'),
          fields: ['applicantFormContents'],
          blocked: !interviewComplete,
          locksPrevious: interviewStarted || interviewAnswerCount > 0,
          content: (
            <VideoInterviewSection
              token={token}
              fullName={reviewValues.fullName || invitation.full_name}
              onQuestionCount={setInterviewTotal}
              onStarted={() => setInterviewStarted(true)}
            />
          ),
        },
      ]
    : []

  const steps: FormStep[] = [
    {
      title: t('steps.applicantInformation.title'),
      description: t('steps.applicantInformation.description'),
      fields: [
        'fullName',
        'nickname',
        'addressIdCard',
        'presentAddress',
        'mobile',
        'emergencyContactInfo',
        'birthPlace',
        'birthDate',
        'email',
        'bloodType',
        'idNumber',
        'positionApplied',
        'workingAvailableDate',
        'maritalStatus',
        'religion',
        'heightWeight',
        'tshirtSize',
        'taxId',
        'city',
        'driverLicense',
      ],
      content: <ApplicantInformationSection />,
    },
    {
      title: t('steps.educationalHistory.title'),
      description: t('steps.educationalHistory.description'),
      fields: ['lastEducation', 'education'],
      content: <EducationalBackgroundSection />,
    },
    {
      title: t('steps.informalEducation.title'),
      description: t('steps.informalEducation.description'),
      fields: ['informalEducation'],
      content: <InformalEducationSection />,
    },
    {
      title: t('steps.familyBackground.title'),
      description: t('steps.familyBackground.description'),
      fields: ['family'],
      content: <FamilyBackgroundSection />,
    },
    {
      title: t('steps.workingExperiences.title'),
      description: t('steps.workingExperiences.description'),
      fields: ['workExperience'],
      content: <WorkingExperiencesSection />,
    },
    {
      title: t('steps.references.title'),
      description: t('steps.references.description'),
      fields: ['references'],
      content: <ReferencesSection />,
    },
    {
      title: t('steps.screening.title'),
      description: t('steps.screening.description'),
      fields: ['hasCriminalRecord', 'hasUsedDrugs', 'willingToRelocate'],
      content: <ScreeningQuestionsSection />,
    },
    {
      title: t('steps.additionalDocuments.title'),
      description: t('steps.additionalDocuments.description'),
      fields: ['cvDocument', 'photoDocument', 'additionalDocuments'],
      content: <AdditionalDocumentsSection token={token} />,
    },
    {
      title: t('steps.signature.title'),
      description: t('steps.signature.description'),
      fields: ['applicantSignature', 'signatureLink', 'signatureDate'],
      content: <SignatureSection token={token} />,
    },
    ...interviewSteps,
    {
      title: t('steps.review.title'),
      description: t('steps.review.description'),
      fields: [],
      content: <SummarySection values={reviewValues} />,
    },
  ]

  const step = Math.min(storedStep, steps.length - 1)
  const isFirstStep = step === 0
  const isLastStep = step === steps.length - 1
  const current = steps[step]
  const lockedFrom = steps.findIndex(({ locksPrevious }) => locksPrevious)
  const isBackLocked = lockedFrom !== -1 && step >= lockedFrom

  function isStepDisabled(index: number) {
    return isBackLocked && index < step
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validateStep(index: number) {
    const { fields, blocked } = steps[index]
    if (blocked) return Promise.resolve(false)
    return fields.length ? trigger(fields, { shouldFocus: true }) : Promise.resolve(true)
  }

  /** Runs `proceed` right away, or first asks to drop files that were picked but not uploaded. */
  function guardLeave(proceed: () => void) {
    const labels = [...pendingUploads.entries.values()].map(({ label }) => label)
    if (labels.length === 0) {
      proceed()
      return
    }
    setLeaveRequest({ labels, proceed })
  }

  function discardPendingUploadsAndLeave() {
    if (!leaveRequest) return
    for (const { cancel } of pendingUploads.entries.values()) cancel()
    pendingUploads.entries.clear()
    setLeaveRequest(null)
    leaveRequest.proceed()
  }

  async function goNext() {
    if (!(await validateStep(step))) return
    setStep((s) => Math.min(s + 1, steps.length - 1))
    scrollToTop()
  }

  function handleNext() {
    guardLeave(() => void goNext())
  }

  function handleBack() {
    if (isBackLocked) return
    guardLeave(() => setStep((s) => Math.max(s - 1, 0)))
  }

  function handleStepClick(index: number) {
    if (index === step || isStepDisabled(index)) return
    guardLeave(() => void goToStep(index))
  }

  async function goToStep(index: number) {
    // Going forward must not skip past an incomplete step, so check every step
    // in between and stop at the first one that still has errors.
    for (let i = step; i < index; i++) {
      if (!(await validateStep(i))) {
        setStep(i)
        return
      }
    }
    setStep(index)
    scrollToTop()
  }

  function onInvalid(errors: FieldErrors<ApplicantFormValues>) {
    const firstInvalidStep = steps.findIndex(({ fields }) =>
      fields.some((name) => get(errors, name)),
    )
    setSubmitError({ kind: 'incomplete' })
    toast.error(t('form.incomplete'))
    if (firstInvalidStep === -1) return
    setStep(firstInvalidStep)
    scrollToTop()
    // Re-run the step's validation once its fields are mounted so the first
    // invalid input receives focus.
    setTimeout(() => void validateStep(firstInvalidStep))
  }

  if (submitted) {
    return (
      <div className="relative mx-auto flex h-svh w-full max-w-md items-center p-4 sm:p-6">
        <LanguageSwitcher className="absolute top-4 right-4" />
        <Card className="w-full">
          <CardHeader className="px-8 py-6">
            <CardTitle>{t('form.submittedTitle')}</CardTitle>
            <CardDescription>{t('form.submittedDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <FormProvider {...form}>
        <PendingUploadsContext.Provider value={pendingUploads}>
          <form
            noValidate
            // Submission only happens through the explicit "Kirim Lamaran" click, so
            // pressing Enter in an input or a stray submit can never send the form.
            onSubmit={(event) => event.preventDefault()}
            className={cn('flex min-h-0 flex-1 flex-col', navMode === 'rail' && 'lg:flex-row')}
          >
            <FormNav
              steps={steps}
              currentStep={step}
              onStepClick={handleStepClick}
              isStepDisabled={isStepDisabled}
              mode={navMode}
              collapsed={navCollapsed}
              onModeChange={setNavMode}
              onToggleCollapse={() => setNavCollapsed((c) => !c)}
            />

            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-primary">
                    {t('form.stepCounter', {
                      current: String(step + 1).padStart(2, '0'),
                      total: String(steps.length).padStart(2, '0'),
                    })}
                  </span>
                  <LanguageSwitcher />
                </div>
                <CardTitle className="mt-3 mb-1.5 text-[32px] leading-[0.98] sm:text-[44px]">
                  {current.title}
                </CardTitle>
                {current.description && (
                  <CardDescription className="mb-7 max-w-[58ch] text-[13px] leading-relaxed">
                    {current.description}
                  </CardDescription>
                )}

                {current.content}

                {submitError ? (
                  <p className="mt-6 border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {submitError.kind === 'incomplete'
                      ? t('form.incomplete')
                      : (submitError.serverMessage ?? t('form.submitFailed'))}
                  </p>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-border px-6 py-5 sm:px-10">
                <div className="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isFirstStep || isBackLocked}
                  >
                    {t('form.back')}
                  </Button>

                  <div className="flex items-center gap-4">
                    <span className="hidden text-[11px] font-semibold text-muted-foreground/70 sm:inline">
                      {current.blocked
                        ? t('form.interviewPending')
                        : lastSavedAt
                          ? t('form.savedAt', { time: format(lastSavedAt, 'HH:mm') })
                          : t('form.notSaved')}
                    </span>

                    {/* Distinct keys stop React from reusing the "Lanjut" <button> as the
                        submit button, which would let the very click that opens the review
                        step also send the form. */}
                    {isLastStep ? (
                      <Button
                        key="submit"
                        type="button"
                        onClick={handleSubmit(onSubmit, onInvalid)}
                        disabled={isSubmitting}
                      >
                        <Send className="size-4" />
                        {isSubmitting ? t('form.submitting') : t('form.submit')}
                      </Button>
                    ) : (
                      <Button
                        key="next"
                        type="button"
                        onClick={handleNext}
                        disabled={current.blocked}
                      >
                        {t('form.next')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </form>
        </PendingUploadsContext.Provider>
      </FormProvider>

      <PendingUploadDialog
        labels={leaveRequest?.labels ?? []}
        onStay={() => setLeaveRequest(null)}
        onDiscard={discardPendingUploadsAndLeave}
      />
    </div>
  )
}
