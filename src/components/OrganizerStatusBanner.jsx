import { Clock3, ShieldAlert } from 'lucide-react'

export function OrganizerStatusBanner({ role }) {
  if (role !== 'ORGANIZER_PENDING') return null

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100 shadow-lg shadow-amber-950/10">
      <ShieldAlert className="mt-0.5 shrink-0 text-amber-300" size={21} />
      <div>
        <div className="flex items-center gap-2 font-semibold">
          <span>Organizer application under review</span>
          <Clock3 className="animate-pulse text-amber-300" size={16} />
        </div>
        <p className="mt-1 text-sm leading-6 text-amber-100/80">
          Your organizer application is under review by Alkhidmat Admins. Live publishing, donation setups, and QR scanning are restricted.
        </p>
      </div>
    </div>
  )
}
