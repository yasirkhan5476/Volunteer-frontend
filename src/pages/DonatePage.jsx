import { CreditCard, HandCoins, ShieldCheck, CheckCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEvents } from '../hooks/usePlatformData'
import { donationApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { PaymentSuccessModal } from './PaymentSuccessModal'

const gateways = [
  { name: 'SafePay', accent: 'from-violet-500/15 to-indigo-500/10', icon: 'S' },
]

const presets = [500, 1000, 5000]

const gatewayMap = {
  SafePay: 'SAFE_PAY',
}

export function DonatePage() {
  const { data: events = [] } = useEvents()
  const currentUser = useAuthStore((state) => state.user)

  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedGateway, setSelectedGateway] = useState('SafePay')
  const [amount, setAmount] = useState(1000)
  const [status, setStatus] = useState('IDLE') // IDLE, PENDING, SUCCESS, FAILED
  const [error, setError] = useState('')

  // Success Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDetails, setModalDetails] = useState({ tracker: '', gateway: '' })

  const pollingIntervalRef = useRef(null)
  const donationIdRef = useRef(null)

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [])

  // A redirect only returns to the page; the backend remains the source of truth.
  useEffect(() => {
    if (searchParams.size) {
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // 2. Poll backend verification endpoint every 3 seconds
  const startPaymentPolling = (donationId, tracker) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await donationApi.verify(donationId)
        const paymentState = response?.status

        if (paymentState === 'COMPLETED' || paymentState === 'PAID') {
          clearInterval(pollingIntervalRef.current)
          setStatus('SUCCESS')
          setModalDetails({ tracker, gateway: 'SafePay' })
          setIsModalOpen(true)
        }
      } catch (err) {
        console.warn('Polling verification check failed:', err)
      }
    }, 3000)
  }

  // 3. Initiate payment submission
  const handleSubmit = async () => {
    if (status === 'SUCCESS') return

    if (!amount || Number(amount) < 1) {
      setError('Please enter a valid donation amount.')
      return
    }

    setStatus('PENDING')
    setError('')

    try {
      const payload = {
        eventId: events[0]?.id || currentUser?.id,
        amount: Number(amount),
        currency: 'PKR',
        gateway: gatewayMap[selectedGateway] || 'SAFE_PAY',
        customerEmail: currentUser?.email || 'donor@alkhidmat.org',
        customerMobile: currentUser?.phone || '+923000000000',
        callbackUrl: `${window.location.origin}/donate`,
      }

      const result = await donationApi.create(payload)
      const donation = result?.donation || result?.data?.donation
      const donationId = donation?.id || result?.id || result?.data?.id
      donationIdRef.current = donationId

      if (selectedGateway === 'SafePay') {
        const redirectUrl =
          result?.redirectUrl ||
          result?.data?.redirectUrl ||
          result?.data?.data?.redirectUrl

        const tracker =
          result?.gatewayRef ||
          result?.data?.gatewayRef ||
          result?.tracker ||
          result?.data?.tracker

        const callback = encodeURIComponent(`${window.location.origin}/donate`)
        const finalUrl =
          redirectUrl ||
          `https://sandbox.api.getsafepay.com/checkout/pay?beacon=${tracker}&tracker=${tracker}&env=sandbox&source=custom&passthrough=true&redirect_url=${callback}&cancel_url=${callback}`

        if (finalUrl) {
          // Open payment gateway in new tab
          window.open(finalUrl, '_blank', 'noopener,noreferrer')

          // Start polling backend for payment status updates
          if (donationId && tracker) {
            startPaymentPolling(donationId, tracker)
          }
        } else {
          setError('Failed to obtain checkout URL from payment gateway.')
          setStatus('FAILED')
        }
      }
    } catch (err) {
      setStatus('FAILED')
      setError(
        err?.response?.data?.message || 'Donation failed. Please try again.'
      )
    }
  }

  const statusColors = {
    IDLE: 'bg-slate-700 text-slate-200',
    PENDING: 'bg-amber-500/15 text-amber-200',
    SUCCESS: 'bg-emerald-500/15 text-emerald-200',
    FAILED: 'bg-rose-500/15 text-rose-200',
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      {/* ─── Success Modal ─── */}
      <PaymentSuccessModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
        }}
        transactionId={modalDetails.tracker}
        gateway={modalDetails.gateway}
      />

      {/* ─── Gateway & Amount ─── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
            <HandCoins size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
              Donation portal
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              Support life-changing aid
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* Amount presets */}
          <div>
            <p className="mb-3 text-sm font-medium text-slate-300">
              Choose amount
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={status === 'SUCCESS'}
                  onClick={() => setAmount(preset)}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    amount === preset
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-700 bg-slate-800 text-slate-200'
                  }`}
                >
                  PKR {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <label
              htmlFor="customAmount"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Custom amount (PKR)
            </label>
            <input
              id="customAmount"
              type="number"
              min="1"
              disabled={status === 'SUCCESS'}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Gateway selection */}
          <div>
            <p className="mb-3 text-sm font-medium text-slate-300">
              Payment gateway
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {gateways.map((gateway) => (
                <button
                  key={gateway.name}
                  type="button"
                  disabled={status === 'SUCCESS'}
                  onClick={() => setSelectedGateway(gateway.name)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedGateway === gateway.name
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gateway.accent} text-lg font-bold text-white`}
                  >
                    {gateway.icon}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {gateway.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Checkout panel ─── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-300">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
              Checkout
            </p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              Secure payment
            </h3>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Donor</span>
            <span className="font-medium text-white">
              {currentUser?.email || 'Not logged in'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Selected gateway</span>
            <span className="font-medium text-white">{selectedGateway}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Amount</span>
            <span className="text-lg font-semibold text-white">
              PKR {Number(amount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Status
          </p>
          <div
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[status]}`}
          >
            {status === 'IDLE' ? 'Awaiting payment' : status}
          </div>
          {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
        </div>

        {/* Dynamic Action Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={status === 'PENDING' || status === 'SUCCESS'}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            status === 'SUCCESS'
              ? 'bg-emerald-500 text-slate-950 cursor-default'
              : 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70'
          }`}
        >
          {status === 'SUCCESS' ? (
            <>
              <CheckCircle size={18} />
              Payment Successful!
            </>
          ) : status === 'PENDING' ? (
            'Processing & Awaiting Payment…'
          ) : (
            <>
              <ShieldCheck size={18} />
              Continue to secure payment
            </>
          )}
        </button>
      </div>
    </div>
  )
}