import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion }                   from 'framer-motion'
import { fetchLeaveRequestsThunk }  from '../../features/leave/leaveThunks'
import {
  selectAdminLeaveFilters,
  selectAdminLeaveMeta,
  selectAdminLeaveList,
  selectApproveResult,
} from '../../features/leave/leaveSelectors'
import { clearApproveResult } from '../../features/leave/leaveSlice'
import LeaveFilters       from '../../components/leave/LeaveFilters'
import LeaveRequestTable  from '../../components/leave/LeaveRequestTable'
import ReplacementSuggestions from '../../components/leave/ReplacementSuggestions'
import { Badge }          from '../../components/ui'
import axiosInstance      from '../../services/axiosInstance'
import { API }            from '../../constants/apiRoutes'
import { useState }       from 'react'

/**
 * LeaveRequestsPage — /admin/leave-requests
 *
 * Admin manages all leave requests:
 * - Filter by status and employee
 * - Approve (no body, one click)
 * - Reject (requires rejection_reason in modal)
 *
 * Backend:
 *   GET  /v1/leave-requests?status=&user_id=&page=
 *   POST /v1/leave-requests/{id}/approve
 *   POST /v1/leave-requests/{id}/reject { rejection_reason }
 *
 * Only pending requests can be approved/rejected (backend enforced).
 */
const LeaveRequestsPage = () => {
  const dispatch     = useDispatch()
  const filters      = useSelector(selectAdminLeaveFilters)
  const meta         = useSelector(selectAdminLeaveMeta)
  const list         = useSelector(selectAdminLeaveList)
  const approveResult = useSelector(selectApproveResult)
  const [employees, setEmployees] = useState([])

  const fetchLeaves = useCallback(() => {
    dispatch(fetchLeaveRequestsThunk({
      status:  filters.status  || undefined,
      user_id: filters.user_id || undefined,
    }))
  }, [dispatch, filters])

  useEffect(() => {
    fetchLeaves()
  }, [fetchLeaves])

  // Fetch employees for filter dropdown
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(API.EMPLOYEES.LIST, {
          params: { per_page: 100 },
        })
        setEmployees(res.data.data || [])
      } catch {}
    }
    fetch()
  }, [])

  // Count pending
  const pendingCount = list.filter((l) => l.status === 'pending').length

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Demandes de Congés
            </h1>
            {pendingCount > 0 && (
              <Badge variant="warning">{pendingCount} en attente</Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-400">
            {meta?.total || list.length} demande{(meta?.total || list.length) > 1 ? 's' : ''} au total
          </p>
        </div>
      </motion.div>

      {/* Replacement suggestions banner */}
      {approveResult && (
        <ReplacementSuggestions
          suggestions={approveResult.replacement_suggestions || []}
          planningRemoved={approveResult.planning_removed || 0}
          onDismiss={() => dispatch(clearApproveResult())}
        />
      )}

      {/* Filters */}
      <LeaveFilters
        employees={employees}
        onFiltersChange={fetchLeaves}
      />

      {/* Table */}
      <LeaveRequestTable onRefresh={fetchLeaves} />
    </div>
  )
}

export default LeaveRequestsPage