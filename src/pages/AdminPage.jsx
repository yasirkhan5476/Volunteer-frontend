import { Search, ShieldCheck, UserCog, Users } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAttendance, useAuditLogs } from '../hooks/usePlatformData'
import { useAuthStore } from '../store/authStore'
import { eventsApi } from '../services/api'
import { LocationPicker } from '../components/LocationPicker'

export function AdminPage() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role || 'VOLUNTEER'

  if (!['ORGANIZER', 'SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Event creation form state — includes lat/lng so geofence works
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '11:00',
    location: '',
    latitude: '24.8716',
    longitude: '67.0598',
    radius: 200,
    maxVolunteers: 30,
  })

  const { data: auditLogs = [] } = useAuditLogs()
  const { data: attendanceTable = [] } = useAdminAttendance()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleMapLocationChange = ({ lat, lng }) => {
    setForm((current) => ({
      ...current,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }))
  }

  const handleCreateEvent = async (event) => {
    event.preventDefault()
    setFormError('')
    setFormSuccess('')

    // Front-end validation
    if (!form.title.trim() || form.title.trim().length < 5) {
      setFormError('Event title must be at least 5 characters.')
      return
    }
    if (!form.date) {
      setFormError('Please select a date for the event.')
      return
    }
    if (!form.startTime || !form.endTime || form.endTime <= form.startTime) {
      setFormError('End time must be later than the start time.')
      return
    }
    const lat = Number(form.latitude)
    const lng = Number(form.longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setFormError('Latitude must be between -90 and 90.')
      return
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      setFormError('Longitude must be between -180 and 180.')
      return
    }

    setIsSubmitting(true)
    try {
      const startTime = new Date(`${form.date}T${form.startTime}:00`).toISOString()
      const endTime = new Date(`${form.date}T${form.endTime}:00`).toISOString()

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        organizationId: user.id,
        latitude: lat,
        longitude: lng,
        radiusMeters: Number(form.radius),
        address: form.location.trim() || undefined,
        startTime,
        endTime,
        maxVolunteers: Number(form.maxVolunteers) || 30,
      }

      await eventsApi.create(payload)
      setFormSuccess('Event published successfully! It will appear in the Events page.')
      setForm({
        title: '',
        description: '',
        date: '',
        startTime: '09:00',
        endTime: '11:00',
        location: '',
        latitude: '24.8716',
        longitude: '67.0598',
        radius: 200,
        maxVolunteers: 30,
      })
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Unable to create this event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredLogs = auditLogs.filter((entry) =>
    `${entry.actor} ${entry.action} ${entry.severity}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  // Normalize attendance rows: user and event come from backend include
  const normalizedAttendance = attendanceTable.map((row) => {
    const status = row.status || 'PENDING'
    const displayStatus = status.includes('CHECKED')
      ? 'Present'
      : status.includes('MANUAL')
        ? 'Manual review'
        : 'Pending'

    const volunteerName = row.user
      ? `${row.user.firstName || ''} ${row.user.lastName || ''}`.trim() || row.user.email
      : 'Unknown'

    return {
      ...row,
      volunteerName,
      eventTitle: row.event?.title || '—',
      displayStatus,
      attendanceMark: row.hoursLogged
        ? Math.min(100, Math.round((Number(row.hoursLogged) / 8) * 100))
        : 0,
    }
  })

  return (
    <div className="space-y-6">
      {/* ─── Create Event form ─── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-2 text-violet-300">
            <UserCog size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-violet-300">Operations hub</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Create event &amp; manage attendance</h2>
          </div>
        </div>

        <form onSubmit={handleCreateEvent} className="mt-6 grid gap-5 md:grid-cols-2">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Event title <span className="text-rose-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
              placeholder="Community health outreach (min 5 chars)"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
              placeholder="Describe the service activity and volunteer scope."
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Date <span className="text-rose-400">*</span>
            </label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
            />
          </div>

          {/* Start time */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Start time</label>
            <input
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
            />
          </div>

          {/* End time */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">End time</label>
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-300">Address / location name</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
              placeholder="e.g. Alkhidmat Office, Model Town Lahore"
            />
          </div>

          {/* Read-only coordinates selected from the map */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Latitude <span className="text-rose-400">*</span>
            </label>
            <input
              name="latitude"
              type="number"
              step="any"
              value={form.latitude}
              readOnly
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
              placeholder="31.5204"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Longitude <span className="text-rose-400">*</span>
            </label>
            <input
              name="longitude"
              type="number"
              step="any"
              value={form.longitude}
              readOnly
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
              placeholder="74.3587"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-300">Event map location</label>
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              radius={form.radius}
              address={form.location}
              onLocationChange={handleMapLocationChange}
              onAddressChange={(location) => setForm((current) => ({ ...current, location }))}
            />
          </div>

          {/* Geofence radius */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Geofence radius: <span className="font-bold text-violet-300">{form.radius} meters</span>
            </label>
            <input
              name="radius"
              type="range"
              min="50"
              max="1000"
              value={form.radius}
              onChange={handleChange}
              className="w-full accent-violet-500"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>50m</span>
              <span>1000m</span>
            </div>
          </div>

          {/* Max volunteers */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Max volunteers</label>
            <input
              name="maxVolunteers"
              type="number"
              min="1"
              value={form.maxVolunteers}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-violet-500"
            />
          </div>

          {/* Error / Success */}
          {formError && (
            <div className="md:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="md:col-span-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {formSuccess}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Publishing…' : 'Publish event'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Audit log + Attendance tables ─── */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Audit log */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-violet-300">
              <ShieldCheck size={18} />
              <h3 className="text-xl font-semibold text-white">Audit log</h3>
            </div>
            <div className="relative w-48">
              <Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search actions"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-300">
                <tr>
                  <th className="px-3 py-3">Actor</th>
                  <th className="px-3 py-3">Action</th>
                  <th className="px-3 py-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-800 bg-slate-900/60 text-slate-200">
                      <td className="px-3 py-3">{entry.actor}</td>
                      <td className="px-3 py-3">{entry.action}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            entry.severity === 'Critical'
                              ? 'bg-rose-500/15 text-rose-200'
                              : entry.severity === 'Warning'
                                ? 'bg-amber-500/15 text-amber-200'
                                : 'bg-emerald-500/15 text-emerald-200'
                          }`}
                        >
                          {entry.severity}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-3 py-6 text-center text-sm text-slate-400">
                      No audit logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance verification */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center gap-2 text-cyan-300">
            <Users size={18} />
            <h3 className="text-xl font-semibold text-white">Attendance verification</h3>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-300">
                <tr>
                  <th className="px-3 py-3">Volunteer</th>
                  <th className="px-3 py-3">Event</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Hours</th>
                </tr>
              </thead>
              <tbody>
                {normalizedAttendance.length > 0 ? (
                  normalizedAttendance.map((row) => (
                    <tr key={row.id} className="border-t border-slate-800 bg-slate-900/60 text-slate-200">
                      <td className="px-3 py-3">{row.volunteerName}</td>
                      <td className="px-3 py-3 text-slate-400">{row.eventTitle}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            row.displayStatus === 'Present'
                              ? 'bg-emerald-500/15 text-emerald-200'
                              : row.displayStatus === 'Manual review'
                                ? 'bg-amber-500/15 text-amber-200'
                                : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {row.displayStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-cyan-200">
                        {Number(row.hoursLogged || 0).toFixed(1)}h
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-3 py-6 text-center text-sm text-slate-400">
                      No attendance records yet. Volunteer check-ins will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
