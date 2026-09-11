import { useQuery } from '@tanstack/react-query'
import { attendanceApi, authApi, donationApi, eventsApi, passportApi } from '../services/api'

// ─── Platform Stats (public) ─────────────────────────────────
export function usePlatformStats() {
  return useQuery({
    queryKey: ['auth', 'stats'],
    queryFn: async () => {
      const data = await authApi.getStats()
      const result = data && typeof data === 'object' ? data : {}
      return {
        volunteers: Number(result.volunteers ?? 0),
        organizers: Number(result.organizers ?? 0),
      }
    },
    staleTime: 1000 * 60,
  })
}

// ─── Current User Profile ────────────────────────────────────
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    staleTime: 1000 * 60,
  })
}

// ─── Events ──────────────────────────────────────────────────
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const data = await eventsApi.list({ page: 1, limit: 20 })
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.items)) return data.items
      if (Array.isArray(data?.data)) return data.data
      return []
    },
    staleTime: 1000 * 30,
  })
}

export function useEventById(id) {
  return useQuery({
    queryKey: ['event', id],
    enabled: Boolean(id),
    queryFn: () => eventsApi.getById(id),
    staleTime: 1000 * 30,
  })
}

// ─── Attendance ───────────────────────────────────────────────
export function useMyAttendance() {
  return useQuery({
    queryKey: ['attendance', 'my'],
    queryFn: async () => {
      const data = await attendanceApi.myAttendance({ page: 1, limit: 50 })
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.items)) return data.items
      if (Array.isArray(data?.data)) return data.data
      return []
    },
    staleTime: 1000 * 30,
  })
}

/** Admin: all volunteers' attendance records with user & event data */
export function useAdminAttendance(params = {}) {
  return useQuery({
    queryKey: ['attendance', 'all', params],
    queryFn: async () => {
      const data = await attendanceApi.allAttendance({ page: 1, limit: 100, ...params })
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.items)) return data.items
      return []
    },
    staleTime: 1000 * 30,
  })
}

// ─── Donations ────────────────────────────────────────────────
export function useMyDonations() {
  return useQuery({
    queryKey: ['donations', 'my'],
    queryFn: async () => {
      const data = await donationApi.myDonations()
      if (Array.isArray(data)) return data
      return []
    },
    staleTime: 1000 * 30,
  })
}

// ─── Passports ────────────────────────────────────────────────
export function useMyPassports() {
  return useQuery({
    queryKey: ['passport', 'my'],
    queryFn: async () => {
      const data = await passportApi.myPassports()
      if (Array.isArray(data)) return data
      return []
    },
    staleTime: 1000 * 30,
  })
}

// ─── Admin: All Users ─────────────────────────────────────────
export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const data = await authApi.listUsers(params)
      if (Array.isArray(data)) return data
      return []
    },
    staleTime: 1000 * 30,
  })
}

// ─── Audit Logs (stubbed — no backend endpoint yet) ──────────
export function useAuditLogs() {
  return useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => [],
    staleTime: 1000 * 30,
  })
}
