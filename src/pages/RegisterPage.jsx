import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'VOLUNTEER',
    password: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─── Validation aligned with backend Zod schema ────────────
  const validateForm = () => {
    const errors = {}
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()
    const password = form.password

    if (!firstName || !/^[A-Za-z][A-Za-z\s'-]{1,}$/.test(firstName)) {
      errors.firstName = 'First name should contain at least 2 letters and no numbers.'
    }

    if (!lastName || !/^[A-Za-z][A-Za-z\s'-]{1,}$/.test(lastName)) {
      errors.lastName = 'Last name should contain at least 2 letters and no numbers.'
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.'
    }

    // Match backend: +92 followed by exactly 10 digits (total 13 chars)
    if (phone && !/^\+92[0-9]{10}$/.test(phone)) {
      errors.phone = 'Phone must be in format +92XXXXXXXXXX (13 characters).'
    }

    if (
      !password ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      errors.password =
        'Password must be at least 8 characters with an uppercase letter and a number.'
    }

    return errors
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateForm()
    setFieldErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setError('Please correct the highlighted fields and try again.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        ...(form.phone.trim() && { phone: form.phone.trim() }),
      }

      await authApi.register(payload)

      setForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'VOLUNTEER',
        password: '',
        phone: '',
      })
      setShowPassword(false)
      setFieldErrors({})

      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: form.email.trim(),
          welcomeMessage: 'Account created successfully. Please sign in to continue.',
        },
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full rounded-xl border bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500 ${
      fieldErrors[field] ? 'border-rose-500' : 'border-slate-700'
    }`

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-700 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
            <UserPlus size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-emerald-300">Alkhidmat</p>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name row */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-200">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className={inputClass('firstName')}
                placeholder="First name"
              />
              {fieldErrors.firstName && (
                <p className="mt-2 text-xs text-rose-300">{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-200">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={inputClass('lastName')}
                placeholder="Last name"
              />
              {fieldErrors.lastName && (
                <p className="mt-2 text-xs text-rose-300">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass('email')}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="mt-2 text-xs text-rose-300">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-200">
              Phone number{' '}
              <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClass('phone')}
              placeholder="+923001234567"
            />
            {fieldErrors.phone && (
              <p className="mt-2 text-xs text-rose-300">{fieldErrors.phone}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">Format: +92 followed by 10 digits</p>
          </div>

          {/* Role toggle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">I am joining as</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {['VOLUNTEER', 'ORGANIZER_PENDING'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, role }))}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${
                    form.role === role
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-700 bg-slate-800 text-slate-300'
                  }`}
                >
                  {role === 'ORGANIZER_PENDING' ? 'Organizer' : 'Volunteer'}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className={`${inputClass('password')} pr-12`}
                placeholder="Create a strong password"
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
            {fieldErrors.password && (
              <p className="mt-2 text-xs text-rose-300">{fieldErrors.password}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Min 8 chars, at least 1 uppercase letter and 1 number
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
