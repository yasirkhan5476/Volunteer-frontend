import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (payload) => {
        set({
          token: payload.accessToken || payload.token,
          refreshToken: payload.refreshToken || null,
          user: payload.user,
          isAuthenticated: true,
        })
      },
      logout: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        })
      },
      hydrateFromSession: (payload) => {
        const current = get()
        set({
          token: payload?.accessToken || payload?.token || current.token,
          refreshToken: payload?.refreshToken || current.refreshToken,
          user: payload?.user ?? current.user,
          isAuthenticated: Boolean(payload?.accessToken || payload?.token || current.token),
        })
      },
    }),
    {
      name: 'alkhidmat-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export default useAuthStore
