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
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'

import { submitApplicantForm, type InvitationVerifyResponse } from './api'
import { FormNav } from './components/form-nav'
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
import { WorkingExperiencesSection } from './sections/working-experiences'
import { applicantFormSchema } from './schema'
import { defaultValues, type ApplicantFormValues } from './types'

type FormStep = {
  title: string
  description: string
  /** Fields validated before the applicant may leave this step. */
  fields: FieldPath<ApplicantFormValues>[]
  content: React.ReactNode
}

const INCOMPLETE_FORM_MESSAGE =
  'Masih ada data wajib yang belum lengkap atau tidak valid. Silakan periksa kembali.'

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
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(loadDraftStep)
  const [navMode, setNavMode] = useState<'rail' | 'bar'>('rail')
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      window.localStorage.setItem(STEP_STORAGE_KEY, String(step))
    } catch {
      // ignore write failures (private browsing / storage full)
    }
  }, [step])

  const onSubmit = async (data: ApplicantFormValues) => {
    setSubmitError(null)
    try {
      await submitApplicantForm(token, data)
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Gagal mengirim lamaran. Silakan coba lagi.',
      )
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
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reviewValues = watch()

  const steps: FormStep[] = [
    {
      title: 'Applicant Information',
      description: 'Informasi Pelamar',
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
      title: 'Educational History',
      description: 'Latar Belakang Pendidikan',
      fields: ['lastEducation', 'education'],
      content: <EducationalBackgroundSection />,
    },
    {
      title: 'Informal Education and Special Qualification',
      description: 'Pendidikan Informal dan Keterampilan Khusus',
      fields: ['informalEducation'],
      content: <InformalEducationSection />,
    },
    {
      title: 'Family Background',
      description: 'Latar Belakang Keluarga',
      fields: ['family'],
      content: <FamilyBackgroundSection />,
    },
    {
      title: 'Working Experiences',
      description: 'Pengalaman Kerja / Magang — pengalaman kerja / magang 1 wajib diisi',
      fields: ['workExperience'],
      content: <WorkingExperiencesSection />,
    },
    {
      title: 'References',
      description:
        'Please list your references (HR & User) — Sebutkan referensi Anda (HR & Atasan Langsung); referensi 1 wajib diisi',
      fields: ['references'],
      content: <ReferencesSection />,
    },
    {
      title: 'Please select one of the following answers',
      description: 'Silahkan pilih salah satu jawaban dari pertanyaan berikut (wajib diisi)',
      fields: ['hasCriminalRecord', 'hasUsedDrugs', 'willingToRelocate'],
      content: <ScreeningQuestionsSection />,
    },
    {
      title: 'Additional Document',
      description:
        'Unggah dokumen pendukung tambahan (opsional) / Upload additional supporting documents (optional)',
      fields: ['additionalDocuments'],
      content: <AdditionalDocumentsSection token={token} />,
    },
    {
      title: 'Signature',
      description:
        'I certified that that all answer given herein are true and complete to the best of my knowledge',
      fields: ['applicantSignature', 'signatureLink', 'signatureDate'],
      content: <SignatureSection token={token} />,
    },
    {
      title: 'Review & Ringkasan',
      description: 'Periksa kembali seluruh data sebelum mengirim lamaran',
      fields: [],
      content: <SummarySection values={reviewValues} />,
    },
  ]

  const isFirstStep = step === 0
  const isLastStep = step === steps.length - 1
  const current = steps[step]

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validateStep(index: number) {
    const { fields } = steps[index]
    return fields.length ? trigger(fields, { shouldFocus: true }) : Promise.resolve(true)
  }

  async function handleNext() {
    if (!(await validateStep(step))) return
    setStep((s) => Math.min(s + 1, steps.length - 1))
    scrollToTop()
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleStepClick(index: number) {
    if (index === step) return
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
    setSubmitError(INCOMPLETE_FORM_MESSAGE)
    toast.error(INCOMPLETE_FORM_MESSAGE)
    if (firstInvalidStep === -1) return
    setStep(firstInvalidStep)
    scrollToTop()
    // Re-run the step's validation once its fields are mounted so the first
    // invalid input receives focus.
    setTimeout(() => void validateStep(firstInvalidStep))
  }

  if (submitted) {
    return (
      <div className="mx-auto flex h-svh w-full max-w-md items-center p-4 sm:p-6">
        <Card className="w-full">
          <CardHeader className="px-8 py-6">
            <CardTitle>Lamaran Terkirim</CardTitle>
            <CardDescription>
              Terima kasih, lamaran Anda sudah kami terima. Tim kami akan menghubungi Anda
              apabila diperlukan.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <FormProvider {...form}>
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
            mode={navMode}
            collapsed={navCollapsed}
            onModeChange={setNavMode}
            onToggleCollapse={() => setNavCollapsed((c) => !c)}
          />

          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
              <span className="text-xs font-semibold text-primary">
                Step {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
              </span>
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
                  {submitError}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-border px-6 py-5 sm:px-10">
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isFirstStep}
                >
                  Kembali
                </Button>

                <div className="flex items-center gap-4">
                  <span className="hidden text-[11px] font-semibold text-muted-foreground/70 sm:inline">
                    {lastSavedAt ? `Tersimpan ${format(lastSavedAt, 'HH:mm')}` : 'Draf belum tersimpan'}
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
                      {isSubmitting ? 'Mengirim...' : 'Kirim Lamaran'}
                    </Button>
                  ) : (
                    <Button key="next" type="button" onClick={handleNext}>
                      Lanjut
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </form>
      </FormProvider>
    </div>
  )
}
