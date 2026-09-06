import { useEffect } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'

function MapViewport({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [center, map, zoom])

  return null
}

function LocationPicker({ onSelect }) {
  useMapEvents({
    click: (event) => onSelect(event.latlng),
  })

  return null
}

export function EventLocationMap({ latitude, longitude, radius, onLocationChange }) {
  const center = [Number(latitude) || 31.5204, Number(longitude) || 74.3587]
  const safeRadius = Number(radius) || 200

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60">
      <div className="h-80">
        <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewport center={center} zoom={14} />
          <LocationPicker onSelect={onLocationChange} />
          <Marker position={center}>
            <Popup>Event location</Popup>
          </Marker>
          <Circle center={center} radius={safeRadius} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.16 }} />
        </MapContainer>
      </div>
      <p className="border-t border-slate-700 px-4 py-3 text-xs text-slate-400">
        Click the map to set the event location. The green circle shows the {safeRadius}m attendance geofence.
      </p>
    </div>
  )
}

export function EventsOverviewMap({ events }) {
  const firstEvent = events.find((event) => Number.isFinite(Number(event.latitude)) && Number.isFinite(Number(event.longitude)))
  const center = firstEvent ? [Number(firstEvent.latitude), Number(firstEvent.longitude)] : [31.5204, 74.3587]

  return (
    <div className="h-120 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <MapContainer center={center} zoom={11} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((event) => {
          const latitude = Number(event.latitude)
          const longitude = Number(event.longitude)
          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

          return (
            <Marker key={event.id} position={[latitude, longitude]}>
              <Popup>
                <strong>{event.title}</strong>
                <br />
                {event.address || 'Event location'}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
