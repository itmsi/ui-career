import { useEffect, useRef, useState } from 'react'
import {
  Award,
  Briefcase,
  ClipboardCheck,
  Contact,
  FileSignature,
  GraduationCap,
  Printer,
  Send,
  ShieldQuestion,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError } from '@/lib/api-client'

import { submitApplicantForm } from './api'
import { SectionHeading } from './components/section-heading'
import { StepIndicator } from './components/step-indicator'
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
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const subscription = watch((values) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        try {
          window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values))
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
    icon: LucideIcon
    content: React.ReactNode
  }> = [
    {
      title: 'Applicant Information',
      description: 'Informasi Pelamar',
      icon: UserRound,
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
      icon: GraduationCap,
      content: <EducationalBackgroundSection register={register} />,
    },
    {
      title: 'Informal Education and Special Qualification',
      description: 'Pendidikan Informal dan Keterampilan Khusus',
      icon: Award,
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
      icon: UsersRound,
      content: <FamilyBackgroundSection register={register} />,
    },
    {
      title: 'Working Experiences',
      description: 'Pengalaman Kerja',
      icon: Briefcase,
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
      icon: Contact,
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
      icon: ShieldQuestion,
      content: <ScreeningQuestionsSection control={control} />,
    },
    {
      title: 'Certification',
      description:
        'I certified that that all answer given herein are true and complete to the best of my knowledge',
      icon: FileSignature,
      content: <CertificationSection register={register} control={control} />,
    },
    {
      title: 'Review & Ringkasan',
      description: 'Periksa kembali seluruh data sebelum mengirim lamaran',
      icon: ClipboardCheck,
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
        <Card className="border-l-4 border-l-primary shadow-2xl shadow-black/10">
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
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <Card className="border-l-4 border-l-primary shadow-2xl shadow-black/10">
        <CardHeader className="px-4 pt-4 sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Careers at Motor Sights International
          </p>
          <CardTitle className="text-xl sm:text-2xl">Applicant Form</CardTitle>
          <CardDescription>Formulir Lamaran Pekerjaan</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <StepIndicator
            steps={steps}
            currentStep={step}
            onStepClick={handleStepClick}
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-l-4 border-l-primary shadow-2xl shadow-black/10">
          <CardHeader className="px-8 mt-4">
            <SectionHeading
              icon={current.icon}
              title={current.title}
              description={current.description}
            />
          </CardHeader>
          <CardContent className="p-8">{current.content}</CardContent>
        </Card>

        {submitError ? (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {submitError}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 rounded-xl border bg-background/85 p-3 shadow-lg backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep}
          >
            Kembali
          </Button>

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
      </form>
    </div>
  )
}
