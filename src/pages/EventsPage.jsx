import { Map, MapPinned } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GeofenceCheckInModal } from '../components/GeofenceCheckInModal'
import { EventsOverviewMap } from '../components/EventMap'
import { useEvents, useMyAttendance } from '../hooks/usePlatformData'

export function EventsPage() {
  const [view, setView] = useState('grid')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const { data: events = [] } = useEvents()
  const { data: attendance = [] } = useMyAttendance()

  const formatEventDate = (event) => {
    const value = new Date(event.startTime || event.date || event.createdAt || Date.now())
    return Number.isNaN(value.getTime()) ? 'Upcoming' : value.toLocaleDateString()
  }

  const formatEventTime = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'Time unavailable' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Community events</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Discover and join</h2>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 p-1">
          <button type="button" onClick={() => setView('grid')} className={`rounded-lg px-3 py-2 text-sm font-medium ${view === 'grid' ? 'bg-emerald-500/15 text-emerald-200' : 'text-slate-300'}`}>
            Grid
          </button>
          <button type="button" onClick={() => setView('map')} className={`rounded-lg px-3 py-2 text-sm font-medium ${view === 'map' ? 'bg-emerald-500/15 text-emerald-200' : 'text-slate-300'}`}>
            Map
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">{event.status}</span>
                <span className="text-xs text-slate-400">{event.volunteersNeeded} spots</span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-white">{event.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{event.description || 'Community volunteer opportunity'}</p>

              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2"><MapPinned size={15} className="text-cyan-300" /> {event.address || event.location || 'Lahore, Pakistan'}</div>
                <div className="flex items-center gap-2"><Map size={15} className="text-emerald-300" /> {formatEventDate(event)} · {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}</div>
              </div>

              <div className="mt-5 flex gap-3">
                <Link to={`/events/${event.id}`} className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-700">
                  View details
                </Link>
                <button type="button" onClick={() => setSelectedEvent(event)} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-3 py-2.5 text-sm font-semibold text-slate-950">
                  {attendance.some((entry) => entry.eventId === event.id && entry.status === 'CHECKED_IN') ? 'Check out' : 'Check in'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EventsOverviewMap events={events} />
      )}

      <GeofenceCheckInModal
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        activeAttendance={attendance.find((entry) => entry.eventId === selectedEvent?.id && entry.status === 'CHECKED_IN')}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}
