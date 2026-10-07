import { useEffect, useRef, useState } from 'react'

export function useCountdown({
  seconds,
  running = true,
  onExpire,
}: {
  seconds: number
  running?: boolean
  onExpire?: () => void
}) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    if (!running) return
    const startedAt = performance.now()
    const limitMs = seconds * 1000
    let expired = false

    const tick = () => {
      const elapsed = performance.now() - startedAt
      setElapsedMs(Math.min(elapsed, limitMs))
      if (!expired && elapsed >= limitMs) {
        expired = true
        window.clearInterval(intervalId)
        onExpireRef.current?.()
      }
    }
    const intervalId = window.setInterval(tick, 250)
    tick()
    return () => window.clearInterval(intervalId)
  }, [seconds, running])

  return {
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    remainingSeconds: Math.max(0, Math.ceil(seconds - elapsedMs / 1000)),
    fraction: seconds > 0 ? elapsedMs / (seconds * 1000) : 1,
    expired: elapsedMs >= seconds * 1000,
  }
}

export function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
