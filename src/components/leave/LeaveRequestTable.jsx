import { motion }    from 'framer-motion'
import { FileText }  from 'lucide-react'
import { useSelector } from 'react-redux'
import {
  selectAdminLeaveList,
  selectAdminLeaveMeta,
  selectAdminLeaveLoading,
  selectAdminLeaveError,
} from '../../features/leave/leaveSelectors'
import { setAdminFilters } from '../../features/leave/leaveSlice'
import { useDispatch }     from 'react-redux'
import ApproveRejectBar    from './ApproveRejectBar'
import LeaveStatusBadge    from './LeaveStatusBadge'
import LeaveTypeBadge      from './LeaveTypeBadge'
import {
  Avatar, Skeleton, EmptyState, ErrorState, Pagination,
} from '../ui'
import { formatDate } from '../../utils/formatters'
import { differenceInCalendarDays, parseISO } from 'date-fns'

/**
 * LeaveRequestTable — admin view of all leave requests.
 *
 * Columns: Employee | Type | Dates | Duration | Status | Actions
 *
 * Backend: GET /v1/leave-requests?status=&user_id=&page=
 * Returns paginatedResponse (paginate 20), loads user.
 *
 * approve() / reject() — only allowed on pending requests.
 * Backend returns 422 'Leave request already processed' otherwise.
 */
const LeaveRequestTable = ({ onRefresh }) => {
  const dispatch = useDispatch()
  const list     = useSelector(selectAdminLeaveList)
  const meta     = useSelector(selectAdminLeaveMeta)
  const loading  = useSelector(selectAdminLeaveLoading)
  const error    = useSelector(selectAdminLeaveError)

  if (loading && list.length === 0) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white
                      dark:border-dark-600 dark:bg-dark-700">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5
                                  border-b border-surface-100 last:border-0
                                  dark:border-dark-600">
            <Skeleton.Circle size="h-8 w-8" />
            <Skeleton.Line width="w-32" height="h-3.5" />
            <Skeleton.Line width="w-20" height="h-5 rounded-full" />
            <Skeleton.Line width="w-36" height="h-3" />
            <Skeleton.Line width="w-16" height="h-5 rounded-full" />
            <Skeleton.Line width="w-24" height="h-7 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRefresh} />
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucune demande de congé"
        description="Les demandes de congé de vos employés apparaîtront ici."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-surface-200
                      bg-white dark:border-dark-600 dark:bg-dark-700">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50
                           dark:border-dark-600 dark:bg-dark-800">
              {['Employé', 'Type', 'Période', 'Durée', 'Motif', 'Statut', 'Actions']
                .map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-2xs font-semibold
                                          uppercase tracking-wider text-slate-500
                                          dark:text-slate-400">
                    {h}
                  </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-dark-600">
            {list.map((leave, i) => {
              const days = differenceInCalendarDays(
                parseISO(leave.end_date),
                parseISO(leave.start_date)
              ) + 1

              return (
                <motion.tr
                  key={leave.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group transition-colors hover:bg-surface-50
                             dark:hover:bg-dark-600"
                >
                  {/* Employee */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={leave.user?.avatar_url}
                        name={leave.user?.name}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium
                                      text-slate-800 dark:text-slate-100">
                          {leave.user?.name || '—'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <LeaveTypeBadge type={leave.type} />
                  </td>

                  {/* Dates */}
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {formatDate(leave.start_date)}
                    </p>
                    <p className="text-2xs text-slate-400">
                      → {formatDate(leave.end_date)}
                    </p>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-slate-700
                                     dark:text-slate-200">
                      {days} j
                    </span>
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-3.5 max-w-48">
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {leave.reason}
                    </p>
                    {leave.rejection_reason && (
                      <p className="mt-0.5 truncate text-2xs text-red-500">
                        Refus: {leave.rejection_reason}
                      </p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <LeaveStatusBadge status={leave.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <ApproveRejectBar leave={leave} />
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={(page) => dispatch(setAdminFilters({ page }))}
        />
      )}
    </div>
  )
}

export default LeaveRequestTable