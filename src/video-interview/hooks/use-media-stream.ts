import { useCallback, useEffect, useRef, useState } from 'react'

import type { MediaErrorKind } from '../types'

function toMediaErrorKind(error: unknown): MediaErrorKind {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'denied'
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'notFound'
      case 'NotReadableError':
      case 'TrackStartError':
        return 'inUse'
      case 'SecurityError':
        return 'insecure'
    }
  }
  return 'unknown'
}

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<MediaErrorKind | null>(null)
  const [requesting, setRequesting] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const mountedRef = useRef(true)

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const request = useCallback(async () => {
    release()
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(window.isSecureContext ? 'unsupported' : 'insecure')
      return
    }

    setRequesting(true)
    try {
      const next = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (!mountedRef.current) {
        next.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = next
      for (const track of next.getTracks()) {
        track.addEventListener('ended', () => {
          if (streamRef.current !== next) return
          release()
          setError('deviceLost')
        })
      }
      setStream(next)
    } catch (caught) {
      if (mountedRef.current) setError(toMediaErrorKind(caught))
    } finally {
      if (mountedRef.current) setRequesting(false)
    }
  }, [release])

  return { stream, error, requesting, request, release }
}
