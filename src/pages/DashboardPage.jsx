import { Award, Clock3, Sparkles, Users } from 'lucide-react'
import { VolunteerPassportCard } from '../components/VolunteerPassportCard'
import { ProfileImageUpload } from '../components/ProfileImageUpload'
import { OrganizerStatusBanner } from '../components/OrganizerStatusBanner'
import { useMyAttendance, useMyPassports } from '../hooks/usePlatformData'
import { useAuthStore } from '../store/authStore'

export function DashboardPage() {
  const { data: attendance = [] } = useMyAttendance()
  const { data: passports = [] } = useMyPassports()
  const currentUser = useAuthStore((state) => state.user)

  // Build display name from backend response (firstName + lastName, or fullName)
  const volunteerName = currentUser
    ? currentUser.fullName ||
      [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') ||
      'Volunteer'
    : 'Volunteer'

  const presentEntries = attendance.filter((entry) =>
    ['CHECKED_IN', 'CHECKED_OUT', 'AUTO_CLOSED'].includes(entry.status),
  )
  const attendanceMarks =
    attendance.length > 0
      ? Math.round((presentEntries.length / attendance.length) * 100)
      : 0
  const totalHours = attendance.reduce(
    (sum, entry) => sum + Number(entry.hoursLogged || 0),
    0,
  )

  const stats = [
    {
      label: 'Attendance mark',
      value: `${attendanceMarks}%`,
      icon: Award,
      accent: 'text-emerald-300',
    },
    {
      label: 'Volunteer hours',
      value: `${totalHours}h`,
      icon: Clock3,
      accent: 'text-cyan-300',
    },
    {
      label: 'Events attended',
      value: String(presentEntries.length),
      icon: Users,
      accent: 'text-violet-300',
    },
  ]

  return (
    <div className="space-y-6">
      <OrganizerStatusBanner role={currentUser?.role} />
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
        <ProfileImageUpload user={currentUser} />
      </section>
      {/* ─── Welcome banner ─── */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-cyan-500/5 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Your dashboard</p>
        <h2 className="mt-1 text-2xl font-bold text-white">
          Welcome back, {currentUser?.firstName || volunteerName}! 🎉
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Track your impact, manage check-ins and download your volunteer passport.
        </p>
      </div>

      {/* ─── Stats row ─── */}
      <section className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-bold text-white">{value}</p>
              </div>
              <div className={`rounded-xl bg-slate-800 p-3 ${accent}`}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ─── Passport + Community goals ─── */}
      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        {/* Passport card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
                Impact tracker
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">Volunteer passport</h3>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <Sparkles size={14} />
              {passports.length > 0 ? 'Verified' : 'Pending'}
            </div>
          </div>
          <VolunteerPassportCard
            user={{
              fullName: volunteerName,
              role: currentUser?.role || 'VOLUNTEER',
              badge: passports.length > 0 ? 'Verified' : 'Bronze',
              hours: totalHours,
            }}
          />
        </div>

        {/* Community goals */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Next milestone</p>
          <h3 className="mt-2 text-2xl font-bold text-white">Community goals</h3>
          <div className="mt-5 space-y-4">
            {[
              {
                label: 'Events attended',
                value: String(presentEntries.length),
                color: 'bg-emerald-500/15 text-emerald-200',
              },
              {
                label: 'Hours contributed',
                value: `${totalHours}h`,
                color: 'bg-cyan-500/15 text-cyan-200',
              },
              {
                label: 'Training badges',
                value: String(Math.max(0, Math.floor(attendanceMarks / 10))),
                color: 'bg-violet-500/15 text-violet-200',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${item.color}`}
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Active deployment status */}
          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <p className="text-xl font-semibold text-white">
              {attendance.length > 0 ? 'Active volunteer' : 'No events yet'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {attendance.length > 0
                ? `${presentEntries.length} attendance records loaded from backend`
                : 'Your attendance records will appear here once you check in to an event.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
