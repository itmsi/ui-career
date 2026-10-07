export const VIDEO_INTERVIEW_ENABLED = import.meta.env.VITE_ENABLE_VIDEO_INTERVIEW !== 'false'

export const MAX_RERECORDS = 5

type QuestionTiming = { prepSeconds: number; maxSeconds: number }

const FIRST_QUESTION_TIMING: QuestionTiming = { prepSeconds: 30, maxSeconds: 90 }
const OTHER_QUESTION_TIMING: QuestionTiming = { prepSeconds: 45, maxSeconds: 120 }

export function timingForPosition(index: number): QuestionTiming {
  return index === 0 ? FIRST_QUESTION_TIMING : OTHER_QUESTION_TIMING
}
