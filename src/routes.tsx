import { Navigate, Route, Routes } from 'react-router-dom'

import { ApplicantForm } from '@/applicant-form/applicant-form'

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/applicant-form"
        element={
          <div className="min-h-svh bg-slate-200 py-8 dark:bg-neutral-900">
            <ApplicantForm />
          </div>
        }
      />
      <Route path="/" element={<Navigate to="/applicant-form" replace />} />
      <Route path="*" element={<Navigate to="/applicant-form" replace />} />
    </Routes>
  )
}
