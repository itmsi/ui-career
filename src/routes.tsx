import { Navigate, Route, Routes } from 'react-router-dom'

import { ApplicantFormPage } from '@/applicant-form/applicant-form-page'
import { SiteHeader } from '@/components/site-header'

function ApplicantFormLayout() {
  return (
    <div className="min-h-svh bg-slate-200 dark:bg-neutral-900">
      <SiteHeader />
      <div className="py-5">
        <ApplicantFormPage />
      </div>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/applicant-form/:token" element={<ApplicantFormLayout />} />
      <Route path="/applicant-form" element={<ApplicantFormLayout />} />
      <Route path="/" element={<Navigate to="/applicant-form" replace />} />
      <Route path="*" element={<Navigate to="/applicant-form" replace />} />
    </Routes>
  )
}
