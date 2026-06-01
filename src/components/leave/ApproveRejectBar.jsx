import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle, XCircle } from 'lucide-react'
import { approveLeaveThunk } from '../../features/leave/leaveThunks'
import { selectLeaveActionLoading } from '../../features/leave/leaveSelectors'
import RejectReasonModal from './RejectReasonModal'
import { Button, Tooltip } from '../ui'
import toast from 'react-hot-toast'

/**
 * ApproveRejectBar — inline approve + reject buttons for admin.
 * Only shown when leave.status === 'pending'.
 * Reject requires a reason (backend validation).
 */
const ApproveRejectBar = ({ leave }) => {
  const dispatch     = useDispatch()
  const actionLoading= useSelector(selectLeaveActionLoading)
  const isLoading    = actionLoading[leave.id] || false

  const [rejectOpen, setRejectOpen] = useState(false)

  const handleApprove = async () => {
    const result = await dispatch(approveLeaveThunk(leave.id))
    if (approveLeaveThunk.fulfilled.match(result)) {
      toast.success(`Congé approuvé pour ${leave.user?.name}`)
    } else {
      toast.error('Erreur lors de l\'approbation')
    }
  }

  if (leave.status !== 'pending') return null

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Tooltip content="Approuver">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-emerald-500
                       hover:bg-emerald-50 hover:text-emerald-600
                       dark:hover:bg-emerald-900/20"
            loading={isLoading}
            onClick={handleApprove}
          >
            {!isLoading && <CheckCircle className="h-4 w-4" />}
          </Button>
        </Tooltip>
        <Tooltip content="Refuser">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-400
                       hover:bg-red-50 hover:text-red-600
                       dark:hover:bg-red-900/20"
            disabled={isLoading}
            onClick={() => setRejectOpen(true)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>

      <RejectReasonModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        leave={leave}
      />
    </>
  )
}

export default ApproveRejectBar