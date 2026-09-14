import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { ApplicantForm } from './applicant-form'
import { verifyApplicantInvitation } from './api'

type VerificationState =
  | { status: 'loading' }
  | { status: 'invalid'; message: string }
  | { status: 'valid' }

export function ApplicantFormPage() {
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<VerificationState>({ status: 'loading' })

  useEffect(() => {
    if (!token) {
      setState({ status: 'invalid', message: 'Link undangan tidak ditemukan.' })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })

    verifyApplicantInvitation(token)
      .then(() => {
        if (!cancelled) setState({ status: 'valid' })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message =
          error instanceof Error ? error.message : 'Link undangan sudah tidak valid.'
        setState({ status: 'invalid', message })
      })

    return () => {
      cancelled = true
    }
  }, [token])

  if (state.status === 'valid') {
    return <ApplicantForm token={token!} />
  }

  return (
    <div className="mx-auto flex h-svh w-full max-w-md items-center p-4 sm:p-6">
      <Card className={cn('w-full', state.status === 'invalid' && 'border-destructive/50')}>
        <CardHeader className="px-8 py-6">
          <CardTitle>
            {state.status === 'loading' ? 'Memeriksa Link Undangan...' : 'Link Tidak Valid'}
          </CardTitle>
          <CardDescription>
            {state.status === 'loading'
              ? 'Mohon tunggu sebentar.'
              : state.message}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
