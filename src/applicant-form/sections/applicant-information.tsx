import { Controller, type Control, type FieldErrors } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { DatePickerField } from '../components/date-picker-field'
import { captionLabelClass, inputHeightClass } from '../form-utils'
import type { ApplicantFormValues, RegisterFn } from '../types'

export function ApplicantInformationSection({
  register,
  control,
  errors,
}: {
  register: RegisterFn
  control: Control<ApplicantFormValues>
  errors: FieldErrors<ApplicantFormValues>
}) {
  return (
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
          <Input id="city" className={inputHeightClass} {...register('city')} />
        </Field>

        <Field>
          <FieldLabel htmlFor="emergencyContactInfo" className={captionLabelClass}>
            NAME, RELATIONSHIP, AND EMERGENCY CONTACT NUMBER/ Nama, hubungan,
            nomor kontak darurat
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
          <Input id="taxId" className={inputHeightClass} {...register('taxId')} />
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
          <FieldLabel htmlFor="workingAvailableDate" className={captionLabelClass}>
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
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            SIM A
          </Label>
          <Label className="flex items-center gap-2 text-sm">
            <Controller
              control={control}
              name="driverLicense.simB"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            SIM B
          </Label>
          <Label className="flex items-center gap-2 text-sm">
            <Controller
              control={control}
              name="driverLicense.simC"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            SIM C
          </Label>
          <Label className="flex items-center gap-2 text-sm">
            <Controller
              control={control}
              name="driverLicense.sio"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            SIO
          </Label>
        </div>
      </Field>
    </FieldGroup>
  )
}
