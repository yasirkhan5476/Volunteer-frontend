import { ArrowLeft, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../services/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const result = await authApi.forgotPassword({ email: email.trim() })
      setMessage(result?.message || 'If an account exists for that email, a reset link has been sent.')
      setEmail('')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to send the reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-700 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
          <Mail size={20} />
        </div>
        <p className="text-xs uppercase tracking-[0.26em] text-emerald-300">Account recovery</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Forgot password?</h1>
        <p className="mt-3 text-sm text-slate-400">Enter your account email and we will send a password reset link.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="recovery-email" className="mb-2 block text-sm font-medium text-slate-200">Email address</label>
            <input
              id="recovery-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-500"
            />
          </div>

          {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
          {message && <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p>}

          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? 'Sending link...' : 'Send reset link'}
          </button>
        </form>

        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 transition hover:text-emerald-300">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </div>
    </div>
  )
}
