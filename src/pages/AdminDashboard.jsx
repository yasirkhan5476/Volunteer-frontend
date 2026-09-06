import { Activity, CalendarDays, CheckCircle2, Clock3, Coins, UserCheck, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../services/api'

const emptyAnalytics = {
  users: { total: 0, active: 0, volunteers: 0, organizers: 0, pendingOrganizers: 0, recentLogins: 0 },
  events: { total: 0, active: 0 },
  attendance: { total: 0 },
  donations: { total: 0, completed: 0, received: 0 },
}

function MetricCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{detail}</p>
        </div>
        <div className={`rounded-xl bg-slate-800 p-3 ${tone}`}><Icon size={20} /></div>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const { data: analytics = emptyAnalytics, isLoading, isError } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminApi.analytics,
    refetchInterval: 60_000,
  })

  const users = analytics.users || emptyAnalytics.users
  const events = analytics.events || emptyAnalytics.events
  const attendance = analytics.attendance || emptyAnalytics.attendance
  const donations = analytics.donations || emptyAnalytics.donations
  const approvalRate = users.organizers + users.pendingOrganizers > 0
    ? Math.round((users.organizers / (users.organizers + users.pendingOrganizers)) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Platform overview</p>
          <h3 className="mt-2 text-3xl font-bold text-white">Live analytics</h3>
          <p className="mt-2 text-sm text-slate-400">Operational totals calculated from the platform database.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400"><Activity size={15} className="text-emerald-300" /> Auto-refreshes every minute</div>
      </div>

      {isError && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">Analytics could not be loaded. Check the API connection.</p>}
      {isLoading && <p className="text-sm text-slate-400">Loading live analytics...</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total volunteers" value={users.volunteers.toLocaleString()} detail={`${users.active.toLocaleString()} active platform users`} icon={Users} tone="text-emerald-300" />
        <MetricCard label="Volunteer logins" value={users.recentLogins.toLocaleString()} detail="Successful logins in the last 30 days" icon={UserCheck} tone="text-cyan-300" />
        <MetricCard label="Donations received" value={`PKR ${Number(donations.received).toLocaleString()}`} detail={`${donations.completed.toLocaleString()} completed of ${donations.total.toLocaleString()} total`} icon={Coins} tone="text-amber-300" />
        <MetricCard label="Attendance records" value={attendance.total.toLocaleString()} detail="Check-in and check-out activity" icon={CheckCircle2} tone="text-violet-300" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 lg:col-span-2">
          <div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Community activity</p><h4 className="mt-1 text-xl font-semibold text-white">People and events</h4></div><CalendarDays className="text-cyan-300" size={21} /></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-800/70 p-4"><p className="text-xs text-slate-400">Organizers</p><p className="mt-2 text-2xl font-bold text-white">{users.organizers.toLocaleString()}</p><p className="mt-1 text-xs text-emerald-300">{approvalRate}% approved rate</p></div>
            <div className="rounded-xl bg-slate-800/70 p-4"><p className="text-xs text-slate-400">Pending approvals</p><p className="mt-2 text-2xl font-bold text-white">{users.pendingOrganizers.toLocaleString()}</p><p className="mt-1 text-xs text-amber-300">Needs review</p></div>
            <div className="rounded-xl bg-slate-800/70 p-4"><p className="text-xs text-slate-400">Active events</p><p className="mt-2 text-2xl font-bold text-white">{events.active.toLocaleString()}</p><p className="mt-1 text-xs text-cyan-300">{events.total.toLocaleString()} total created</p></div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5"><Clock3 className="text-emerald-300" size={21} /><p className="mt-4 text-sm text-slate-400">Recent sign-ins</p><p className="mt-2 text-3xl font-bold text-white">{users.recentLogins.toLocaleString()}</p><p className="mt-2 text-sm leading-6 text-slate-400">Unique users with a successful login during the last 30 days.</p></div>
      </section>
    </div>
  )
}