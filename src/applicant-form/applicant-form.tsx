import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Printer, Send } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'

import { submitApplicantForm } from './api'
import { FormNav } from './components/form-nav'
import { DRAFT_STORAGE_KEY, STEP_STORAGE_KEY, loadDraftStep, loadDraftValues } from './form-utils'
import { ApplicantInformationSection } from './sections/applicant-information'
import { CertificationSection } from './sections/certification'
import { EducationalBackgroundSection } from './sections/educational-background'
import { FamilyBackgroundSection } from './sections/family-background'
import { InformalEducationSection } from './sections/informal-education'
import { ReferencesSection } from './sections/references'
import { ScreeningQuestionsSection } from './sections/screening-questions'
import { SummarySection } from './sections/summary'
import { WorkingExperiencesSection } from './sections/working-experiences'
import {
  defaultValues,
  emptyInformalEducationRow,
  emptyReferenceRow,
  emptyWorkExperienceRow,
  type ApplicantFormValues,
} from './types'

export function ApplicantForm({ token }: { token: string }) {
  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicantFormValues>({
    defaultValues: loadDraftValues(),
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
      title: 'Certification',
      description:
        'I certified that that all answer given herein are true and complete to the best of my knowledge',
      content: <CertificationSection register={register} control={control} />,
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
      return trigger(['fullName', 'email'])
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
      <div className="mx-auto w-full max-w-md p-4 sm:p-6">
        <Card blueprint>
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
    <div className="mx-auto w-full">
      <Card className="gap-0 overflow-hidden py-0 [--card-spacing:0px]">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground/70 uppercase">
            Step indicator
          </span>
          <div className="flex items-center gap-2.5">
            <div className="flex border border-border">
              <button
                type="button"
                onClick={() => setNavMode('rail')}
                className={cn(
                  'px-3 py-1 font-heading text-xs font-semibold tracking-wide uppercase transition-colors',
                  navMode === 'rail'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                Sidebar
              </button>
              <button
                type="button"
                onClick={() => setNavMode('bar')}
                className={cn(
                  'border-l border-border px-3 py-1 font-heading text-xs font-semibold tracking-wide uppercase transition-colors',
                  navMode === 'bar'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                Horizontal
              </button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setNavCollapsed((c) => !c)}
            >
              {navCollapsed ? 'Expand indicator' : 'Minimise indicator'}
            </Button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn('flex', navMode === 'rail' ? 'flex-col lg:flex-row' : 'flex-col')}
        >
          <FormNav
            steps={steps}
            currentStep={step}
            onStepClick={handleStepClick}
            mode={navMode}
            collapsed={navCollapsed}
          />

          <div className="flex min-w-0 flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10">
            <span className="font-mono text-xs font-medium tracking-[0.18em] text-primary uppercase">
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

            <div className="flex-1">{current.content}</div>

            {submitError ? (
              <p className="mt-6 border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-foreground pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isFirstStep}
              >
                Kembali
              </Button>

              <div className="flex items-center gap-4">
                <span className="hidden font-mono text-[11px] text-muted-foreground/70 uppercase sm:inline">
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
        </form>
      </Card>
    </div>
  )
}
