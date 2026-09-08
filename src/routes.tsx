import { Navigate, Route, Routes } from 'react-router-dom'

import { ApplicantForm } from '@/applicant-form/applicant-form'
import { SiteHeader } from '@/components/site-header'

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/applicant-form"
        element={
          <div className="min-h-svh bg-slate-200 dark:bg-neutral-900">
            <SiteHeader />
            <div className="py-5">
              <ApplicantForm />
            </div>
          </div>
        }
      />
      <Route path="/" element={<Navigate to="/applicant-form" replace />} />
      <Route path="*" element={<Navigate to="/applicant-form" replace />} />
    </Routes>
  )
}
