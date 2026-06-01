import { useSelector } from 'react-redux'
import { motion }      from 'framer-motion'
import { FileText }    from 'lucide-react'
import {
  selectMyLeaveList,
  selectMyLeaveMeta,
  selectMyLeaveLoading,
} from '../../features/leave/leaveSelectors'
import { fetchMyLeaveRequestsThunk } from '../../features/leave/leaveThunks'
import { useDispatch }     from 'react-redux'
import LeaveStatusBadge    from './LeaveStatusBadge'
import LeaveTypeBadge      from './LeaveTypeBadge'
import { Skeleton, EmptyState, Pagination } from '../ui'
import { formatDate }      from '../../utils/formatters'
import { differenceInCalendarDays, parseISO } from 'date-fns'

/**
 * LeaveHistoryTable — employee's own leave request history.
 *
 * Data: GET /v1/me/leave-requests (paginate 15, no relations loaded)
 * So user data is NOT available — we show only leave fields.
 */
const LeaveHistoryTable = () => {
  const dispatch = useDispatch()
  const list     = useSelector(selectMyLeaveList)
  const meta     = useSelector(selectMyLeaveMeta)
  const loading  = useSelector(selectMyLeaveLoading)

  if (loading && list.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton.Block key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucune demande de congé"
        description="Vos demandes de congé apparaîtront ici une fois soumises."
        size="sm"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Mes demandes ({meta?.total || list.length})
      </p>

      <div className="space-y-2">
        {list.map((leave, i) => {
          const days = leave.start_date && leave.end_date
            ? differenceInCalendarDays(
                parseISO(leave.end_date),
                parseISO(leave.start_date)
              ) + 1
            : null

          return (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-surface-100 bg-white p-4
                         dark:border-dark-600 dark:bg-dark-700"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Date range + type */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <LeaveTypeBadge type={leave.type} />
                    {days && (
                      <span className="text-2xs text-slate-400">
                        {days} jour{days > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                    {leave.reason}
                  </p>
                </div>

                {/* Status */}
                <LeaveStatusBadge status={leave.status} />
              </div>

              {/* Rejection reason */}
              {leave.status === 'rejected' && leave.rejection_reason && (
                <div className="mt-3 rounded-lg border border-red-100
                                bg-red-50 px-3 py-2 dark:border-red-900/30
                                dark:bg-red-900/10">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    <span className="font-medium">Motif du refus :</span>{' '}
                    {leave.rejection_reason}
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={(page) => dispatch(fetchMyLeaveRequestsThunk({ page }))}
        />
      )}
    </div>
  )
}

export default LeaveHistoryTable