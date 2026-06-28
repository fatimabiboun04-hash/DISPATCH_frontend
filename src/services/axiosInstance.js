import axios from 'axios'

/**
 * Central Axios instance.
 *
 * Responsibilities:
 * - Attach base URL from env
 * - Inject Bearer token on every request
 * - Handle 401 globally → clear token + redirect to login
 * - Standardize error shape for all services
 */

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

// ── Request Interceptor ───────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dispatch_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ──────────────────────────────────────
axiosInstance.interceptors.response.use(
  // Pass successful responses through unchanged
  (response) => response,

  (error) => {
    const status = error.response?.status

    // 401 Unauthorized — token expired or invalid
    if (status === 401) {
      localStorage.removeItem('dispatch_token')
      localStorage.removeItem('dispatch_user')
      // Redirect to landing page
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    // 403 with locked:true — suspended account
    const responseBody = error.response?.data
    const isLocked = responseBody?.locked || responseBody?.data?.locked || responseBody?.errors?.locked || false
    if (status === 403 && isLocked) {
      const reason = responseBody?.reason || responseBody?.errors?.reason || ''
      window.location.href = `/lockout?reason=${encodeURIComponent(reason)}`
    }

    // Normalize error for services to use
    return Promise.reject({
      status,
      message:    responseBody?.message || 'An unexpected error occurred.',
      errors:     responseBody?.errors  || {},
      data:       responseBody?.data    || responseBody || null,
      rawError:   error,
    })
  }
)

export default axiosInstance