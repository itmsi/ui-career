import { Fragment, useEffect, useRef, useState } from 'react'
import { format, isValid, parse, parseISO } from 'date-fns'
import {
  Award,
  Briefcase,
  CalendarIcon,
  Check,
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
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type EducationRow = {
  schoolName: string
  location: string
  graduate: string
  major: string
  graduationYear: string
}

type InformalEducationRow = {
  trainingName: string
  institutionName: string
  location: string
  certification: string
  period: string
}

type FamilyRow = {
  name: string
  age: string
  employment: string
  emergencyContact: string
}

type WorkExperienceRow = {
  companyName: string
  dateFrom: string
  dateFinal: string
  salary: string
  supervisorName: string
  reasonForLeaving: string
}

type ReferenceRow = {
  name: string
  position: string
  phone: string
}

type YesNo = '' | 'yes' | 'no'

type ApplicantFormValues = {
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

const defaultValues: ApplicantFormValues = {
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
  informalEducation: Array.from({ length: 4 }, () => ({
    trainingName: '',
    institutionName: '',
    location: '',
    certification: '',
    period: '',
  })),
  family: {
    father: { ...emptyFamilyRow },
    mother: { ...emptyFamilyRow },
    spouse: { ...emptyFamilyRow },
    child1: { ...emptyFamilyRow },
    child2: { ...emptyFamilyRow },
    child3: { ...emptyFamilyRow },
    child4: { ...emptyFamilyRow },
  },
  workExperience: Array.from({ length: 6 }, () => ({
    companyName: '',
    dateFrom: '',
    dateFinal: '',
    salary: '',
    supervisorName: '',
    reasonForLeaving: '',
  })),
  references: [
    { name: '', position: '', phone: '' },
    { name: '', position: '', phone: '' },
  ],
  hasCriminalRecord: '',
  hasUsedDrugs: '',
  willingToRelocate: '',
  applicantSignature: '',
  signatureDate: '',
}

type ApplicantForm = ReturnType<typeof useForm<ApplicantFormValues>>
type RegisterFn = ApplicantForm['register']

const DRAFT_STORAGE_KEY = 'applicant-form:draft'
const STEP_STORAGE_KEY = 'applicant-form:step'

function loadDraftValues(): ApplicantFormValues {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return defaultValues
    return { ...defaultValues, ...JSON.parse(raw) }
  } catch {
    return defaultValues
  }
}

function loadDraftStep(): number {
  try {
    const raw = window.localStorage.getItem(STEP_STORAGE_KEY)
    return raw ? Number(raw) || 0 : 0
  } catch {
    return 0
  }
}

const captionLabelClass =
  'text-[11px] font-semibold tracking-wide text-muted-foreground'
const inputHeightClass = 'h-10 rounded-lg'

function EntryInput({
  name,
  register,
  type = 'text',
  placeholder,
}: {
  name: FieldPath<ApplicantFormValues>
  register: RegisterFn
  type?: string
  placeholder?: string
}) {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      className={inputHeightClass}
      {...register(name)}
    />
  )
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
    </div>
  )
}

function EntryCard({
  index,
  label,
  columns = 3,
  children,
}: {
  index: number
  label: string
  columns?: 3 | 4 | 5
  children: React.ReactNode
}) {
  const gridColsClass =
    columns === 5
      ? 'sm:grid-cols-2 lg:grid-cols-5'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 transition-colors hover:border-border hover:bg-muted/30">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {index}
        </span>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div className={cn('grid gap-3', gridColsClass)}>{children}</div>
    </div>
  )
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className={captionLabelClass}>{label}</p>
      <p className="text-sm font-medium whitespace-pre-line text-foreground">
        {value && value.trim() ? (
          value
        ) : (
          <span className="font-normal text-muted-foreground italic">
            Belum diisi
          </span>
        )}
      </p>
    </div>
  )
}

function ReviewSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function yesNoLabel(value: YesNo) {
  if (value === 'yes') return 'Ya'
  if (value === 'no') return 'Tidak'
  return ''
}

function formatDateDisplay(value?: string) {
  if (!value) return ''
  const parsed = parseISO(value)
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : value
}

function clampDateSegment(segment: string, max: number) {
  if (segment.length < 2) return segment
  const num = Number(segment)
  if (num === 0) return '01'
  if (num > max) return String(max).padStart(2, '0')
  return segment
}

function maskDateInput(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  const day = clampDateSegment(digits.slice(0, 2), 31)
  const month = clampDateSegment(digits.slice(2, 4), 12)
  const year = digits.slice(4, 8)
  return [day, month, year].filter(Boolean).join('/')
}

function DatePickerField({
  name,
  control,
  placeholder = 'dd/mm/yyyy',
  className,
  id,
}: {
  name: FieldPath<ApplicantFormValues>
  control: Control<ApplicantFormValues>
  placeholder?: string
  className?: string
  id?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DatePickerInput
          id={id}
          placeholder={placeholder}
          className={className}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  )
}

function DatePickerInput({
  id,
  placeholder,
  className,
  value,
  onChange,
  onBlur,
}: {
  id?: string
  placeholder: string
  className?: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const [open, setOpen] = useState(false)

  const parsedValue = value ? parseISO(value) : undefined
  const selectedDate = parsedValue && isValid(parsedValue) ? parsedValue : undefined

  const [text, setText] = useState(
    selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '',
  )

  useEffect(() => {
    setText(selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '')
    // Only resync from the outside (calendar pick, draft load); typing is
    // tracked purely in local state until it resolves to a valid date.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function commitText(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) {
      onChange('')
      return
    }
    const parsed = parse(trimmed, 'dd/MM/yyyy', new Date())
    if (isValid(parsed)) {
      onChange(format(parsed, 'yyyy-MM-dd'))
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Input
        id={id}
        inputMode="numeric"
        maxLength={10}
        placeholder={placeholder}
        className={cn(inputHeightClass, 'pr-9')}
        value={text}
        onChange={(e) => {
          let masked = maskDateInput(e.target.value)
          if (masked === text && e.target.value.length < text.length) {
            // Backspace only removed a "/" separator (digits unchanged after
            // stripping), so drop the digit right before it too.
            masked = maskDateInput(text.replace(/\D/g, '').slice(0, -1))
          }
          setText(masked)
          if (masked.length === 10) commitText(masked)
        }}
        onBlur={(e) => {
          commitText(e.target.value)
          onBlur()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commitText(e.currentTarget.value)
            e.currentTarget.blur()
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label="Pilih tanggal"
              className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <CalendarIcon className="size-4" />
            </button>
          }
        />
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, 'yyyy-MM-dd'))
                setText(format(date, 'dd/MM/yyyy'))
              } else {
                onChange('')
                setText('')
              }
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function YesNoQuestion({
  question,
  name,
  control,
}: {
  question: string
  name: FieldPath<ApplicantFormValues>
  control: Control<ApplicantFormValues>
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 transition-colors hover:border-border sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="text-sm">{question}</p>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup
            value={(field.value as string) || ''}
            onValueChange={field.onChange}
            className="grid w-auto grid-flow-col gap-4"
          >
            <Label className="flex items-center gap-1.5 text-sm">
              <RadioGroupItem value="yes" />
              Ya
            </Label>
            <Label className="flex items-center gap-1.5 text-sm">
              <RadioGroupItem value="no" />
              Tidak
            </Label>
          </RadioGroup>
        )}
      />
    </div>
  )
}

function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: Array<{ title: string; icon: LucideIcon }>
  currentStep: number
  onStepClick: (index: number) => void
}) {
  return (
    <div className="flex w-full items-center overflow-x-auto px-1 py-6 sm:p-8">
      {steps.map((s, index) => {
        const isDone = index < currentStep
        const isCurrent = index === currentStep
        const isReachable = index <= currentStep

        return (
          <Fragment key={s.title}>
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => onStepClick(index)}
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors sm:size-8 sm:text-xs',
                isDone && 'bg-primary text-primary-foreground',
                isCurrent &&
                  'bg-primary text-primary-foreground ring-2 ring-primary/20 sm:ring-4',
                !isDone && !isCurrent && 'bg-muted text-muted-foreground',
                isReachable && !isCurrent && 'cursor-pointer hover:opacity-80',
                !isReachable && 'cursor-not-allowed',
              )}
            >
              {isDone ? <Check className="size-3 sm:size-4" /> : index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 min-w-2 flex-1 sm:min-w-4',
                  index < currentStep
                    ? 'bg-primary'
                    : 'bg-slate-400 dark:bg-slate-600',
                )}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export function ApplicantForm() {
  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApplicantFormValues>({
    defaultValues: loadDraftValues(),
    mode: 'onSubmit',
  })
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

  const onSubmit = (data: ApplicantFormValues) => {
    console.log('Applicant form submitted:', data)
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY)
      window.localStorage.removeItem(STEP_STORAGE_KEY)
    } catch {
      // ignore
    }
    reset(defaultValues)
    setStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const educationRows: Array<{ key: keyof ApplicantFormValues['education']; label: string }> = [
    { key: 'university', label: 'University/ Universitas' },
    { key: 'highSchool', label: 'High School/ SMA' },
    { key: 'juniorSchool', label: 'Junior School/ SMP' },
    { key: 'elementarySchool', label: 'Elementary School/ SD' },
  ]

  const familyRows: Array<{ key: keyof ApplicantFormValues['family']; label: string }> = [
    { key: 'father', label: 'Nama Ayah' },
    { key: 'mother', label: 'Nama Ibu' },
    { key: 'spouse', label: 'Nama Suami/ Istri' },
    { key: 'child1', label: 'Nama Anak ke-1 / Saudara ke-1' },
    { key: 'child2', label: 'Nama Anak ke-2 / Saudara ke-2' },
    { key: 'child3', label: 'Nama Anak ke-3 / Saudara ke-3' },
    { key: 'child4', label: 'Nama Anak ke-4 / Saudara ke-4' },
  ]

  const reviewValues = watch()

  const filledInformalEducation = reviewValues.informalEducation
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => Object.values(row).some((v) => v && v.trim()))

  const filledWorkExperience = reviewValues.workExperience
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => Object.values(row).some((v) => v && v.trim()))

  const filledReferences = reviewValues.references
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => Object.values(row).some((v) => v && v.trim()))

  const driverLicenseSummary = [
    reviewValues.driverLicense?.simA && 'SIM A',
    reviewValues.driverLicense?.simB && 'SIM B',
    reviewValues.driverLicense?.simC && 'SIM C',
    reviewValues.driverLicense?.sio && 'SIO',
  ]
    .filter(Boolean)
    .join(', ')

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
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName" className={captionLabelClass}>
                FULL NAME / Nama lengkap
              </FieldLabel>
              <Input
                id="fullName"
                aria-invalid={!!errors.fullName}
                className={inputHeightClass}
                {...register('fullName', {
                  required: 'Nama lengkap wajib diisi',
                })}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="nickname" className={captionLabelClass}>
                NICKNAME / Nama panggilan
              </FieldLabel>
              <Input
                id="nickname"
                className={inputHeightClass}
                {...register('nickname')}
              />
            </Field>
             <Field>
              <FieldLabel htmlFor="addressIdCard" className={captionLabelClass}>
                ADDRESS AS PER ID CARD/ Alamat sesuai KTP
              </FieldLabel>
              <Textarea
                id="addressIdCard"
                rows={2}
                className="rounded-lg"
                {...register('addressIdCard')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="presentAddress" className={captionLabelClass}>
                PRESENT ADDRESS/ Alamat saat ini
              </FieldLabel>
              <Textarea
                id="presentAddress"
                rows={2}
                className="rounded-lg"
                {...register('presentAddress')}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="mobile" className={captionLabelClass}>
                MOBILE / Handphone
              </FieldLabel>
              <Input
                id="mobile"
                className={inputHeightClass}
                {...register('mobile')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="city" className={captionLabelClass}>
                CITY/ Kota
              </FieldLabel>
              <Input
                id="city"
                className={inputHeightClass}
                {...register('city')}
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="emergencyContactInfo"
                className={captionLabelClass}
              >
                NAME, RELATIONSHIP, AND EMERGENCY CONTACT NUMBER/ Nama,
                hubungan, nomor kontak darurat
              </FieldLabel>
              <Textarea
                id="emergencyContactInfo"
                rows={2}
                className="rounded-lg"
                {...register('emergencyContactInfo')}
              />
            </Field>
            <Field>
              <FieldLabel className={captionLabelClass}>
                PLACE, DATE OF BIRTH / Tempat, tanggal lahir
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Tempat lahir"
                  className={inputHeightClass}
                  {...register('birthPlace')}
                />
                <DatePickerField
                  name="birthDate"
                  control={control}
                  className="min-w-0 shrink"
                />
              </div>
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email" className={captionLabelClass}>
                EMAIL / Alamat email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                className={inputHeightClass}
                {...register('email', {
                  required: 'Email wajib diisi',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Format email tidak valid',
                  },
                })}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="bloodType" className={captionLabelClass}>
                BLOOD TYPE/ Golongan Darah
              </FieldLabel>
              <Input
                id="bloodType"
                className={inputHeightClass}
                {...register('bloodType')}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="idNumber" className={captionLabelClass}>
                ID NUMBER/ No. KTP
              </FieldLabel>
              <Input
                id="idNumber"
                className={inputHeightClass}
                {...register('idNumber')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="taxId" className={captionLabelClass}>
                TAX IDENTIFICATION NUMBER/ NPWP
              </FieldLabel>
              <Input
                id="taxId"
                className={inputHeightClass}
                {...register('taxId')}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="positionApplied" className={captionLabelClass}>
                POSITION APPLIED FOR/ Posisi yang dilamar
              </FieldLabel>
              <Input
                id="positionApplied"
                className={inputHeightClass}
                {...register('positionApplied')}
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="workingAvailableDate"
                className={captionLabelClass}
              >
                WORKING AVAILABLE DATE/ Tanggal siap bekerja
              </FieldLabel>
              <DatePickerField
                id="workingAvailableDate"
                name="workingAvailableDate"
                control={control}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="maritalStatus" className={captionLabelClass}>
                MARITAL STATUS/ Status pernikahan
              </FieldLabel>
              <Input
                id="maritalStatus"
                className={inputHeightClass}
                {...register('maritalStatus')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="religion" className={captionLabelClass}>
                RELIGION/ Agama
              </FieldLabel>
              <Input
                id="religion"
                className={inputHeightClass}
                {...register('religion')}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="heightWeight" className={captionLabelClass}>
                HEIGHT &amp; WEIGHT/ Tinggi &amp; berat badan
              </FieldLabel>
              <Input
                id="heightWeight"
                className={inputHeightClass}
                {...register('heightWeight')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tshirtSize" className={captionLabelClass}>
                T-SHIRT SIZE/ Ukuran kaos
              </FieldLabel>
              <Input
                id="tshirtSize"
                className={inputHeightClass}
                {...register('tshirtSize')}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel className={captionLabelClass}>
              DRIVER&apos;s LICENSE/ Izin mengemudi
            </FieldLabel>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-border/70 p-4">
              <Label className="flex items-center gap-2 text-sm">
                <Controller
                  control={control}
                  name="driverLicense.simA"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                SIM A
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <Controller
                  control={control}
                  name="driverLicense.simB"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                SIM B
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <Controller
                  control={control}
                  name="driverLicense.simC"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                SIM C
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <Controller
                  control={control}
                  name="driverLicense.sio"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                SIO
              </Label>
            </div>
          </Field>
        </FieldGroup>
      ),
    },
    {
      title: 'Educational Background',
      description: 'Latar Belakang Pendidikan',
      icon: GraduationCap,
      content: (
        <div className="space-y-3">
          {educationRows.map((row, i) => (
            <EntryCard key={row.key} index={i + 1} label={row.label} columns={5}>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Name of School/ Nama Institusi
                </FieldLabel>
                <EntryInput
                  name={`education.${row.key}.schoolName`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Location/ Lokasi
                </FieldLabel>
                <EntryInput
                  name={`education.${row.key}.location`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Graduate/ Gelar Kelulusan
                </FieldLabel>
                <EntryInput
                  name={`education.${row.key}.graduate`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Major / Jurusan
                </FieldLabel>
                <EntryInput
                  name={`education.${row.key}.major`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Graduation Year/ Tahun Lulus
                </FieldLabel>
                <EntryInput
                  name={`education.${row.key}.graduationYear`}
                  register={register}
                />
              </Field>
            </EntryCard>
          ))}
        </div>
      ),
    },
    {
      title: 'Informal Education and Special Qualification',
      description: 'Pendidikan Informal dan Keterampilan Khusus',
      icon: Award,
      content: (
        <div className="space-y-3">
          {defaultValues.informalEducation.map((_, index) => (
            <EntryCard
              key={index}
              index={index + 1}
              label={`Pelatihan / Keterampilan ${index + 1}`}
              columns={5}
            >
              <Field className="justify-between">
                <FieldLabel className={captionLabelClass}>
                  Type of Training/ Name of Skill/ Jenis Pelatihan/ Nama
                  Keterampilan
                </FieldLabel>
                <EntryInput
                  name={`informalEducation.${index}.trainingName`}
                  register={register}
                />
              </Field>
              <Field className="justify-between">
                <FieldLabel className={captionLabelClass}>
                  Institution&apos;s Name/ Nama Institusi Pelatihan
                </FieldLabel>
                <EntryInput
                  name={`informalEducation.${index}.institutionName`}
                  register={register}
                />
              </Field>
              <Field className="justify-between">
                <FieldLabel className={captionLabelClass}>
                  Location/ Tempat
                </FieldLabel>
                <EntryInput
                  name={`informalEducation.${index}.location`}
                  register={register}
                />
              </Field>
              <Field className="justify-between">
                <FieldLabel className={captionLabelClass}>
                  Certification/ Sertifikasi
                </FieldLabel>
                <EntryInput
                  name={`informalEducation.${index}.certification`}
                  register={register}
                />
              </Field>
              <Field className="justify-between">
                <FieldLabel className={captionLabelClass}>
                  Periode/ Waktu
                </FieldLabel>
                <EntryInput
                  name={`informalEducation.${index}.period`}
                  register={register}
                />
              </Field>
            </EntryCard>
          ))}
        </div>
      ),
    },
    {
      title: 'Family Background',
      description: 'Latar Belakang Keluarga',
      icon: UsersRound,
      content: (
        <div className="space-y-3">
          {familyRows.map((row, i) => (
            <EntryCard key={row.key} index={i + 1} label={row.label} columns={4}>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Name/ Nama
                </FieldLabel>
                <EntryInput
                  name={`family.${row.key}.name`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Age/ Usia
                </FieldLabel>
                <EntryInput
                  name={`family.${row.key}.age`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Employment/ Pekerjaan
                </FieldLabel>
                <EntryInput
                  name={`family.${row.key}.employment`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Emergency Contact Number/ Kontak Darurat
                </FieldLabel>
                <EntryInput
                  name={`family.${row.key}.emergencyContact`}
                  register={register}
                />
              </Field>
            </EntryCard>
          ))}
        </div>
      ),
    },
    {
      title: 'Working Experiences',
      description: 'Pengalaman Kerja',
      icon: Briefcase,
      content: (
        <div className="space-y-3">
          {defaultValues.workExperience.map((_, index) => (
            <EntryCard
              key={index}
              index={index + 1}
              label={`Pengalaman Kerja ${index + 1}`}
              columns={3}
            >
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Name of Company/ Nama Perusahaan
                </FieldLabel>
                <EntryInput
                  name={`workExperience.${index}.companyName`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Employment Date From/ dari
                </FieldLabel>
                <DatePickerField
                  name={`workExperience.${index}.dateFrom`}
                  control={control}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Employment Date Final/ terakhir
                </FieldLabel>
                <DatePickerField
                  name={`workExperience.${index}.dateFinal`}
                  control={control}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Pay of Salary/ Gaji yg dibayar
                </FieldLabel>
                <EntryInput
                  name={`workExperience.${index}.salary`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Name of Supervisor/ Nama Atasan langsung
                </FieldLabel>
                <EntryInput
                  name={`workExperience.${index}.supervisorName`}
                  register={register}
                />
              </Field>
              <Field>
                <FieldLabel className={captionLabelClass}>
                  Reason for Leaving/ Alasan mengundurkan diri
                </FieldLabel>
                <EntryInput
                  name={`workExperience.${index}.reasonForLeaving`}
                  register={register}
                />
              </Field>
            </EntryCard>
          ))}
        </div>
      ),
    },
    {
      title: 'References',
      description:
        'Please list at least two references (HR & User) — Sebutkan sedikitnya dua orang referensi (HR & Atasan Langsung)',
      icon: Contact,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {defaultValues.references.map((_, index) => (
            <EntryCard
              key={index}
              index={index + 1}
              label={`Referensi ${index + 1}`}
              columns={3}
            >
              <Field className="justify-between">
                <FieldLabel className={captionLabelClass}>
                  Name/ Nama
                </FieldLabel>
                <EntryInput
                  name={`references.${index}.name`}
                  register={register}
                />
              </Field>
              <Field className="justify-between">
                <FieldLabel className={captionLabelClass}>
                  Position Company/ Jabatan
                </FieldLabel>
                <EntryInput
                  name={`references.${index}.position`}
                  register={register}
                />
              </Field>
              <Field className="justify-between">
                <FieldLabel className={captionLabelClass}>
                  Phone / Telepon
                </FieldLabel>
                <EntryInput
                  name={`references.${index}.phone`}
                  register={register}
                />
              </Field>
            </EntryCard>
          ))}
        </div>
      ),
    },
    {
      title: 'Please select one of the following answers',
      description: 'Silahkan pilih salah satu jawaban dari pertanyaan berikut',
      icon: ShieldQuestion,
      content: (
        <div className="space-y-3">
          <YesNoQuestion
            question="Apakah Anda pernah terlibat dalam tindakan kriminal?"
            name="hasCriminalRecord"
            control={control}
          />
          <YesNoQuestion
            question="Apakah Anda pernah menggunakan atau mengonsumsi narkotika, psikotropika, atau zat terlarang lainnya?"
            name="hasUsedDrugs"
            control={control}
          />
          <YesNoQuestion
            question="Apakah Anda bersedia ditempatkan di lokasi kerja mana pun sesuai kebutuhan perusahaan?"
            name="willingToRelocate"
            control={control}
          />
        </div>
      ),
    },
    {
      title: 'Certification',
      description:
        'I certified that that all answer given herein are true and complete to the best of my knowledge',
      icon: FileSignature,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="applicantSignature" className={captionLabelClass}>
              Signature of Applicant/ Tanda tangan pelamar
            </FieldLabel>
            <Input
              id="applicantSignature"
              placeholder="Ketik nama lengkap sebagai tanda tangan"
              className={inputHeightClass}
              {...register('applicantSignature')}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="signatureDate" className={captionLabelClass}>
              Date /Tanggal
            </FieldLabel>
            <DatePickerField
              id="signatureDate"
              name="signatureDate"
              control={control}
            />
          </Field>
        </div>
      ),
    },
    {
      title: 'Review & Ringkasan',
      description: 'Periksa kembali seluruh data sebelum mengirim lamaran',
      icon: ClipboardCheck,
      content: (
        <div className="space-y-6">
          <ReviewSection
            icon={UserRound}
            title="Applicant Information / Informasi Pelamar"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ReviewItem label="Full Name" value={reviewValues.fullName} />
              <ReviewItem label="Nickname" value={reviewValues.nickname} />
              <ReviewItem label="Email" value={reviewValues.email} />
              <ReviewItem label="Mobile" value={reviewValues.mobile} />
              <ReviewItem label="City" value={reviewValues.city} />
              <ReviewItem
                label="Place, Date of Birth"
                value={[
                  reviewValues.birthPlace,
                  formatDateDisplay(reviewValues.birthDate),
                ]
                  .filter(Boolean)
                  .join(', ')}
              />
              <ReviewItem label="Blood Type" value={reviewValues.bloodType} />
              <ReviewItem label="ID Number" value={reviewValues.idNumber} />
              <ReviewItem label="Tax ID" value={reviewValues.taxId} />
              <ReviewItem
                label="Position Applied"
                value={reviewValues.positionApplied}
              />
              <ReviewItem
                label="Working Available Date"
                value={formatDateDisplay(reviewValues.workingAvailableDate)}
              />
              <ReviewItem
                label="Marital Status"
                value={reviewValues.maritalStatus}
              />
              <ReviewItem label="Religion" value={reviewValues.religion} />
              <ReviewItem
                label="Height & Weight"
                value={reviewValues.heightWeight}
              />
              <ReviewItem
                label="T-Shirt Size"
                value={reviewValues.tshirtSize}
              />
              <ReviewItem
                label="Driver's License"
                value={driverLicenseSummary}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewItem
                label="Address as per ID Card"
                value={reviewValues.addressIdCard}
              />
              <ReviewItem
                label="Present Address"
                value={reviewValues.presentAddress}
              />
              <ReviewItem
                label="Emergency Contact"
                value={reviewValues.emergencyContactInfo}
              />
            </div>
          </ReviewSection>

          <ReviewSection
            icon={GraduationCap}
            title="Educational Background / Latar Belakang Pendidikan"
          >
            <div className="space-y-3">
              {educationRows.map((row, i) => {
                const v = reviewValues.education[row.key]
                return (
                  <EntryCard
                    key={row.key}
                    index={i + 1}
                    label={row.label}
                    columns={5}
                  >
                    <ReviewItem label="Name of School" value={v.schoolName} />
                    <ReviewItem label="Location" value={v.location} />
                    <ReviewItem label="Graduate" value={v.graduate} />
                    <ReviewItem label="Major" value={v.major} />
                    <ReviewItem
                      label="Graduation Year"
                      value={v.graduationYear}
                    />
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
                    <ReviewItem
                      label="Institution's Name"
                      value={row.institutionName}
                    />
                    <ReviewItem label="Location" value={row.location} />
                    <ReviewItem
                      label="Certification"
                      value={row.certification}
                    />
                    <ReviewItem label="Periode" value={row.period} />
                  </EntryCard>
                ))}
              </div>
            )}
          </ReviewSection>

          <ReviewSection
            icon={UsersRound}
            title="Family Background / Latar Belakang Keluarga"
          >
            <div className="space-y-3">
              {familyRows.map((row, i) => {
                const v = reviewValues.family[row.key]
                return (
                  <EntryCard
                    key={row.key}
                    index={i + 1}
                    label={row.label}
                    columns={4}
                  >
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

          <ReviewSection
            icon={Briefcase}
            title="Working Experiences / Pengalaman Kerja"
          >
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
                    <ReviewItem
                      label="Name of Company"
                      value={row.companyName}
                    />
                    <ReviewItem
                      label="Date From"
                      value={formatDateDisplay(row.dateFrom)}
                    />
                    <ReviewItem
                      label="Date Final"
                      value={formatDateDisplay(row.dateFinal)}
                    />
                    <ReviewItem label="Pay of Salary" value={row.salary} />
                    <ReviewItem
                      label="Name of Supervisor"
                      value={row.supervisorName}
                    />
                    <ReviewItem
                      label="Reason for Leaving"
                      value={row.reasonForLeaving}
                    />
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

          <ReviewSection
            icon={ShieldQuestion}
            title="Please select one of the following answers"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <ReviewItem
                label="Pernah terlibat tindakan kriminal?"
                value={yesNoLabel(reviewValues.hasCriminalRecord)}
              />
              <ReviewItem
                label="Pernah menggunakan narkotika/zat terlarang?"
                value={yesNoLabel(reviewValues.hasUsedDrugs)}
              />
              <ReviewItem
                label="Bersedia ditempatkan di lokasi mana pun?"
                value={yesNoLabel(reviewValues.willingToRelocate)}
              />
            </div>
          </ReviewSection>

          <ReviewSection icon={FileSignature} title="Certification">
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewItem
                label="Signature of Applicant"
                value={reviewValues.applicantSignature}
              />
              <ReviewItem
                label="Date"
                value={formatDateDisplay(reviewValues.signatureDate)}
              />
            </div>
          </ReviewSection>
        </div>
      ),
    },
  ]

  const isFirstStep = step === 0
  const isLastStep = step === steps.length - 1
  const current = steps[step]

  async function handleNext() {
    if (step === 0) {
      const valid = await trigger(['fullName', 'email'])
      if (!valid) return
    }
    setStep((s) => Math.min(s + 1, steps.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleStepClick(index: number) {
    if (index > step) return
    setStep(index)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Applicant Form
        </h1>
        <p className="text-sm text-muted-foreground">
          Formulir Lamaran Pekerjaan
        </p>
      </div>

      <div className="space-y-2">
        <StepIndicator
          steps={steps}
          currentStep={step}
          onStepClick={handleStepClick}
        />
        <p className="text-xs text-muted-foreground">
          Langkah {step + 1} dari {steps.length} &middot; {current.title}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-t-4 border-t-primary shadow-2xl shadow-black/10">
          <CardHeader className="px-8 mt-4">
            <SectionHeading
              icon={current.icon}
              title={current.title}
              description={current.description}
            />
          </CardHeader>
          <CardContent className="p-8">{current.content}</CardContent>
        </Card>

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
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
              >
                <Printer className="size-4" />
                Cetak / Print
              </Button>
              <Button type="submit">
                <Send className="size-4" />
                Kirim Lamaran
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
