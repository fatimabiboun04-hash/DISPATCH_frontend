import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { rejectLeaveThunk } from '../../features/leave/leaveThunks'
import { Modal, Button } from '../ui'
import toast from 'react-hot-toast'

/**
 * RejectReasonModal — admin must provide a rejection reason.
 * Backend reject() requires: { rejection_reason: required string max:1000 }
 */
const RejectReasonModal = ({ open, onClose, leave }) => {
  const dispatch = useDispatch()
  const [reason,     setReason]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Le motif de refus est obligatoire')
      return
    }
    if (reason.trim().length < 5) {
      setError('Le motif doit contenir au moins 5 caractères')
      return
    }
    setError('')
    setSubmitting(true)
    const result = await dispatch(rejectLeaveThunk({
      id:               leave.id,
      rejection_reason: reason.trim(),
    }))
    setSubmitting(false)
    if (rejectLeaveThunk.fulfilled.match(result)) {
      toast.success('Demande refusée')
      setReason('')
      onClose()
    } else {
      toast.error('Erreur lors du refus')
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => { setReason(''); setError(''); onClose() }}
      title="Refuser la demande de congé"
      subtitle={leave ? `${leave.user?.name} — ${leave.start_date} → ${leave.end_date}` : ''}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => { setReason(''); setError(''); onClose() }}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            loading={submitting}
            onClick={handleReject}
          >
            Confirmer le refus
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium
                            text-slate-700 dark:text-slate-300">
            Motif du refus <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Expliquez la raison du refus à l'employé…"
            className="w-full resize-none rounded-xl border border-surface-200
                       bg-white px-3 py-2.5 text-sm text-slate-700
                       placeholder-slate-400 outline-none transition-all
                       focus:border-red-400 focus:ring-2 focus:ring-red-400/20
                       dark:border-dark-400 dark:bg-dark-700 dark:text-slate-200"
          />
          {error && (
            <p className="mt-1 text-xs text-red-500">{error}</p>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Ce motif sera envoyé par email à l'employé automatiquement.
        </p>
      </div>
    </Modal>
  )
}

export default RejectReasonModal