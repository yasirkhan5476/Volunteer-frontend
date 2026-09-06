import { ArrowLeft, CheckCheck, MapPinned, QrCode, TimerReset } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GeofenceCheckInModal } from '../components/GeofenceCheckInModal'
import { useEventById, useMyAttendance } from '../hooks/usePlatformData'

export function EventDetailPage() {
  const { id } = useParams()
  const { data: event } = useEventById(id)
  const { data: attendance = [] } = useMyAttendance()
  const [checkInOpen, setCheckInOpen] = useState(false)
  const activeAttendance = attendance.find((entry) => entry.eventId === id && entry.status === 'CHECKED_IN')

  if (!event) {
    return (
      <div className="space-y-6">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <ArrowLeft size={16} />
          Back to events
        </Link>

        <div className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-8 text-center shadow-2xl shadow-slate-950/20">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Event unavailable</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Event not found</h2>
          <p className="mt-3 text-slate-300">The selected event could not be found or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
        <ArrowLeft size={16} />
        Back to events
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-950/20">
        <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-slate-900 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Event details</p>
              <h2 className="mt-3 text-3xl font-bold text-white">{event.title}</h2>
            </div>
            <button type="button" onClick={() => setCheckInOpen(true)} className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950">
              {activeAttendance ? 'Check out' : 'Register & Check in'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <p className="text-slate-300">{event.description || 'Community service opportunity.'}</p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-slate-300">
                <MapPinned size={18} className="text-emerald-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Location</p>
                  <p className="mt-1 font-medium text-white">{event.address || event.location || 'Lahore, Pakistan'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-slate-300">
                <TimerReset size={18} className="text-cyan-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Starting & ending time</p>
                  <p className="mt-1 font-medium text-white">
                    {new Date(event.startTime || event.date || Date.now()).toLocaleString()} - {new Date(event.endTime || event.startTime || event.date || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="flex items-center gap-3">
              <QrCode size={18} className="text-emerald-300" />
              <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Attendance</p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Status</p>
              <div className="mt-3 flex items-center gap-2 text-emerald-300">
                <CheckCheck size={16} />
                Registration open
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Geofence</p>
              <p className="mt-2">Radius: {event.radiusMeters || event.geofenceRadius || 200}m</p>
              <p>Coordinates: {event.latitude ?? event.coordinates?.[0] ?? 31.5204}, {event.longitude ?? event.coordinates?.[1] ?? 74.3587}</p>
            </div>
          </div>
        </div>
      </div>

      <GeofenceCheckInModal open={checkInOpen} event={event} activeAttendance={activeAttendance} onClose={() => setCheckInOpen(false)} />
    </div>
  )
}
