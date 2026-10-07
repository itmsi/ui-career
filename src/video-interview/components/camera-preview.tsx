import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

export function CameraPreview({
  stream,
  className,
}: {
  stream: MediaStream | null
  className?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    return () => {
      video.srcObject = null
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={cn(
        'aspect-video w-full -scale-x-100 rounded-xl border border-border bg-black object-cover',
        className,
      )}
    />
  )
}
