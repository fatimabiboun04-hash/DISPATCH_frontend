import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle, XCircle } from 'lucide-react'
import { approveLeaveThunk } from '../../features/leave/leaveThunks'
import {
  selectLeaveActionLoading,
  selectApproveConflict,
} from '../../features/leave/leaveSelectors'
import { clearApproveConflict } from '../../features/leave/leaveSlice'
import ConflictWarningDialog from './ConflictWarningDialog'
import RejectReasonModal from './RejectReasonModal'
import { Button, Tooltip } from '../ui'
import toast from 'react-hot-toast'

/**
 * ApproveRejectBar — inline approve + reject buttons for admin.
 *
 * Flow:
 * 1. Click approve → dispatches without force
 * 2. If backend detects planning conflicts → shows ConflictWarningDialog
 * 3. Admin confirms → dispatches with force=true → planning removed
 * 4. Replacement suggestions appear at the page level (LeaveRequestsPage)
 */
const ApproveRejectBar = ({ leave }) => {
  const dispatch       = useDispatch()
  const actionLoading  = useSelector(selectLeaveActionLoading)
  const approveConflict = useSelector(selectApproveConflict)
  const isLoading      = actionLoading[leave.id] || false

  const [rejectOpen, setRejectOpen] = useState(false)

  // Conflict dialog for this specific leave
  const hasConflict = approveConflict?.leaveId === leave.id
  const conflictCount = approveConflict?.conflict_count || 0
  const conflicts = approveConflict?.conflicts || []

  const handleApprove = async () => {
    // First click: try without force
    const result = await dispatch(approveLeaveThunk({ id: leave.id, force: false }))
    // If fulfilled (no conflicts), show success
    if (approveLeaveThunk.fulfilled.match(result)) {
      toast.success(`Congé approuvé pour ${leave.user?.name}`)
      if (result.payload?.planning_removed > 0) {
        toast.success(`${result.payload.planning_removed} planning(s) retiré(s)`)
      }
    }
    // If rejected due to conflict, dialog shows automatically via Redux
  }

  const handleForceApprove = async () => {
    // Second click: force approve (removes planning)
    const result = await dispatch(approveLeaveThunk({ id: leave.id, force: true }))
    dispatch(clearApproveConflict())
    if (approveLeaveThunk.fulfilled.match(result)) {
      toast.success(`Congé approuvé — ${result.payload?.planning_removed || 0} planning(s) retiré(s)`)
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

      {/* Conflict warning dialog */}
      <ConflictWarningDialog
        open={hasConflict}
        onClose={() => dispatch(clearApproveConflict())}
        onConfirm={handleForceApprove}
        conflicts={conflicts}
        conflictCount={conflictCount}
        loading={isLoading}
        employeeName={leave.user?.name || ''}
      />

      <RejectReasonModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        leave={leave}
      />
    </>
  )
}

export default ApproveRejectBar
