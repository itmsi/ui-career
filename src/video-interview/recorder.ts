import type { RecordedMedia, RecordingResult } from './types'

const VIDEO_MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
]
const AUDIO_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']

function baseMimeType(mimeType: string) {
  return mimeType.split(';')[0].trim().toLowerCase()
}

export class RecorderUnsupportedError extends Error {
  constructor() {
    super('MediaRecorder is not available in this browser')
    this.name = 'RecorderUnsupportedError'
  }
}

function recorderSupported() {
  return typeof MediaRecorder !== 'undefined'
}

export type Recording = {
  stop: () => Promise<RecordingResult>
  cancel: () => void
}

type ChunkRecorder = {
  recorder: MediaRecorder
  finished: Promise<RecordedMedia>
}

function startChunkRecorder(
  source: MediaStream,
  candidates: string[],
  fallbackType: string,
): ChunkRecorder {
  const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type))
  const recorder = new MediaRecorder(source, mimeType ? { mimeType } : undefined)
  const chunks: Blob[] = []

  const finished = new Promise<RecordedMedia>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.onerror = () => reject(new Error('Recording failed'))
    recorder.onstop = () => {
      const type = baseMimeType(recorder.mimeType || mimeType || fallbackType)
      resolve({ blob: new Blob(chunks, { type }), mimeType: type })
    }
  })
  void finished.catch(() => undefined)

  recorder.start(1000)
  return { recorder, finished }
}

function stopRecorder({ recorder }: ChunkRecorder) {
  if (recorder.state !== 'inactive') recorder.stop()
}

export function startRecording(stream: MediaStream): Recording {
  if (!recorderSupported()) throw new RecorderUnsupportedError()

  const startedAt = performance.now()
  const video = startChunkRecorder(stream, VIDEO_MIME_CANDIDATES, 'video/webm')
  let audio: ChunkRecorder
  try {
    audio = startChunkRecorder(new MediaStream(stream.getAudioTracks()), AUDIO_MIME_CANDIDATES, 'audio/webm')
  } catch (error) {
    stopRecorder(video)
    throw error
  }

  return {
    async stop() {
      stopRecorder(video)
      stopRecorder(audio)
      const [videoMedia, audioMedia] = await Promise.all([video.finished, audio.finished])
      return {
        ...videoMedia,
        durationSeconds: Math.max(1, Math.round((performance.now() - startedAt) / 1000)),
        audio: audioMedia,
      }
    },
    cancel() {
      for (const { recorder } of [video, audio]) {
        recorder.ondataavailable = null
        recorder.onstop = null
      }
      stopRecorder(video)
      stopRecorder(audio)
    },
  }
}
