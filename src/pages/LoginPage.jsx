import { useState } from 'react'
import { ArrowRight, CheckCircle2, Eye, EyeOff, HandHeart, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePlatformStats } from '../hooks/usePlatformData'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const { data: stats } = usePlatformStats()
  const volunteerCount = Number(stats?.volunteers ?? 0)
  const organizerCount = Number(stats?.organizers ?? 0)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.welcomeMessage || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.email || !form.password) {
      setError('Please provide both email and password.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Step 1: Login → get tokens + basic user
      const data = await authApi.login({ email: form.email, password: form.password })

      // Store tokens immediately so /auth/me has the Bearer header
      login({
        accessToken: data?.accessToken,
        refreshToken: data?.refreshToken,
        user: data?.user,
      })

      // Step 2: Fetch full profile (firstName, lastName, role, volunteerProfile)
      try {
        const profile = await authApi.getMe()
        if (profile) {
          login({
            accessToken: data?.accessToken,
            refreshToken: data?.refreshToken,
            user: profile,
          })
        }
      } catch {
        // Non-fatal: basic user info from login is still usable
      }

      const firstName = data?.user?.firstName || ''
      setForm({ email: '', password: '' })
      setShowPassword(false)
      setSuccess(`Welcome back${firstName ? `, ${firstName}` : ''}! Redirecting…`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-700 bg-slate-900/80 shadow-2xl shadow-slate-950/40 lg:grid-cols-2">
        {/* ─── Left panel ─── */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-emerald-500/20 via-slate-900 to-cyan-500/10 p-8 md:p-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 font-bold text-slate-950">A</div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Alkhidmat</p>
                <h1 className="text-xl font-semibold text-white">Volunteer Services</h1>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Community impact</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight text-white">Serve communities with faster, safer outreach.</h2>
            <p className="mt-4 max-w-md text-slate-300">Coordinate volunteers, verify attendance through geofenced check-ins, issue verifiable credentials, and support donations for social welfare.</p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <HandHeart className="text-emerald-300" size={22} />
              <p className="mt-4 text-xl font-semibold text-white">{volunteerCount.toLocaleString()}</p>
              <p className="text-sm text-slate-300">Active volunteers</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <ShieldCheck className="text-cyan-300" size={22} />
              <p className="mt-4 text-xl font-semibold text-white">{organizerCount.toLocaleString()}</p>
              <p className="text-sm text-slate-300">Organizers onboarded</p>
            </div>
          </div>
        </div>

        {/* ─── Right panel ─── */}
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Welcome back</p>
            <h3 className="mt-2 text-3xl font-bold text-white">Sign in to your account</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none ring-0 transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-slate-100 outline-none ring-0 transition focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New to the platform?{' '}
            <Link to="/register" className="font-medium text-emerald-300">
              Create an account
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-slate-400">
            <Link to="/forgot-password" className="font-medium text-slate-400 hover:text-emerald-300">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
