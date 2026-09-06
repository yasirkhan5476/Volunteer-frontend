import { Bell, LayoutDashboard, LogOut, ShieldCheck, UserCheck } from 'lucide-react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function AdminLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  if (!['SUPER_ADMIN', 'ADMIN'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
      isActive ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-[70vh] rounded-2xl border border-slate-800 bg-slate-950/60 lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="border-b border-slate-800 p-4 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-sm font-bold text-slate-950">A</div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Control room</p>
            <p className="font-semibold text-white">Super Admin</p>
          </div>
        </div>
        <nav className="mt-5 space-y-2">
          <NavLink to="/admin/approvals" end className={navClass}><UserCheck size={17} /> Approvals</NavLink>
          <NavLink to="/admin" end className={navClass}><LayoutDashboard size={17} /> Operations</NavLink>
        </nav>
        <button type="button" onClick={handleLogout} className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-rose-300">
          <LogOut size={17} /> Sign out
        </button>
      </aside>
      <section className="min-w-0 p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Alkhidmat platform</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Administration</h2>
          </div>
          <div className="relative rounded-xl border border-slate-700 bg-slate-900 p-2 text-cyan-300" title="Notifications">
            <Bell size={18} />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
          </div>
        </header>
        <Outlet />
      </section>
    </div>
  )
}
