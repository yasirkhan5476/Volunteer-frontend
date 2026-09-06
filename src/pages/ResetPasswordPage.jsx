import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../services/api'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('This password reset link is missing its token.')
      return
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be at least 8 characters with an uppercase letter and a number.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authApi.resetPassword({ token, password })
      setMessage(result?.message || 'Password reset successfully. You can now sign in.')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to reset the password. The link may be expired.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordInput = (value, setValue, visible, setVisible, id, label) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-slate-100 outline-none transition focus:border-emerald-500"
        />
        <button type="button" onClick={() => setVisible((current) => !current)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-700 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
          <LockKeyhole size={20} />
        </div>
        <p className="text-xs uppercase tracking-[0.26em] text-emerald-300">Account recovery</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Set a new password</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {passwordInput(password, setPassword, showPassword, setShowPassword, 'new-password', 'New password')}
          {passwordInput(confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword, 'confirm-password', 'Confirm password')}
          <p className="text-xs text-slate-500">Use at least 8 characters, including one uppercase letter and one number.</p>
          {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
          {message && <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p>}
          <button type="submit" disabled={isSubmitting || Boolean(message)} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? 'Updating password...' : 'Update password'}
          </button>
        </form>

        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 transition hover:text-emerald-300">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </div>
    </div>
  )
}
