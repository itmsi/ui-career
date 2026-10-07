import { createContext, useContext, useEffect } from 'react'

/**
 * Tracks files the applicant has picked but not uploaded yet, so leaving the step
 * can warn that those files will be dropped.
 */
export type PendingUploadRegistry = {
  set: (key: string, entry: { label: string; cancel: () => void } | null) => void
}

export const PendingUploadsContext = createContext<PendingUploadRegistry | null>(null)

/**
 * Registers `label` as a pending upload while it is non-null. `cancel` must drop the
 * staged file; it is called when the applicant confirms leaving the step anyway.
 */
export function usePendingUpload(key: string, label: string | null, cancel: () => void) {
  const registry = useContext(PendingUploadsContext)

  useEffect(() => {
    if (!registry || label === null) return
    registry.set(key, { label, cancel })
    return () => registry.set(key, null)
  }, [registry, key, label, cancel])
}
