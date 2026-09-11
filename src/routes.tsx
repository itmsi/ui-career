import { Navigate, Route, Routes } from 'react-router-dom'

import { ApplicantFormPage } from '@/applicant-form/applicant-form-page'

function ApplicantFormLayout() {
  return (
    <div className="h-full bg-background">
      <ApplicantFormPage />
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
