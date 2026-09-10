import { CheckCircle2, X } from 'lucide-react'

export function PaymentSuccessModal({ isOpen, onClose, transactionId, amount, gateway }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/30 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={40} />
          </div>

          <h3 className="mt-4 text-xl font-bold text-white">Payment successful.</h3>
          <p className="mt-1 text-sm text-slate-400">
            Thank you for your generous contribution.
          </p>

          <div className="mt-6 w-full rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3 text-left text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Gateway</span>
              <span className="font-semibold text-white">{gateway || 'SafePay'}</span>
            </div>
            {amount && (
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid</span>
                <span className="font-semibold text-emerald-400">PKR {Number(amount).toLocaleString()}</span>
              </div>
            )}
            {transactionId && (
              <div className="flex justify-between text-slate-400">
                <span>Tracker / Ref</span>
                <span className="font-mono text-xs text-slate-200">{transactionId}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  )
}