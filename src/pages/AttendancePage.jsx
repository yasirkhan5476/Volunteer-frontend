import { CalendarCheck, Clock3, MapPin, Timer, Users } from 'lucide-react'
import { useMyAttendance } from '../hooks/usePlatformData'

const statusStyles = {
  CHECKED_IN: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200',
  CHECKED_OUT: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  AUTO_CLOSED: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
}

function formatDate(value) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleString()
}

export function AttendancePage() {
  const { data: attendance = [], isLoading, isError } = useMyAttendance()
  const totalHours = attendance.reduce((sum, record) => sum + Number(record.hoursLogged || 0), 0)
  const completedEvents = attendance.filter((record) => ['CHECKED_OUT', 'AUTO_CLOSED'].includes(record.status)).length

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Volunteer record</p>
        <h2 className="mt-2 text-3xl font-bold text-white">My attended events</h2>
        <p className="mt-2 text-sm text-slate-400">Review your check-ins, check-outs, hours, and event locations.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><CalendarCheck className="text-emerald-300" size={19} /><p className="mt-3 text-2xl font-bold text-white">{attendance.length}</p><p className="text-xs text-slate-400">Attendance records</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><Users className="text-cyan-300" size={19} /><p className="mt-3 text-2xl font-bold text-white">{completedEvents}</p><p className="text-xs text-slate-400">Events completed</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><Clock3 className="text-violet-300" size={19} /><p className="mt-3 text-2xl font-bold text-white">{totalHours.toFixed(2)}h</p><p className="text-xs text-slate-400">Total hours</p></div>
        </div>
      </section>

      {isLoading && <p className="text-sm text-slate-400">Loading your attended events...</p>}
      {isError && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">Unable to load your attendance history.</p>}
      {!isLoading && !isError && attendance.length === 0 && <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center"><CalendarCheck className="mx-auto text-slate-500" size={30} /><p className="mt-3 text-lg font-semibold text-white">No attended events yet</p><p className="mt-2 text-sm text-slate-400">Check in to an event and it will appear here.</p></div>}

      <section className="space-y-4">
        {attendance.map((record) => {
          const event = record.event || {}
          const status = record.status || 'CHECKED_IN'
          return (
            <article key={record.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Attended event</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{event.title || 'Event information unavailable'}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-400"><MapPin size={15} className="text-cyan-300" />{event.address || 'Location not recorded'}</div>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.CHECKED_IN}`}>{status.replace('_', ' ')}</span>
              </div>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-xl bg-slate-950/60 p-3"><p className="text-slate-500">Event time</p><p className="mt-1 text-slate-200">{formatDate(event.startTime)}<br />to {formatDate(event.endTime)}</p></div>
                <div className="rounded-xl bg-slate-950/60 p-3"><p className="text-slate-500">Your check-in</p><p className="mt-1 text-slate-200">{formatDate(record.checkInTime)}</p></div>
                <div className="rounded-xl bg-slate-950/60 p-3"><p className="text-slate-500">Your check-out</p><p className="mt-1 text-slate-200">{record.checkOutTime ? formatDate(record.checkOutTime) : 'Still checked in'}{record.hoursLogged != null && <><br /><span className="text-emerald-300">{Number(record.hoursLogged).toFixed(2)} hours logged</span></>}</p></div>
              </div>
              {status === 'AUTO_CLOSED' && <p className="mt-4 flex items-center gap-2 text-xs text-amber-200"><Timer size={14} /> Automatically checked out when the event ended.</p>}
            </article>
          )
        })}
      </section>
    </div>
  )
}