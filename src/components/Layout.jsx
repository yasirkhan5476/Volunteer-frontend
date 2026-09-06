import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  CreditCard,
  ClipboardCheck,
  HandCoins,
  Home,
  LogOut,
  ShieldCheck,
  UserCircle2,
  UserCheck,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const allNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Events', path: '/events', icon: CalendarDays },
  { label: 'My attendance', path: '/attendance', icon: ClipboardCheck },
  { label: 'Donate', path: '/donate', icon: HandCoins },
  { label: 'Organizer', path: '/organizer', icon: ShieldCheck, roles: ['ORGANIZER'] },
  { label: 'Approvals', path: '/admin/approvals', icon: UserCheck, roles: ['SUPER_ADMIN'] },
]

export function Layout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const role = user?.role || 'VOLUNTEER'

  // Build display name — backend returns firstName + lastName (and fullName as a computed field)
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Volunteer'

  const navItems = allNavItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        {/* ─── Sidebar ─── */}
        <aside className="border-b border-slate-800 bg-slate-950/80 p-4 backdrop-blur-sm lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-lg font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
              A
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Alkhidmat</p>
              <h1 className="text-base font-semibold text-white">Volunteer Services</h1>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ─── User card ─── */}
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                <UserCircle2 size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-500/40 hover:text-rose-300"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 p-4 md:p-8">
          <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 shadow-2xl shadow-slate-950/30 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Volunteer platform</p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Welcome, {user?.firstName || displayName} 👋
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Live network
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
                <CreditCard size={15} className="text-cyan-300" />
                Secure payments
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
