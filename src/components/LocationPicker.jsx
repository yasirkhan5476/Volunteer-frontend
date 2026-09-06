import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const DEFAULT_CENTER = [24.8716, 67.0598]

const pickerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapController({ position }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.8 })
  }, [map, position])

  return null
}

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click: ({ latlng }) => onLocationChange({ lat: latlng.lat, lng: latlng.lng }),
  })

  return null
}

export function LocationPicker({ latitude, longitude, radius, address, onLocationChange, onAddressChange }) {
  const parsedLatitude = Number(latitude)
  const parsedLongitude = Number(longitude)
  const position = [
    Number.isFinite(parsedLatitude) ? parsedLatitude : DEFAULT_CENTER[0],
    Number.isFinite(parsedLongitude) ? parsedLongitude : DEFAULT_CENTER[1],
  ]
  const safeRadius = Math.min(1000, Math.max(50, Number(radius) || 200))
  const [query, setQuery] = useState(address || '')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isResolvingAddress, setIsResolvingAddress] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    setQuery(address || '')
  }, [address])

  const selectLocation = (result) => {
    const lat = Number(result.lat)
    const lng = Number(result.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    setQuery(result.display_name)
    setSuggestions([])
    onAddressChange?.(result.display_name)
    onLocationChange({ lat, lng })
  }

  const reverseGeocodeLocation = async ({ lat, lng }) => {
    onLocationChange({ lat, lng })
    setSuggestions([])
    setSearchError('')
    setIsResolvingAddress(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,
        { headers: { Accept: 'application/json' } },
      )
      if (!response.ok) throw new Error('Reverse geocoding failed')
      const result = await response.json()
      const resolvedAddress = result.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setQuery(resolvedAddress)
      onAddressChange?.(resolvedAddress)
    } catch {
      const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setQuery(coordinates)
      onAddressChange?.(coordinates)
      setSearchError('Address name unavailable; coordinates were selected successfully.')
    } finally {
      setIsResolvingAddress(false)
    }
  }

  const searchAddress = async (event) => {
    event?.preventDefault()
    const searchTerm = query.trim()
    if (!searchTerm) return

    setIsSearching(true)
    setSearchError('')
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=pk&q=${encodeURIComponent(searchTerm)}`,
        { headers: { Accept: 'application/json' } },
      )
      if (!response.ok) throw new Error('Search request failed')
      const results = await response.json()
      setSuggestions(results)
      if (results.length === 1) selectLocation(results[0])
      if (results.length === 0) setSearchError('No locations found. Try a more specific address.')
    } catch {
      setSearchError('Address search is unavailable right now. You can select the map location manually.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60">
      <div className="border-b border-slate-700 p-3">
          <label htmlFor="event-location-search" className="mb-2 block text-sm font-medium text-slate-300">Search or select event address</label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              id="event-location-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setSuggestions([])
                setSearchError('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') searchAddress(event)
              }}
              placeholder={isResolvingAddress ? 'Finding selected location...' : 'Alkhidmat Head Office Karachi'}
              disabled={isResolvingAddress}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setSuggestions([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label="Clear address search">
                <X size={16} />
              </button>
            )}
          </div>
          <button type="button" onClick={searchAddress} disabled={isSearching || isResolvingAddress} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
            <Search size={16} /> {isSearching ? 'Searching' : 'Search'}
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
            {suggestions.map((result) => (
              <button key={`${result.place_id}`} type="button" onClick={() => selectLocation(result)} className="block w-full border-b border-slate-700 px-3 py-2 text-left text-sm text-slate-200 last:border-0 hover:bg-slate-700">
                {result.display_name}
              </button>
            ))}
          </div>
        )}
        {searchError && <p className="mt-2 text-xs text-amber-300">{searchError}</p>}
      </div>

      <div className="h-80">
        <MapContainer center={position} zoom={14} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController position={position} />
          <MapClickHandler onLocationChange={reverseGeocodeLocation} />
          <Marker
            position={position}
            icon={pickerIcon}
            draggable
            eventHandlers={{ dragend: (event) => reverseGeocodeLocation(event.target.getLatLng()) }}
          />
          <Circle center={position} radius={safeRadius} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.16 }} />
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700 px-4 py-3 text-xs text-slate-400">
        <span>Click the map or drag the pin to choose the event location.</span>
        <span className="text-emerald-300">Geofence: {safeRadius}m</span>
      </div>
    </div>
  )
}
