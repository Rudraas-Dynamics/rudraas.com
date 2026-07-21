import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiSuccessEnvelope<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

export interface ApiErrorEnvelope {
  success: false
  statusCode: number
  message: string
  path: string
  timestamp: string
}

export interface UnwrappedResponse<T> {
  data: T
  meta?: PaginationMeta
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retried?: boolean
  }
}

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined
}

const CSRF_REQUIRED_PATHS = ['/auth/refresh', '/auth/logout']

function requiresCsrfHeader(url: string | undefined): boolean {
  if (!url) return false
  return CSRF_REQUIRED_PATHS.some((path) => url.includes(path))
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  if (requiresCsrfHeader(config.url)) {
    const csrfToken = getCookie('career_csrf')
    if (csrfToken) {
      config.headers.set('X-CSRF-Token', csrfToken)
    }
  }

  return config
})

let refreshInFlight: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  try {
    const response = await apiClient.post<ApiSuccessEnvelope<{ accessToken: string; expiresIn: number }>>(
      '/auth/refresh',
    )
    const token = response.data.data.accessToken
    setAccessToken(token)
    return token
  } catch {
    setAccessToken(null)
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig | undefined

    const isAuthEndpoint =
      originalConfig?.url?.includes('/auth/login') || originalConfig?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && originalConfig && !isAuthEndpoint && !originalConfig._retried) {
      originalConfig._retried = true

      if (!refreshInFlight) {
        refreshInFlight = performRefresh().finally(() => {
          refreshInFlight = null
        })
      }

      const newToken = await refreshInFlight

      if (newToken) {
        originalConfig.headers.set('Authorization', `Bearer ${newToken}`)
        return apiClient(originalConfig)
      }

      window.dispatchEvent(new Event('auth:logout'))
    }

    return Promise.reject(error)
  },
)

async function unwrap<T>(
  promise: Promise<AxiosResponse<ApiSuccessEnvelope<T>>>,
): Promise<UnwrappedResponse<T>> {
  const response = await promise
  return { data: response.data.data, meta: response.data.meta }
}

export function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<UnwrappedResponse<T>> {
  return unwrap(apiClient.get<ApiSuccessEnvelope<T>>(url, config))
}

export function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<UnwrappedResponse<T>> {
  return unwrap(apiClient.post<ApiSuccessEnvelope<T>>(url, body, config))
}

export function apiPatch<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<UnwrappedResponse<T>> {
  return unwrap(apiClient.patch<ApiSuccessEnvelope<T>>(url, body, config))
}

export function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<UnwrappedResponse<T>> {
  return unwrap(apiClient.delete<ApiSuccessEnvelope<T>>(url, config))
}

export function isApiError(error: unknown): error is AxiosError<ApiErrorEnvelope> {
  return axios.isAxiosError(error)
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isApiError(error) && error.response?.data?.message) {
    return error.response.data.message
  }
  return fallback
}
