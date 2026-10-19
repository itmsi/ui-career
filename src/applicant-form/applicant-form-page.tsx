import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { ClipboardCheck, Link2Off, Loader2, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/i18n/use-language'
import { ApiError } from '@/lib/api-client'

import { ApplicantForm } from './applicant-form'
import { verifyApplicantInvitation, type InvitationVerifyResponse } from './api'
import { StatusScreen } from './components/status-screen'

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

  if (state.status === 'loading') {
    return (
      <StatusScreen
        icon={Loader2}
        spinning
        title={t('page.checkingTitle')}
        description={t('page.checkingDescription')}
      />
    )
  }

  if (state.reason === 'alreadySubmitted') {
    return (
      <StatusScreen
        icon={ClipboardCheck}
        title={t('page.alreadySubmittedTitle')}
        description={t('page.alreadySubmitted')}
        hint={t('page.alreadySubmittedHelp')}
      />
    )
  }

  return (
    <StatusScreen
      icon={Link2Off}
      tone="error"
      title={t('page.invalidTitle')}
      description={
        state.reason === 'missing'
          ? t('page.linkMissing')
          : // Server messages are Indonesian, so only show them when the UI is too.
            (language === 'id' && state.serverMessage) || t('page.linkInvalid')
      }
      hint={t('page.invalidHelp')}
      action={
        state.reason === 'invalid' ? (
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            <RotateCw className="size-4" />
            {t('page.retry')}
          </Button>
        ) : undefined
      }
    />
  )
}
