import { Dialog, Transition } from '@headlessui/react'
import { AlertTriangle, CheckCircle2, Loader2, MapPin, MapPinned, X } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '../services/api'

// Haversine distance in metres between two lat/lng pairs
const haversineMetres = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371000 // Earth radius in metres
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function GeofenceCheckInModal({ open, onClose, event, activeAttendance = null }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('idle') // idle | loading | ready | submitting | success | error
  const [location, setLocation] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use backend field names: radiusMeters, latitude, longitude, address
  const eventLat = event?.latitude ?? 31.5204
  const eventLng = event?.longitude ?? 74.3587
  const eventRadius = event?.radiusMeters ?? event?.geofenceRadius ?? 200

  const distanceMetres = useMemo(() => {
    if (!location || !event) return null
    return haversineMetres(location.latitude, location.longitude, eventLat, eventLng)
  }, [location, event, eventLat, eventLng])

  const insideGeofence = distanceMetres !== null && distanceMetres <= eventRadius

  const requestLocation = () => {
    setStatus('loading')
    setError('')

    if (!navigator.geolocation) {
      setStatus('error')
      setError('Geolocation is not supported in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setStatus('ready')
      },
      (geoError) => {
        setStatus('error')
        setError(
          geoError.code === 1
            ? 'Location access was denied. Enable geolocation permissions and try again.'
            : 'Unable to retrieve your location. Please try again.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleCheckIn = async () => {
    if (!location || !event) return

    setIsSubmitting(true)
    setStatus('submitting')
    setError('')

    try {
      await attendanceApi.checkIn({
        eventId: event.id,
        latitude: location.latitude,
        longitude: location.longitude,
      })
      setStatus('success')
      setTimeout(() => {
        onClose()
        setStatus('idle')
        setLocation(null)
      }, 1500)
    } catch (err) {
      setStatus('error')
      setError(
        err?.response?.data?.message || 'Attendance check-in failed. Please retry in a moment.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckOut = async () => {
    if (!location || !activeAttendance) return

    setIsSubmitting(true)
    setStatus('submitting')
    setError('')

    try {
      await attendanceApi.checkOut({
        attendanceId: activeAttendance.id,
        latitude: location.latitude,
        longitude: location.longitude,
      })
      await queryClient.invalidateQueries({ queryKey: ['attendance', 'my'] })
      await queryClient.invalidateQueries({ queryKey: ['passport', 'my'] })
      setStatus('success')
      setTimeout(() => {
        onClose()
        setStatus('idle')
        setLocation(null)
      }, 1500)
    } catch (err) {
      setStatus('error')
      setError(err?.response?.data?.message || 'Attendance check-out failed. Please retry in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state after animation
    setTimeout(() => {
      setStatus('idle')
      setLocation(null)
      setError('')
    }, 200)
  }

  const radarColor = insideGeofence
    ? { border: 'border-emerald-400/70', bg: 'bg-emerald-500/10', inner: 'border-emerald-400/50' }
    : { border: 'border-rose-500/60', bg: 'bg-rose-500/10', inner: 'border-rose-500/50' }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-slate-950/40">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
                      {activeAttendance ? 'Geofenced check-out' : 'Geofenced check-in'}
                    </p>
                    <Dialog.Title as="h3" className="mt-2 text-2xl font-semibold text-white">
                      {event?.title}
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full border border-slate-700 p-2 text-slate-300 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Radar indicator */}
                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <MapPin size={16} className="text-emerald-300" />
                      <span>{event?.address || event?.location || 'Event location'}</span>
                    </div>
                    <div className="rounded-full border border-slate-600 bg-slate-900 px-2 py-1 text-xs uppercase tracking-[0.15em] text-slate-200">
                      {eventRadius}m radius
                    </div>
                  </div>

                  {/* Radar circle */}
                  <div className="mt-5 flex items-center justify-center">
                    <div
                      className={`relative flex h-28 w-28 items-center justify-center rounded-full border-2 ${radarColor.border} ${radarColor.bg} shadow-lg`}
                    >
                      <div className={`absolute h-20 w-20 rounded-full border ${radarColor.inner}`} />
                      <div className="absolute h-28 w-28 animate-ping rounded-full border border-cyan-400/30" />
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950">
                        {status === 'loading' ? (
                          <Loader2 size={22} className="animate-spin text-cyan-300" />
                        ) : status === 'success' ? (
                          <CheckCircle2 size={24} className="text-emerald-400" />
                        ) : insideGeofence ? (
                          <CheckCircle2 size={24} className="text-emerald-400" />
                        ) : (
                          <AlertTriangle size={24} className="text-rose-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    {status === 'success' ? (
                      <p className="text-lg font-semibold text-emerald-300">
                        ✅ {activeAttendance ? 'Checked out' : 'Checked in'} successfully!
                      </p>
                    ) : status === 'loading' ? (
                      <p className="text-lg font-semibold text-slate-300">Acquiring location…</p>
                    ) : (
                      <p className="text-lg font-semibold text-white">
                        {location
                          ? insideGeofence
                            ? 'Inside geofence ✓'
                            : 'Outside geofence ✗'
                          : 'Location not yet acquired'}
                      </p>
                    )}
                    {distanceMetres !== null && (
                      <p className="mt-1 text-sm text-slate-300">
                        <span className="font-medium">Distance:</span> {Math.round(distanceMetres)} m from event
                        {!insideGeofence && (
                          <span className="ml-1 text-rose-300">
                            (need to be within {eventRadius}m)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={status === 'loading' || status === 'submitting' || status === 'success'}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MapPinned size={16} />
                    {location ? 'Refresh my location' : 'Use current location'}
                  </button>

                  {error && (
                    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                      {error}
                    </p>
                  )}

                  {location && (
                    <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-slate-300">
                      <p>
                        <span className="font-medium text-white">Your coordinates:</span>{' '}
                        {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!location || isSubmitting || status === 'success'}
                    onClick={activeAttendance ? handleCheckOut : handleCheckIn}
                    className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting…' : activeAttendance ? 'Confirm check-out' : 'Confirm check-in'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
