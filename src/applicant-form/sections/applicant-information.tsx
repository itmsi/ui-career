import { addYears, startOfToday } from 'date-fns'

import { FieldDescription, FieldGroup } from '@/components/ui/field'

import { DatePickerField } from '../components/date-picker-field'
import { SelectField, TextField } from '../components/form-fields'
import {
  BLOOD_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
} from '../form-utils'

export function ApplicantInformationSection() {
  const today = startOfToday()

  return (
    <FieldGroup>
      <FieldDescription>
        Kolom bertanda <span className="text-destructive">*</span> wajib diisi.
      </FieldDescription>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="fullName" label="FULL NAME / Nama lengkap" required maxLength={150} />
        <TextField name="nickname" label="NICKNAME / Nama panggilan" required maxLength={50} />
        <TextField
          name="addressIdCard"
          label="ADDRESS AS PER ID CARD / Alamat sesuai KTP"
          required
          multiline
        />
        <TextField
          name="presentAddress"
          label="PRESENT ADDRESS / Alamat saat ini"
          required
          multiline
        />
        <TextField
          name="mobile"
          label="MOBILE / Handphone"
          type="tel"
          inputMode="tel"
          placeholder="cth. 081234567890"
          required
        />
        <TextField
          name="emergencyContactInfo"
          label="NAME, RELATIONSHIP, AND EMERGENCY CONTACT NUMBER / Nama, hubungan, nomor kontak darurat"
          placeholder="cth. Budi – Kakak – 081234567890"
          required
          multiline
        />
        <TextField
          name="birthPlace"
          label="PLACE OF BIRTH / Tempat lahir"
          required
          maxLength={100}
        />
        <DatePickerField
          name="birthDate"
          label="DATE OF BIRTH / Tanggal lahir"
          required
          disabled={{ after: today }}
          startMonth={new Date(1940, 0)}
          endMonth={today}
        />
        <TextField
          name="email"
          label="EMAIL / Alamat email"
          type="email"
          inputMode="email"
          required
        />
        <SelectField
          name="bloodType"
          label="BLOOD TYPE / Golongan darah"
          options={BLOOD_TYPE_OPTIONS}
          placeholder="Pilih golongan darah"
          required
        />
        <TextField
          name="idNumber"
          label="ID NUMBER / No. KTP"
          inputMode="numeric"
          placeholder="16 digit"
          maxLength={16}
          required
        />
        <TextField
          name="positionApplied"
          label="POSITION APPLIED FOR / Posisi yang dilamar"
          required
        />
        <DatePickerField
          name="workingAvailableDate"
          label="WORKING AVAILABLE DATE / Tanggal siap bekerja"
          required
          disabled={{ before: today }}
          startMonth={today}
          endMonth={addYears(today, 2)}
        />
        <SelectField
          name="maritalStatus"
          label="MARITAL STATUS / Status pernikahan"
          options={MARITAL_STATUS_OPTIONS}
          placeholder="Pilih status pernikahan"
          required
        />
        <SelectField
          name="religion"
          label="RELIGION / Agama"
          options={RELIGION_OPTIONS}
          placeholder="Pilih agama"
          required
        />
        <TextField
          name="heightWeight"
          label="HEIGHT & WEIGHT / Tinggi & berat badan"
          placeholder="cth. 170 cm / 65 kg"
          required
        />
        <TextField
          name="tshirtSize"
          label="T-SHIRT SIZE / Ukuran kaos"
          placeholder="cth. L"
          maxLength={10}
          required
        />
        <TextField
          name="taxId"
          label="TAX IDENTIFICATION NUMBER / NPWP"
          inputMode="numeric"
          placeholder="15 / 16 digit"
          maxLength={20}
        />
        <TextField
          name="driverLicense"
          label="DRIVER'S LICENSE / Izin mengemudi"
          placeholder="cth. SIM A, SIM C"
        />
        <TextField name="city" label="CITY / Kota" />
      </div>
    </FieldGroup>
  )
}
