import { Download, ShieldCheck, Sparkles } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export function VolunteerPassportCard({ user = { fullName: 'Volunteer', role: 'Volunteer', badge: 'Bronze', hours: 0 } }) {
  const fullName = user.fullName || 'Volunteer'
  const credential = {
    type: ['VerifiableCredential', 'VolunteerPassport'],
    issuer: 'Alkhidmat Volunteer Services',
    issuedAt: new Date().toISOString(),
    credentialSubject: {
      id: `did:alkhidmat:volunteer:${fullName.toLowerCase().replace(/\s+/g, '-')}`,
      name: fullName,
      role: user.role,
      level: user.badge,
      lifetimeHours: user.hours,
    },
  }

  const exportCredential = () => {
    const blob = new Blob([JSON.stringify(credential, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'alkhidmat-volunteer-passport.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-5 shadow-2xl shadow-emerald-950/20 ring-1 ring-white/5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300">Volunteer Passport</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{fullName}</h3>
        </div>
        <div className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
          {user.badge || 'Bronze'} Level
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-300" /> Verifiable Credential</span>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-cyan-200">Active</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
              <p className="text-slate-400">Hours</p>
              <p className="mt-2 text-xl font-bold text-white">{user.hours || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-3">
              <p className="text-slate-400">Role</p>
              <p className="mt-2 break-words text-sm font-bold uppercase leading-tight text-white sm:text-base">
                {user.role || 'Volunteer'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100/90">
            <div className="mb-2 flex items-center gap-2 font-medium"><Sparkles size={14} /> Trust anchor</div>
            <p>Issued by Alkhidmat Volunteer Services. Verified on encrypted claim registry with QR-linked attendance evidence.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
          <div className="rounded-2xl bg-white p-3 shadow-lg shadow-slate-950/40">
            <QRCodeSVG value={JSON.stringify(credential)} size={150} bgColor="#ffffff" fgColor="#0f172a" />
          </div>
          <button
            type="button"
            onClick={exportCredential}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            <Download size={16} />
            Export Verifiable Credential (.json)
          </button>
        </div>
      </div>
    </div>
  )
}
