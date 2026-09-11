import axios, { isAxiosError, type AxiosRequestConfig } from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '') + '/api/career'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await httpClient.request<T>({ url: path, ...config })
    return response.data
  } catch (error) {
    if (isAxiosError<{ message?: string; error?: string }>(error)) {
      const status = error.response?.status ?? 0
      const message =
        error.response?.data?.message || error.response?.data?.error || error.message
      throw new ApiError(message, status)
    }
    throw error
  }
}
