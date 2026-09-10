import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// ─── Request Interceptor: attach Bearer token ────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  else delete config.headers.Authorization
  return config
})

// ─── Response Interceptor: auto-refresh on 401 ───────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = useAuthStore.getState().refreshToken

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((queueError) => Promise.reject(queueError))
      }

      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/api/v1/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const newToken =
          refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken
        const nextRefreshToken =
          refreshResponse.data?.data?.refreshToken || refreshResponse.data?.refreshToken

        if (!newToken) {
          throw new Error('Refresh token rotation failed')
        }

        useAuthStore.setState({
          token: newToken,
          refreshToken: nextRefreshToken || refreshToken,
        })

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// ─── Normalize nested API responses ─────────────────────────
const normalizeResponse = (response) => response?.data?.data ?? response?.data ?? response

// ─── Auth API ────────────────────────────────────────────────
export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then(normalizeResponse),
  login: (payload) => api.post('/auth/login', payload).then(normalizeResponse),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }).then(normalizeResponse),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then(normalizeResponse),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then(normalizeResponse),
  getStats: () => api.get('/auth/stats').then(normalizeResponse),
  getMe: () => api.get('/auth/me').then(normalizeResponse),
  updateProfile: (payload) => api.patch('/auth/profile', payload).then(normalizeResponse),
  listUsers: (params = {}) => api.get('/auth/users', { params }).then(normalizeResponse),
}

export const profileApi = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('profile_image', file)

    return api
      .post('/users/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(normalizeResponse)
  },
}

export const adminApi = {
  analytics: () => api.get('/admin/analytics').then(normalizeResponse),
  listApprovals: () => api.get('/admin/approvals').then(normalizeResponse),
  updateOrganizerStatus: (id, status) => api.patch(`/admin/organizers/${id}/status`, { status }).then(normalizeResponse),
}

// ─── Events API ──────────────────────────────────────────────
export const eventsApi = {
  list: (params = {}) => api.get('/events', { params }).then(normalizeResponse),
  getById: (id) => api.get(`/events/${id}`).then(normalizeResponse),
  create: (payload) => api.post('/events', payload).then(normalizeResponse),
  update: (id, payload) => api.patch(`/events/${id}`, payload).then(normalizeResponse),
  remove: (id) => api.delete(`/events/${id}`).then(normalizeResponse),
}

// ─── Attendance API ──────────────────────────────────────────
export const attendanceApi = {
  checkIn: (payload) => api.post('/attendance/check-in', payload).then(normalizeResponse),
  checkOut: (payload) => api.post('/attendance/check-out', payload).then(normalizeResponse),
  myAttendance: (params = {}) => api.get('/attendance/my', { params }).then(normalizeResponse),
  allAttendance: (params = {}) => api.get('/attendance/all', { params }).then(normalizeResponse),
  eventAttendance: (eventId) => api.get(`/attendance/event/${eventId}`).then(normalizeResponse),
}

// ─── Donation API ────────────────────────────────────────────
export const donationApi = {
  create: (payload) => api.post('/donations', payload).then(normalizeResponse),
  myDonations: () => api.get('/donations/my').then(normalizeResponse),
  verify: (donationId) => api.get(`/donations/verify/${donationId}`).then(normalizeResponse),
}

// ─── Passport API ────────────────────────────────────────────
export const passportApi = {
  issue: (payload) => api.post('/passport/issue', payload).then(normalizeResponse),
  verify: (passportId) => api.get(`/passport/verify/${passportId}`).then(normalizeResponse),
  myPassports: () => api.get('/passport/my').then(normalizeResponse),
}

export default api
