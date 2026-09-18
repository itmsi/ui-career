import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Printer, Send } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'

import { submitApplicantForm, type InvitationVerifyResponse } from './api'
import { FormNav } from './components/form-nav'
import { DRAFT_STORAGE_KEY, STEP_STORAGE_KEY, loadDraftStep, loadDraftValues } from './form-utils'
import { ApplicantInformationSection } from './sections/applicant-information'
import { EducationalBackgroundSection } from './sections/educational-background'
import { FamilyBackgroundSection } from './sections/family-background'
import { InformalEducationSection } from './sections/informal-education'
import { ReferencesSection } from './sections/references'
import { ScreeningQuestionsSection } from './sections/screening-questions'
import { SignatureSection } from './sections/signature'
import { SummarySection } from './sections/summary'
import { WorkingExperiencesSection } from './sections/working-experiences'
import {
  defaultValues,
  emptyInformalEducationRow,
  emptyReferenceRow,
  emptyWorkExperienceRow,
  type ApplicantFormValues,
} from './types'

export function ApplicantForm({
  token,
  invitation,
}: {
  token: string
  invitation: InvitationVerifyResponse
}) {
  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicantFormValues>({
    defaultValues: {
      ...loadDraftValues(),
      // Identity fields come from the invitation, not the applicant, so they always
      // win over whatever a stale local draft happened to have.
      ...(invitation.full_name ? { fullName: invitation.full_name } : {}),
      ...(invitation.email ? { email: invitation.email } : {}),
      ...(invitation.no_mobile ? { mobile: invitation.no_mobile } : {}),
    },
    mode: 'onSubmit',
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const informalEducationArray = useFieldArray({ control, name: 'informalEducation' })
  const workExperienceArray = useFieldArray({ control, name: 'workExperience' })
  const referencesArray = useFieldArray({ control, name: 'references' })
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

  const steps: Array<{
    title: string
    description: string
    content: React.ReactNode
  }> = [
    {
      title: 'Applicant Information',
      description: 'Informasi Pelamar',
      content: (
        <ApplicantInformationSection
          register={register}
          control={control}
          errors={errors}
        />
      ),
    },
    {
      title: 'Educational Background',
      description: 'Latar Belakang Pendidikan',
      content: <EducationalBackgroundSection register={register} />,
    },
    {
      title: 'Informal Education and Special Qualification',
      description: 'Pendidikan Informal dan Keterampilan Khusus',
      content: (
        <InformalEducationSection
          register={register}
          fields={informalEducationArray.fields}
          onAppend={() => informalEducationArray.append({ ...emptyInformalEducationRow })}
          onRemove={(index) => informalEducationArray.remove(index)}
        />
      ),
    },
    {
      title: 'Family Background',
      description: 'Latar Belakang Keluarga',
      content: <FamilyBackgroundSection register={register} />,
    },
    {
      title: 'Working Experiences',
      description: 'Pengalaman Kerja',
      content: (
        <WorkingExperiencesSection
          register={register}
          control={control}
          fields={workExperienceArray.fields}
          onAppend={() => workExperienceArray.append({ ...emptyWorkExperienceRow })}
          onRemove={(index) => workExperienceArray.remove(index)}
        />
      ),
    },
    {
      title: 'References',
      description:
        'Please list at least two references (HR & User) — Sebutkan sedikitnya dua orang referensi (HR & Atasan Langsung)',
      content: (
        <ReferencesSection
          register={register}
          fields={referencesArray.fields}
          onAppend={() => referencesArray.append({ ...emptyReferenceRow })}
          onRemove={(index) => referencesArray.remove(index)}
        />
      ),
    },
    {
      title: 'Please select one of the following answers',
      description: 'Silahkan pilih salah satu jawaban dari pertanyaan berikut',
      content: <ScreeningQuestionsSection control={control} />,
    },
    {
      title: 'Signature',
      description:
        'I certified that that all answer given herein are true and complete to the best of my knowledge',
      content: <SignatureSection control={control} token={token} />,
    },
    {
      title: 'Review & Ringkasan',
      description: 'Periksa kembali seluruh data sebelum mengirim lamaran',
      content: <SummarySection values={reviewValues} />,
    },
  ]

  const isFirstStep = step === 0
  const isLastStep = step === steps.length - 1
  const current = steps[step]

  async function validateCurrentStep() {
    if (step === 0) {
      return trigger(['fullName', 'email', 'workingAvailableDate'])
    }
    return true
  }

  async function handleNext() {
    const valid = await validateCurrentStep()
    if (!valid) return
    setStep((s) => Math.min(s + 1, steps.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleStepClick(index: number) {
    if (index === step) return
    const valid = await validateCurrentStep()
    if (!valid) return
    setStep(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      <form
        onSubmit={handleSubmit(onSubmit)}
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

                {isLastStep ? (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => window.print()}>
                      <Printer className="size-4" />
                      Cetak / Print
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Send className="size-4" />
                      {isSubmitting ? 'Mengirim...' : 'Kirim Lamaran'}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={handleNext}>
                    Lanjut
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </form>
    </div>
  )
}
