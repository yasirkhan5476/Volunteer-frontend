import { Check, LoaderCircle, X } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api'

export function AdminApprovalQueue() {
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState('')
  const [processingId, setProcessingId] = useState(null)
  const { data: approvals = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'approvals'],
    queryFn: adminApi.listApprovals,
  })

  const updateStatus = async (id, status) => {
    setProcessingId(id)
    setFeedback('')
    try {
      await adminApi.updateOrganizerStatus(id, status)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'approvals'] })
      setFeedback(`Application ${status.toLowerCase()} successfully.`)
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to update this application.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Verification queue</p>
          <h3 className="mt-2 text-2xl font-bold text-white">Pending organizer applications</h3>
        </div>
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm text-amber-200">{approvals.length} pending</span>
      </div>

      {feedback && <p className="mb-4 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">{feedback}</p>}
      {isError && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-3 text-sm text-rose-200">Unable to load organizer applications.</p>}
      {isLoading && <p className="text-sm text-slate-400">Loading applications...</p>}
      {!isLoading && !isError && approvals.length === 0 && <p className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-8 text-center text-slate-400">No pending organizer applications.</p>}

      {!isLoading && !isError && approvals.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {approvals.map((applicant) => (
                <tr key={applicant.id} className="text-slate-200">
                  <td className="px-4 py-4 font-medium">{applicant.firstName} {applicant.lastName}</td>
                  <td className="px-4 py-4 text-slate-400">{applicant.email}</td>
                  <td className="px-4 py-4 text-slate-400">{new Date(applicant.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4"><div className="flex gap-2">
                    <button type="button" disabled={processingId === applicant.id} onClick={() => updateStatus(applicant.id, 'APPROVED')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-50"><Check size={14} /> Approve</button>
                    <button type="button" disabled={processingId === applicant.id} onClick={() => updateStatus(applicant.id, 'REJECTED')} className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/25 disabled:opacity-50">{processingId === applicant.id ? <LoaderCircle className="animate-spin" size={14} /> : <X size={14} />} Reject</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
