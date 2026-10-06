import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { LanguageSwitcher } from '@/components/language-switcher'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/i18n/use-language'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'

import { ApplicantForm } from './applicant-form'
import { verifyApplicantInvitation, type InvitationVerifyResponse } from './api'

type VerificationState =
  | { status: 'loading' }
  // `serverMessage` is the backend's own (Indonesian) text, kept for reasons we have no
  // translation for.
  | { status: 'invalid'; reason: InvalidReason; serverMessage?: string }
  | { status: 'valid'; invitation: InvitationVerifyResponse }

type InvalidReason = 'missing' | 'alreadySubmitted' | 'invalid'

/**
 * The verify endpoint rejects a token whose form was already submitted; recognise that
 * case so it can be shown in the applicant's language instead of the raw server text.
 */
function isAlreadySubmitted(error: unknown) {
  if (!(error instanceof Error)) return false
  return /sudah pernah diisi/i.test(error.message) || (error instanceof ApiError && error.status === 409)
}

export function ApplicantFormPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<VerificationState>({ status: 'loading' })

  useEffect(() => {
    if (!token) {
      setState({ status: 'invalid', reason: 'missing' })
      return
    }

    let cancelled = false
    setState({ status: 'loading' })

    verifyApplicantInvitation(token)
      .then((invitation) => {
        if (!cancelled) setState({ status: 'valid', invitation })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState(
          isAlreadySubmitted(error)
            ? { status: 'invalid', reason: 'alreadySubmitted' }
            : {
                status: 'invalid',
                reason: 'invalid',
                serverMessage: error instanceof Error ? error.message : undefined,
              },
        )
      })

    return () => {
      cancelled = true
    }
  }, [token])

  if (state.status === 'valid') {
    return <ApplicantForm token={token!} invitation={state.invitation} />
  }

  const title =
    state.status === 'loading'
      ? t('page.checkingTitle')
      : state.reason === 'alreadySubmitted'
        ? t('page.alreadySubmittedTitle')
        : t('page.invalidTitle')

  const description =
    state.status === 'loading'
      ? t('page.checkingDescription')
      : state.reason === 'alreadySubmitted'
        ? t('page.alreadySubmitted')
        : state.reason === 'missing'
          ? t('page.linkMissing')
          : // Server messages are Indonesian, so only show them when the UI is too.
            (language === 'id' && state.serverMessage) || t('page.linkInvalid')

  return (
    <div className="relative mx-auto flex h-svh w-full max-w-md items-center p-4 sm:p-6">
      <LanguageSwitcher className="absolute top-4 right-4" />
      <Card className={cn('w-full', state.status === 'invalid' && 'border-destructive/50')}>
        <CardHeader className="px-8 py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
