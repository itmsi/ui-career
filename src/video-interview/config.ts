export const VIDEO_INTERVIEW_ENABLED = import.meta.env.VITE_ENABLE_VIDEO_INTERVIEW !== 'false'

export const MAX_RERECORDS = 5

type QuestionTiming = { prepSeconds: number; maxSeconds: number }

const FIRST_QUESTION_TIMING: QuestionTiming = { prepSeconds: 15, maxSeconds: 300 }
const OTHER_QUESTION_TIMING: QuestionTiming = { prepSeconds: 15, maxSeconds: 300 }

export function timingForPosition(index: number): QuestionTiming {
  return index === 0 ? FIRST_QUESTION_TIMING : OTHER_QUESTION_TIMING
}
